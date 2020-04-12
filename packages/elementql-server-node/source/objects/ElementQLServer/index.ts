import http, {
    IncomingMessage,
    ServerResponse,
} from 'http';
import path from 'path';
import fs, {
    promises as fsPromise,
} from 'fs';
import crypto from 'crypto';

import open from 'open';

import typescript from 'typescript';
import Terser from 'terser';

// import ElementQLParser from '@plurid/elementql-parser';

import {
    indexing,
    uuid,
} from '@plurid/plurid-functions';

import {
    ElementQLServerOptions,
    InternalElementQLServerOptions,

    ElementQLJSONRequest,
    ElementQLResponse,
    ElementQLResponseFile,
    ElementQLJSON,

    ProcessedElementQL,
    ProcessedElementQLFile,
    ProcessedElementQLTranspile,
    ElementQLMetadataFile,
    ElementQLStore,
    ElementQL,
    ElementID,

    Libraries,
} from '../../data/interfaces';

import {
    isProduction,

    DEFAULT_PROTOCOL,
    DEFAULT_DOMAIN,
    DEFAULT_PORT,

    DEFAULT_ELEMENTQL_ROOT_DIRECTORY,
    DEFAULT_ELEMENTQL_BUILD_DIRECTORY,
    DEFAULT_ELEMENTQL_NODE_MODULES_DIRECTORY,
    DEFAULT_ELEMENTQL_ELEMENTQL_DIRECTORY,
    DEFAULT_ELEMENTQL_TRANSPILES_DIRECTORY,

    DEFAULT_ELEMENTS_DIRECTORIES,
    DEFAULT_LIBRARIES,
    DEFAULT_ENDPOINT,
    DEFAULT_ALLOW_ORIGIN,
    DEFAULT_ALLOW_HEADERS,
    DEFAULT_PLUGINS,

    DEFAULT_VERBOSE,
    DEFAULT_OPEN,
    DEFAULT_PLAYGROUND,
    DEFAULT_PLAYGROUND_ENDPOINT,
    DEFAULT_FAVICON,

    DEFAULT_STORE,
    DEFAULT_METADATA_FILENAME,

    FILE_TYPE_JS,
    FILE_TYPE_CSS,

    METHOD_GET,
    METHOD_POST,

    HEADER_CONTENT_TYPE,
    HEADER_CONTENT_LENGTH,

    HEADER_TEXT_JAVASCRIPT,
    HEADER_TEXT_CSS,
    HEADER_TEXT_PLAIN,

    APPLICATION_ELEMENTQL,
    APPLICATION_JSON,

    HTTP_OK,
    HTTP_BAD_REQUEST,
    HTTP_NOT_FOUND,
    HTTP_METHOD_NOT_ALLOWED,
    HTTP_UNSUPPORTED_MEDIA_TYPE,
} from '../../data/constants';

import {
    indexHTML,

    checkAvailablePort,
    extractFileImports,
    computeElementBaseName,
} from '../../utilities';



class ElementQLServer {
    private options: InternalElementQLServerOptions;
    private elementsURLs: Map<string, ElementID> = new Map();
    private elementsRegistry: Map<string, ElementQL> = new Map();
    private server: http.Server;


    constructor(
        options?: ElementQLServerOptions,
    ) {
        this.options = this.handleOptions(options);

        this.generateDirectories();
        this.registerElements();

        this.server = http.createServer(
            (request, response) => this.createServer(
                request,
                response,
                this.options,
            ),
        );

        process.addListener('SIGINT', () => {
            this.stop();
            process.exit(0);
        });
    }


    /**
     * Start the ElementQL Server.
     *
     * @param callback
     */
    public async start(
        callback?: (server: http.Server) => void,
    ) {
        try {
            const port = await checkAvailablePort(this.options.port);
            this.options.port = port;

            const {
                protocol,
                domain,
                open: openServer,
            } = this.options;

            const serverlink = protocol + '://' + domain + ':' + port;
            if (this.options.verbose) {
                console.log(`\n\tElementQL Server Started on Port ${port}: ${serverlink}\n`);
            }

            this.server.listen(port);

            if (callback) {
                callback(this.server);
            }

            if (openServer) {
                open(serverlink);
            }
        } catch (error) {
            if (this.options.verbose) {
                console.log('\n\tSomething Went Wrong. ElementQL Server Could Not Start.\n');
            }
            return;
        }
    }

