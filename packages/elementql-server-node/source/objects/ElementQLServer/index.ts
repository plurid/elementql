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

    ProcessedElementQL,
    ProcessedElementQLFile,
    ProcessedElementQLTranspile,
    ElementQLMetadataFile,
    ElementQLStore,
    ElementQL,
    ElementID,
} from '../../data/interfaces';

import {
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

    METHOD_GET,
    METHOD_POST,

    HEADER_CONTENT_TYPE,
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
            (request, response) => this.createServer(request, response, this.options),
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

            const serverlink = `http://localhost:${port}`;
            if (this.options.verbose) {
                console.log(`\n\tElementQL Server Started on Port ${port}: ${serverlink}\n`);
            }

            this.server.listen(port);

            if (callback) {
                callback(this.server);
            }

            if (this.options.open) {
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
            // MAYBE
            // return a special page with documentation/information
            response.statusCode = HTTP_METHOD_NOT_ALLOWED;
            response.end(html(invalidElementQLQuery.toLowerCase()));
            return;
        }

        if (request.method !== METHOD_POST) {
            response.statusCode = HTTP_METHOD_NOT_ALLOWED;
            response.end(invalidElementQLQuery);
            return;
        }

        const contentType = request.headers[HEADER_CONTENT_TYPE];
        switch (contentType) {
            case APPLICATION_ELEMENTQL:
                this.handleElementQLRequest(request, response);
                return;
            case APPLICATION_JSON:
                this.handleJSONRequest(request, response);
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

        const notFound = `Could not find element for ${request.url}.`;
        const elementID = this.elementsURLs.get(request.url);
        if (!elementID) {
            response.setHeader('content-type', 'text/plain');
            response.end(notFound);
            return;
        }

        const element = this.elementsRegistry.get(elementID);
        if (!element) {
            response.setHeader('content-type', 'text/plain');
            response.end(notFound);
            return;
        }

        const elementFile = this.resolveElementFile(request.url, element);

        if (!elementFile) {
            response.statusCode = HTTP_NOT_FOUND;
            response.end('Not Found.');
            return;
        }

        const {
            type: fileType,
            path: filePath,
        } = elementFile;

        switch (fileType) {
            case '.mjs':
            case '.js':
                response.setHeader('Content-Type', 'text/javascript');
                break;
            case '.css':
                response.setHeader('Content-Type', 'text/css');
                break;
        }

        const fileStat = fs.statSync(filePath);
        response.statusCode = HTTP_OK;
        response.setHeader('Content-Length', fileStat.size);
        const readStream = fs.createReadStream(filePath)
        readStream.pipe(response);
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

        console.log(`[${date.toLocaleTimeString()} - ${date.toLocaleDateString()}]: Request for ${request.url}`);
    }

    private async parseBody(
        request: IncomingMessage,
        type: 'json' | 'elementql',
    ): Promise<ElementQLJSONRequest | string> {
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
                return body;
        }
    }

    private async extractElementsFromPath(
        elementsPath: string,
        sourceDirectory: string,
        basename?: string,
    ) {
        // TODO
        // done - loop over elements recursively, checking if some are folders
        // resolve transpilation (from typesript-react to pure javascript or w/e the plugins say)
        // resolve dependencies - APage imports AHeader and AFooter from it's subfolders,
        // but maybe it also imports something else from the top

        const {
            elementsDirectories,
        } = this.options;

        // const elemPaths = typeof elementsPaths === 'string'
        //     ? [elementsPaths]
        //     : [...elementsPaths];

        const isElementsPath = (
            path: string,
            elementsPaths: string[],
        ) => {
            for (const elementPath of elementsPaths) {
                if (elementPath.replace('/', '').includes(path.replace('/', ''))) {
                    return true;
                }
            }
            return false;
        }

        const elements = await fsPromise.readdir(elementsPath);
        const pathBasename = isElementsPath(path.basename(elementsPath), elementsDirectories)
            ? ''
            : path.basename(elementsPath);
        const elementBasename = basename
            ? basename + '/' + pathBasename
            : pathBasename;

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
            process.cwd(),
            this.options.buildDirectory,
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
            plugins,
        } = this.options;

        const {
            id,
            path: filePath,
            type: fileType,
        } = file;

        const transpilesDirectory = path.join(
            process.cwd(),
            this.options.buildDirectory,
            '.elementql',
            'transpiles',
        );

        const fileContents = await fsPromise.readFile(filePath, 'utf-8');
        const elementHash = crypto
            .createHash('md5')
            .update(fileContents)
            .digest('hex');

        const transpileFilename = elementHash + fileType;
        const transpilePath = path.join(
            transpilesDirectory,
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
                name: '',
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
            transpilesDirectory,
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
            name: '',
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

            const hostURL = 'http://localhost:33300' + this.options.endpoint + '/';

            for (const importData of imports) {
                const {
                    library,
                    relative,
                    value,
                } = importData;

                const importValueRE = new RegExp(`('|")${value}('|")`);

                if (library) {
                    const replaceValue = '"' + hostURL + 'node_modules/' + value + '"';
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
                        process.cwd(),
                        this.options.buildDirectory,
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

                    const replaceValue = '"' + 'http://localhost:33300' + linkedTranspileURL + '"';
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
            generatedAt: Date.now() / 1000,
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
        return false;
    }





    private async handleElementQLRequest(
        request: IncomingMessage,
        response: ServerResponse,
    ) {
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

        const handledBody = body.split(',');
        const elements = handledBody.map(element => element.trim());

        const responseElements: any[] = [];

        for (const element of elements) {
            const responseElement = await this.fetchElement(element, request);
            responseElements.push(responseElement);
        }
        // console.log('responseElements', responseElements);

        // console.log('body', body);
        // console.log('body', body.replace(/"/g, ''));

        // const parsedBody = new ElementQLParser(body.replace(/"/g, '')).parse();
        // // console.log('parsedBody', parsedBody);

        // const elementsPath = path.join(process.cwd(), this.elementsDir);

        // const host = request.headers.host;
        // const protocol = 'http://';

        // const responseElements: any[] = [];



        // for (let parsedElement of parsedBody) {
        //     const {
        //         name,
        //     } = parsedElement;

        //     await new Promise ((resolve, reject) => {
        //         fs.readdir(elementsPath, (error, items) => {
        //             if (error) {
        //                 reject(error);
        //             }

        //             if (items.includes(name)) {
        //                 // based on plugins
        //                 // to compile the element files

        //                 const jsRoute = `/elementql/${parsedElement.name}.js`;
        //                 const jsPath = `${protocol}${host}/elementql/${parsedElement.name}.js`;
        //                 this.registerElementRoute(jsRoute);
        //                 const cssRoute = `/elementql/${parsedElement.name}.css`;
        //                 const cssPath = `${protocol}${host}/elementql/${parsedElement.name}.css`;
        //                 this.registerElementRoute(cssRoute);
        //                 const responseElement = {
        //                     js: jsPath,
        //                     css: cssPath,
        //                 };
        //                 responseElements.push(responseElement);

        //                 const registerElement: RegisteredElementQL = {
        //                     name,
        //                     routes: {
        //                         js: jsRoute,
        //                         css: cssRoute,
        //                     },
        //                     paths: {
        //                         js: `${elementsPath}/${name}/index.js`,
        //                         css: `${elementsPath}/${name}/index.css`,
        //                     },
        //                 };
        //                 this.registerElement(registerElement);

        //                 resolve();
        //             }
        //         });
        //     });
        // }

        response.setHeader('Content-Type', APPLICATION_JSON);
        response.end(JSON.stringify(responseElements));
        return;
    }

    private async handleJSONRequest(
        request: IncomingMessage,
        response: ServerResponse,
    ) {
        try {
            const body = await this.parseBody(
                request,
                'json',
            );
            const responseElements = await this.fetchElementsFromJSONRequest(
                body as ElementQLJSONRequest,
            );
            // console.log(this.elementsRegistry);
            // console.log(this.elementsURLs);

            response.setHeader('Content-Type', APPLICATION_JSON);
            response.end(JSON.stringify(responseElements));
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
            response.setHeader('Content-Type', APPLICATION_JSON);
            response.end(JSON.stringify(badRequest));
            return;
        }
    }

    private async fetchElement(
        name: string,
        request: IncomingMessage,
    ) {
        // const elementsPath = path.join(process.cwd(), 'build', 'this.options.elementsPaths');
        // // const elementsPath = path.join(process.cwd(), 'build', this.options.elementsPaths);
        // console.log('elementsPath', elementsPath);

        // const host = request.headers.host;
        // const protocol = 'http://';

        // const element = await new Promise ((resolve, reject) => {
        //     fs.readdir(elementsPath, (error, items) => {
        //         if (error) {
        //             reject(error);
        //         }

        //         if (items.includes(name)) {
        //             // based on plugins
        //             // to compile the element files

        //             const jsRoute = `/elementql/${name}.mjs`;
        //             const jsPath = `${protocol}${host}${jsRoute}`;
        //             // this.registerElementRoute(jsRoute);
        //             const cssRoute = `/elementql/${name}.css`;
        //             const cssPath = `${protocol}${host}${cssRoute}`;
        //             // this.registerElementRoute(cssRoute);
        //             const responseElement = {
        //                 js: jsPath,
        //                 css: cssPath,
        //             };
        //             // responseElements.push(responseElement);

        //             const registerElement: RegisteredElementQL = {
        //                 id: uuid.generate(),
        //                 name,
        //                 routes: {
        //                     js: jsRoute,
        //                     css: cssRoute,
        //                 },
        //                 paths: {
        //                     js: `${elementsPath}/${name}/index.mjs`,
        //                     css: `${elementsPath}/${name}/index.css`,
        //                 },
        //             };
        //             this.registerElement(registerElement);

        //             resolve(responseElement);
        //         }
        //     });
        // });

        // return element;
    }

    private async fetchElementsFromJSONRequest(
        jsonRequest: ElementQLJSONRequest,
    ) {
        const {
            elements,
        } = jsonRequest;

        const responseElements: any[] = [];

        for (const element of elements) {
            for (const [id, registeredElement] of this.elementsRegistry) {
                if (registeredElement.name === element.name) {
                    const urls = Object
                        .values(registeredElement.transpiles)
                        .map(transpile => transpile.url);
                    const responseElement = {
                        name: element.name,
                        urls,
                    };
                    responseElements.push(responseElement);
                }
            }
        }

        return responseElements;
    }
}


export default ElementQLServer;