    /**
     * Stop the ElementQL Server.
     *
     * @param callback
     */
    public async stop(
        callback?: (server: http.Server) => Promise<void>,
    ) {
        try {
            if (this.options.verbose) {
                console.log(`\n\tElementQL Server Closed on Port ${this.options.port}\n`);
            }

            if (callback) {
                await callback(this.server);
            }

            if (this.server.listening) {
                this.server.close();
            }
        } catch (error) {
            if (this.options.verbose) {
                console.log('\n\tSomething Went Wrong. ElementQL Server Could Not Stop.\n');
            }
            return;
        }
    }

    /**
     * Obliterate the `build` directory.
     */
    public cleanup() {
        this.obliterateDirectories();
    }



    /** OPTIONS */
    private handleOptions(
        options?: ElementQLServerOptions,
    ) {
        const internalOptions: InternalElementQLServerOptions = {
            protocol: options?.protocol || DEFAULT_PROTOCOL,
            domain: options?.domain || DEFAULT_DOMAIN,
            port: options?.port || DEFAULT_PORT,

            rootDirectory: options?.rootDirectory
                ? options?.rootDirectory
                : options?.store
                    ? '/'
                    : DEFAULT_ELEMENTQL_ROOT_DIRECTORY,
            buildDirectory: options?.buildDirectory || DEFAULT_ELEMENTQL_BUILD_DIRECTORY,
            nodeModulesDirectory: options?.nodeModulesDirectory || DEFAULT_ELEMENTQL_NODE_MODULES_DIRECTORY,
            elementqlDirectory: options?.elementqlDirectory || DEFAULT_ELEMENTQL_ELEMENTQL_DIRECTORY,
            transpilesDirectory: options?.transpilesDirectory || DEFAULT_ELEMENTQL_TRANSPILES_DIRECTORY,

            elementsDirectories: typeof options?.elementsDirectories === 'undefined'
                ? DEFAULT_ELEMENTS_DIRECTORIES
                : [ ...options?.elementsDirectories ],
            libraries: options?.libraries || DEFAULT_LIBRARIES,
            endpoint: options?.endpoint || DEFAULT_ENDPOINT,
            allowOrigin: options?.allowOrigin || DEFAULT_ALLOW_ORIGIN,
            allowHeaders: options?.allowHeaders || DEFAULT_ALLOW_HEADERS,
            plugins: options?.plugins || DEFAULT_PLUGINS,

            verbose: options?.verbose ?? DEFAULT_VERBOSE,
            open: options?.open ?? DEFAULT_OPEN,
            playground: options?.playground ?? DEFAULT_PLAYGROUND,
            playgroundEndpoint: options?.playgroundEndpoint || DEFAULT_PLAYGROUND_ENDPOINT,
            favicon: options?.favicon || DEFAULT_FAVICON,
            html: options?.html || indexHTML,
            logger: options?.logger || this.logger,

            store: options?.store || DEFAULT_STORE,
            metadataFilename: options?.metadataFilename || DEFAULT_METADATA_FILENAME,
        };

        return internalOptions;
    }


    /** DIRECTORIES */
    private generateDirectories() {
        const {
            rootDirectory,
            buildDirectory,
            elementqlDirectory,
            transpilesDirectory,
            verbose,
        } = this.options;

        try {
            const elementQLDirectory = path.join(
                rootDirectory,
                buildDirectory,
                elementqlDirectory,
            );
            if (!fs.existsSync(elementQLDirectory)) {
                fs.mkdirSync(elementQLDirectory, {
                    recursive: true,
                });
            }

            const transpilesDirectoryPath = path.join(
                elementQLDirectory,
                transpilesDirectory,
            );
            if (!fs.existsSync(transpilesDirectoryPath)) {
                fs.mkdirSync(transpilesDirectoryPath, {
                    recursive: true,
                });
            } else {
                fs.rmdirSync(transpilesDirectoryPath, {
                    recursive: true,
                });
                fs.mkdirSync(transpilesDirectoryPath);
            }
        } catch (error) {
            if (verbose) {
                console.log('\n\tSomething Went Wrong. ElementQL Server Could Not Generate Directories.\n');
            }
            return;
        }
    }

    private obliterateDirectories() {
        const {
            rootDirectory,
            buildDirectory,
        } = this.options;

        const buildDirectoryPath = path.join(
            rootDirectory,
            buildDirectory,
        );

        fs.rmdirSync(buildDirectoryPath, {
            recursive: true,
        });
    }


    /** ELEMENTS */
    private async registerElements() {
        const {
            store,
            verbose,
        } = this.options;

        try {
            if (store) {
                await this.registerStoreElements(store);
                return;
            }

            await this.registerLocalElements();
            return;
        } catch (error) {
            if (verbose) {
                console.log('\n\tSomething Went Wrong. ElementQL Server Could Not Register Elements.\n');
            }
            return;
        }
    }

    private async registerStoreElements(
        store: ElementQLStore,
    ) {
        const {
            metadataFilename,
        } = this.options;

        const metadataRaw = (await store.download(metadataFilename)).toString();
        const metadata: ElementQLMetadataFile = JSON.parse(metadataRaw);
        const {
            elements,
        } = metadata;
        for (const element of elements) {
            const {
                transpiles,
            } = element;

            for (const transpile of Object.values(transpiles)) {
                const {
                    path,
                } = transpile;

                // download file?
            }
        }
    }

    private async registerLocalElements() {
        // TODO
        // in case of a shared persistent root/volume (Kubernetes)
        // to check if there isn't an already defined metadata file
        // and verify the local elements against the already registered ones
        // if all is already registered, simply load into memory
        const registeredLocalElements = await this.handleLocalMetadataFile();
        if (registeredLocalElements) {
            return;
        }

        const {
            rootDirectory,
            buildDirectory,
            elementsDirectories,
        } = this.options;

        for (const elementsDirectory of elementsDirectories) {
            const elementsPath = path.join(
                rootDirectory,
                buildDirectory,
                elementsDirectory,
            );
            const elements = await this.extractElementsFromPath(
                elementsPath,
                elementsDirectory,
            );
            for (const element of elements) {
                await this.registerProcessedElement(element);
            }
        }

        this.elementsRegistry.forEach(async (registeredElement) => {
            await this.resolveImports(registeredElement);
        });

        await this.writeMetadataFile();
    }


    /** SERVER */
    private createServer(
        request: IncomingMessage,
        response: ServerResponse,
        options: InternalElementQLServerOptions,
    ) {
        if (!request.url) {
            response.statusCode = HTTP_BAD_REQUEST;
            response.end();
            return;
        }

        const {
            verbose,
            logger,
            endpoint,
            playground,
            playgroundEndpoint,
            favicon,
            html,
        } = options;

        if (verbose) {
            logger(request);
        }

        this.handleHeaders(request, response, options);

        if (request.method === 'OPTIONS') {
            response.writeHead(200);
            response.end();
            return;
        }

        if (request.url === endpoint) {
            this.handleEndpoint(request, response);
            return;
        }

        if (this.elementsURLs.has(request.url)) {
            this.handleRequest(request, response);
            return;
        }

        if (request.url.includes('/library')) {
            this.handleLibrary(request, response);
            return;
        }

        if (playground && request.url === playgroundEndpoint) {
            this.handlePlayground(request, response);
            return;
        }

        if (request.url === '/favicon.ico') {
            response.writeHead(
                HTTP_OK,
                { HEADER_CONTENT_TYPE: 'image/x-icon' },
            );
            fs.createReadStream(favicon).pipe(response);
            return;
        }

        response.statusCode = HTTP_OK;
        response.end(html(''));
        return;
    }

    private handleHeaders(
        request: IncomingMessage,
        response: ServerResponse,
        options: InternalElementQLServerOptions,
    ) {
        const {
            protocol,
            allowOrigin,
            allowHeaders,
        } = options;

        /** Handle headers. */
        const host = request.headers.host || '';
        const origin = protocol + '://' + host;
        const resolvedOrigin = allowOrigin.includes('*')
            ? '*'
            : allowOrigin.includes(origin)
                ? origin
                : 'null';
        response.setHeader('Access-Control-Allow-Origin', resolvedOrigin);
        response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
        response.setHeader('Access-Control-Allow-Headers', allowHeaders.join(', '));
    }

    private async handleEndpoint(
        request: IncomingMessage,
        response: ServerResponse,
    ) {
        const {
            html,
        } = this.options;

        const invalidElementQLQuery = 'Not a Valid ElementQL Query';

        if (request.method === METHOD_GET) {
            response.statusCode = HTTP_METHOD_NOT_ALLOWED;
            response.end(html(invalidElementQLQuery.toLowerCase()));
            return;
        }

        if (request.method !== METHOD_POST) {
            response.statusCode = HTTP_METHOD_NOT_ALLOWED;
            response.end(invalidElementQLQuery);
            return;
        }

        const contentType = request.headers[HEADER_CONTENT_TYPE.toLowerCase()];
        switch (contentType) {
            case APPLICATION_ELEMENTQL:
                this.handleEndpointRequest(request, response, 'elementql');
                return;
            case APPLICATION_JSON:
                this.handleEndpointRequest(request, response, 'json');
                return;
            default:
                response.statusCode = HTTP_UNSUPPORTED_MEDIA_TYPE;
                response.end(invalidElementQLQuery);
                return;
        }
    }

    private async handleRequest(
        request: IncomingMessage,
        response: ServerResponse,
    ) {
        if (!request.url) {
            return;
        }

        const elementID = this.elementsURLs.get(request.url);
        if (!elementID) {
            this.requestNotFound(request, response);
            return;
        }

        const element = this.elementsRegistry.get(elementID);
        if (!element) {
            this.requestNotFound(request, response);
            return;
        }

        const elementFile = this.resolveElementFile(request.url, element);
        if (!elementFile) {
            this.requestNotFound(request, response);
            return;
        }

        const {
            type: fileType,
            path: filePath,
        } = elementFile;

        switch (fileType) {
            case FILE_TYPE_JS:
                response.setHeader(HEADER_CONTENT_TYPE, HEADER_TEXT_JAVASCRIPT);
                break;
            case FILE_TYPE_CSS:
                response.setHeader(HEADER_CONTENT_TYPE, HEADER_TEXT_CSS);
                break;
            default:
                response.setHeader(HEADER_CONTENT_TYPE, HEADER_TEXT_PLAIN);
        }

        const fileStat = fs.statSync(filePath);
        response.statusCode = HTTP_OK;
        response.setHeader(HEADER_CONTENT_LENGTH, fileStat.size);
        const readStream = fs.createReadStream(filePath)
        readStream.pipe(response);
    }

    private async handleLibrary(
        request: IncomingMessage,
        response: ServerResponse,
    ) {
        const {
            endpoint,
            rootDirectory,
            nodeModulesDirectory,
            libraries,
        } = this.options;

        const libraryNotFound = 'Library Not Found';

        try {
            const libraryData = request.url?.replace(endpoint + '/library/', '');

            if (!libraryData) {
                response.statusCode = HTTP_NOT_FOUND;
                response.end(libraryNotFound);
                return;
            }

            const librarySplit = libraryData.replace('.js', '').split('~');
            const libraryName = librarySplit[0];
            const libraryVersion = librarySplit[1] || 'latest';

            if (!libraryName) {
                response.statusCode = HTTP_NOT_FOUND;
                response.end(libraryNotFound);
                return;
            }

            let libraryResolver;
            for (const library of Object.keys(libraries)) {
                if (library === libraryName) {
                    libraryResolver = libraries[library as Libraries];
                }
            }

            if (!libraryResolver) {
                response.statusCode = HTTP_NOT_FOUND;
                response.end(libraryNotFound);
                return;
            }

            const libraryFile = isProduction
                ? libraryResolver.production
                : libraryResolver.development;

            const libraryPath = path.join(
                rootDirectory,
                nodeModulesDirectory,
                libraryName,
                libraryFile,
                // libraryResolver.production,
            );

            console.log('libraryName', libraryName);
            console.log('libraryVersion', libraryVersion);
            console.log('libraryPath', libraryPath);
            console.log('libraryResolver', libraryResolver);

            const fileStat = fs.statSync(libraryPath);
            response.statusCode = HTTP_OK;
            response.setHeader(HEADER_CONTENT_LENGTH, fileStat.size);
            response.setHeader(HEADER_CONTENT_TYPE, HEADER_TEXT_JAVASCRIPT);
            const readStream = fs.createReadStream(libraryPath)
            readStream.pipe(response);
            return;
        } catch (error) {
            response.statusCode = HTTP_NOT_FOUND;
            response.end(libraryNotFound);
            return;
        }
    }


    /** PLAYGROUND */
    private handlePlayground(
        request: IncomingMessage,
        response: ServerResponse,
    ) {
        const {
            html,
        } = this.options;

        response.end(html('playground in construction'));
        return;
    }


    /** UTILITIES */
    private async logger(
        request: IncomingMessage,
    ) {
        const date = new Date();

        console.log(`[${date.toLocaleTimeString()} - ${date.toLocaleDateString()}]: ${request.method} Request for ${request.url}`);
    }

    private requestNotFound(
        request: IncomingMessage,
        response: ServerResponse,
    ) {
        const notFound = `Could Not Find Element For ${request.url}.`;
        response.statusCode = HTTP_NOT_FOUND;
        response.setHeader(HEADER_CONTENT_TYPE, HEADER_TEXT_PLAIN);
        response.end(notFound);
        return;
    }

    private async parseBody(
        request: IncomingMessage,
        type: 'json' | 'elementql',
    ): Promise<ElementQLJSONRequest> {
        const bodyData = (): Promise<string> => {
            let body = '';
            return new Promise((resolve, reject) => {
                request.on('data', (chunk: Buffer) => {
                    body += chunk.toString();
                });

                request.on('error', (error) => {
                    reject(error);
                });

                request.on('end', () => {
                    resolve(body)
                });
            });
        }

        const body = await bodyData();

        switch (type) {
            case 'json':
                return JSON.parse(body);
            case 'elementql':
                // TODO
                // parse body elementql
                return JSON.parse(body);
                // return body;
        }
    }

    private async extractElementsFromPath(
        elementsPath: string,
        sourceDirectory: string,
        basename?: string,
    ) {
        const {
            rootDirectory,
            buildDirectory,
            elementsDirectories,
        } = this.options;

        const elements = await fsPromise.readdir(elementsPath);

        const elementBasename = computeElementBaseName(
            elementsPath,
            elementsDirectories,
            basename,
        );

        const processedElements: ProcessedElementQL[] = [];
        const files: ProcessedElementQLFile[] = [];

        for (const element of elements) {
            const elementFilePath = path.join(elementsPath, element);

            const isDirectory = fs.statSync(elementFilePath).isDirectory();
            if (isDirectory) {
                /** Handle directory */
                const directoryElements = await this.extractElementsFromPath(
                    elementFilePath,
                    sourceDirectory,
                    elementBasename,
                );
                processedElements.push(...directoryElements);
                continue;
            }

            /** Handle file */
            const file: ProcessedElementQLFile = await this.processElementFile(
                elementBasename,
                elementFilePath,
            );
            files.push(file);
        }

        const basePath = path.join(
            rootDirectory,
            buildDirectory,
            sourceDirectory,
        );

        const relativePath = path.relative(
            basePath,
            elementsPath,
        );

        if (files.length > 0) {
            const processedElement: ProcessedElementQL = {
                id: uuid.generate(),
                name: relativePath,
                files: indexing.create(files),
            };

            processedElements.push(processedElement);
        }

        return processedElements;
    }

    private async registerProcessedElement(
        element: ProcessedElementQL,
    ) {
        const elementql = await this.transpileElement(element);

        for (const transpile of Object.values(elementql.transpiles)) {
            this.elementsURLs.set(transpile.url, elementql.id);
        }

        this.elementsRegistry.set(elementql.id, elementql);
    }

    private resolveElementFile(
        requestURL: string,
        element: ElementQL,
    ) {
        const {
            transpiles,
        } = element;

        for (const transpile of Object.values(transpiles)) {
            if (transpile.url === requestURL) {
                return transpile;
            }
        }

        return;
    }

    private async transpileElement(
        element: ProcessedElementQL,
    ): Promise<ElementQL> {
        const {
            files,
        } = element;

        const transpiles: ProcessedElementQLTranspile[] = [];

        for (const file of Object.values(files)) {
            const transpiledFile = await this.transpileFile(file);
            transpiles.push(transpiledFile);
        }

        const elementql: ElementQL = {
            ...element,
            transpiles: indexing.create(transpiles),
        };
        return elementql;
    }

    private async transpileFile(
        file: ProcessedElementQLFile,
    ) {
        const {
            rootDirectory,
            buildDirectory,
            elementqlDirectory,
            transpilesDirectory,
            plugins,
        } = this.options;

        const {
            id,
            name,
            path: filePath,
            type: fileType,
        } = file;

        const transpilesDirectoryPath = path.join(
            rootDirectory,
            buildDirectory,
            elementqlDirectory,
            transpilesDirectory,
        );

        const fileContents = await fsPromise.readFile(filePath, 'utf-8');
        const hashSource = name + fileContents;
        const elementHash = crypto
            .createHash('md5')
            .update(hashSource)
            .digest('hex');

        const transpileFilename = elementHash + fileType;
        const transpilePath = path.join(
            transpilesDirectoryPath,
            transpileFilename,
        );

        const url = this.assembleElementURL(transpileFilename);

        if (plugins.length === 0) {
            await fsPromise.copyFile(
                filePath,
                transpilePath,
            );

            const transpile: ProcessedElementQLTranspile = {
                id: uuid.generate(),
                sourceID: id,
                name,
                path: transpilePath,
                type: fileType,
                url,
            };

            return transpile;
        }


        let updatedFileContents = fileContents;
        let updatedFileType = fileType;
        let typescriptOptions;
        let minifyOptions;

        const indexedPlugins: any = {}

        for (const plugin of plugins) {
            if (
                plugin === 'minify' ||
                (typeof plugin === 'object' && plugin.kind === 'minify')
            ) {
                const defaultMinifyOptions = {};
                minifyOptions = typeof plugin == 'object'
                    ? plugin.options || defaultMinifyOptions
                    : defaultMinifyOptions;

                indexedPlugins.minify = {
                    options: {
                        ...minifyOptions
                    },
                };
            }

            if (
                plugin === 'typescript' ||
                (typeof plugin === 'object' && plugin.kind === 'typescript')
            ) {
                const defaultTypescriptOptions: typescript.CompilerOptions = {
                    jsx: 2,
                    module: 99,
                };
                typescriptOptions = typeof plugin == 'object'
                    ? plugin.options || defaultTypescriptOptions
                    : defaultTypescriptOptions;

                indexedPlugins.typescript = {
                    options: {
                        ...typescriptOptions
                    },
                };
            }
        }

        if (indexedPlugins.typescript) {
            if (
                fileType === '.ts'
                || fileType === '.tsx'
            ) {
                const compiled = typescript.transpile(
                    updatedFileContents,
                    typescriptOptions,
                );

                updatedFileContents = compiled;
                updatedFileType = '.js';
            }
        }

        if (indexedPlugins.minify) {
            const terser = Terser.minify(
                updatedFileContents,
                minifyOptions,
            );
            const {
                code,
            } = terser;

            if (code) {
                updatedFileContents = code;
            }
        }

        const updatedTranspileFilename = elementHash + updatedFileType;
        const updatedTranspilePath = path.join(
            transpilesDirectoryPath,
            updatedTranspileFilename,
        );

        const updatedURL = this.assembleElementURL(updatedTranspileFilename);

        await fsPromise.writeFile(
            updatedTranspilePath,
            updatedFileContents,
        );

        const transpile: ProcessedElementQLTranspile = {
            id: uuid.generate(),
            sourceID: id,
            name,
            path: updatedTranspilePath,
            type: updatedFileType,
            url: updatedURL,
        };

        return transpile;
    }

    private assembleElementURL(
        routeURL: string,
    ) {
        const {
            endpoint,
        } = this.options;

        const slash = endpoint[endpoint.length - 1] === '/'
            ? ''
            : '/';
        const url = this.options.endpoint + slash + routeURL;

        return url;
    }

    private async processElementFile(
        elementName: string,
        elementFilePath: string,
    ) {
        const fileType = path.extname(elementFilePath);

        const imports = await extractFileImports(elementFilePath);

        const file: ProcessedElementQLFile = {
            id: uuid.generate(),
            name: elementName,
            type: fileType,
            path: elementFilePath,
            imports,
        };

        return file;
    }

    private async resolveImports(
        element: ElementQL,
    ) {
        const {
            files,
            transpiles,
        } = element;
        // console.log(element);

        const {
            protocol,
            domain,
            port,
            endpoint,
            rootDirectory,
            buildDirectory,
            libraries,
        } = this.options;

        for (const transpile of Object.values(transpiles)) {
            const {
                path: filePath,
                type: fileType,
                sourceID,
            } = transpile;
            const sourceFile = files[sourceID];
            const {
                path: sourceFilePath,
                imports,
            } = sourceFile;

            let transpileContents = await fsPromise.readFile(filePath, 'utf-8');

            const hostURL = protocol + '://' + domain + ':' + port + endpoint + '/';

            for (const importData of imports) {
                const {
                    library,
                    relative,
                    value,
                } = importData;

                const importValueRE = new RegExp(`('|")${value}('|")`);

                if (library) {
                    const libraryData = libraries[value as Libraries];
                    if (!libraryData) {
                        continue;
                    }
                    const {
                        module: moduleLibrary,
                    } = libraryData;

                    const moduleValue= moduleLibrary ? '-module' : '-global';
                    const replaceValue = '"' + hostURL + 'library' + moduleValue + '/' + value + '.js"';
                    transpileContents = transpileContents.replace(importValueRE, replaceValue);
                    continue;
                }

                if (relative) {
                    // based on the value get the id of the targeted transpile
                    // and get the import
                    const sourceFileDirectory = path.dirname(sourceFilePath);
                    const elementDirectory = path.resolve(
                        sourceFileDirectory,
                        value,
                    );
                    const basePath = path.join(
                        rootDirectory,
                        buildDirectory,
                    );
                    const basePathElement = path.relative(
                        basePath,
                        elementDirectory,
                    );
                    const indexElementsPath = basePathElement.indexOf('/');
                    const elementName = basePathElement.slice(indexElementsPath + 1);

                    let importElement;
                    for (const [_, registeredElement] of this.elementsRegistry) {
                        if (registeredElement.name === elementName) {
                            importElement = {
                                ...registeredElement,
                            };
                        }
                    }

                    if (!importElement) {
                        continue;
                    }

                    let linkedTranspileURL;
                    for (const transpile of Object.values(importElement.transpiles)) {
                        if (transpile.type === fileType) {
                            linkedTranspileURL = transpile.url;
                        }
                    }

                    if (!linkedTranspileURL) {
                        continue;
                    }

                    // console.log('sourceFileDirectory', sourceFileDirectory);
                    // console.log('basePathElement', basePathElement);
                    // console.log('value', value);
                    // console.log('elementName', elementName);

                    const replaceValue = '"' + protocol + '://' + domain + ':' + port + linkedTranspileURL + '"';
                    // console.log('replaceValue', replaceValue);

                    transpileContents = transpileContents.replace(importValueRE, replaceValue);
                    continue;
                }
            }

            fs.writeFileSync(
                filePath,
                transpileContents,
            );
        }

        // parse the file and check
        // 1. for imports for libraries
        // "library": "version" --> "http://example.com/elementql/node_modules/library@version"
        // 2. for relative imports
        // "./relative-import"  --> "http://example.com/elementql/<relative-element-id>.js"
    }

    private detectLibraries() {

    }

    private installLibraries() {

    }

    private async writeMetadataFile() {
        const {
            buildDirectory,
            elementqlDirectory,
            metadataFilename,
        } = this.options;

        const metadataFilePath = path.join(
            process.cwd(),
            buildDirectory,
            elementqlDirectory,
            metadataFilename,
        );

        const elements: ElementQL[] = [];
        for (const [_, element] of this.elementsRegistry) {
            elements.push({
                ...element,
            });
        }

        const data = {
            elements,
            generatedAt: Math.ceil(Date.now() / 1000),
        };

        const metadataFileContents = JSON.stringify(data, null, 4);

        await fsPromise.writeFile(
            metadataFilePath,
            metadataFileContents,
        );
    }

    private async readLocalMetadataFile() {
        try {
            const {
                rootDirectory,
                buildDirectory,
                elementqlDirectory,
                metadataFilename,
            } = this.options;

            const metadataFilePath = path.join(
                rootDirectory,
                buildDirectory,
                elementqlDirectory,
                metadataFilename,
            );

            const metadataContents = await fsPromise.readFile(metadataFilePath, 'utf-8');
            return JSON.parse(metadataContents);
        } catch (error) {
            return;
        }
    }

    private async handleLocalMetadataFile() {
        const data = await this.readLocalMetadataFile();
        return false;
    }



    private async handleEndpointRequest(
        request: IncomingMessage,
        response: ServerResponse,
        type: 'elementql' | 'json',
    ) {
        try {
            const body = await this.parseBody(
                request,
                type,
            );
            const {
                elements,
            } = body;
            const responseElements = await this.fetchResponseElements(elements);

            const responseData = {
                status: true,
                data: {
                    elements: [
                        ...responseElements,
                    ],
                },
            };

            response.setHeader(HEADER_CONTENT_TYPE, APPLICATION_JSON);
            response.end(JSON.stringify(responseData));
            return;
        } catch (error) {
            const badRequest = {
                status: false,
                error: {
                    path: 'elementQL/jsonRequest',
                    type: 'BAD_REQUEST',
                    mesage: 'Could not parse the JSON request.',
                },
            };
            response.statusCode = HTTP_BAD_REQUEST;
            response.setHeader(HEADER_CONTENT_TYPE, APPLICATION_JSON);
            response.end(JSON.stringify(badRequest));
            return;
        }
    }

    private async fetchResponseElements(
        elements: ElementQLJSON[],
    ) {
        const responseElements: ElementQLResponse[] = [];

        for (const element of elements) {
            for (const [_, registeredElement] of this.elementsRegistry) {
                if (registeredElement.name === element.name) {
                    const {
                        transpiles,
                        name,
                    } = registeredElement;

                    const files: ElementQLResponseFile[] = Object
                        .values(transpiles)
                        .map(transpile => {
                            const {
                                type,
                                url,
                            } = transpile;

                            return {
                                type,
                                url,
                            };
                        });

                    const responseElement: ElementQLResponse = {
                        name,
                        files,
                    };

                    responseElements.push(responseElement);
                }
            }
        }

        return responseElements;
    }
}


export default ElementQLServer;
