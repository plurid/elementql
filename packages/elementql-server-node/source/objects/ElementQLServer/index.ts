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
    ElementQL,
    ElementQLMetadataFile,
} from '../../data/interfaces';

import {
    DEFAULT_PORT,
    DEFAULT_ELEMENTS_DIR,
    DEFAULT_ELEMENTQL_ENDPOINT,
    DEFAULT_PLAYGROUND_ENDPOINT,
    FAVICON,
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
    checkAvailablePort,
    extractFileImports,
} from '../../utilities';



class ElementQLServer {
    private options: InternalElementQLServerOptions;
    private elementsURLs: Map<string, string> = new Map();
    private elementsRegistry: Map<string, ElementQL> = new Map();
    private server: http.Server;


    constructor(
        options: ElementQLServerOptions,
    ) {
        this.options = this.handleOptions(options);
        this.generateElementQLDirectories(this.options);
        this.registerElements();
        this.server = http.createServer(
            (request, response) => this.createServer(request, response, this.options),
        );

        process.addListener('SIGINT', () => {
            this.stop();
            process.exit(0);
        });
    }


    public async start() {
        const port = await checkAvailablePort(this.options.port);
        this.options.port = port;

        const serverlink = `http://localhost:${port}`;
        if (this.options.verbose) {
            console.log(`\n\tElementQL Server Started on Port ${port}: ${serverlink}\n`);
        }

        this.server.listen(port);

        if (this.options.open) {
            open(serverlink);
        }
    }

    public stop() {
        if (this.options.verbose) {
            console.log(`\n\tElementQL Server Closed on Port ${this.options.port}\n`);
        }

        this.server.close();
    }



    /** OPTIONS */
    private handleOptions(
        options: ElementQLServerOptions,
    ) {
        const internalOptions: InternalElementQLServerOptions = {
            port: options.port || DEFAULT_PORT,
            rootDirectory: options.rootDirectory
                ? options.rootDirectory
                : options.store
                    ? '/'
                    : process.cwd(),
            buildDirectory: options.buildDirectory || 'build',
            elementqlDirectory: options.elementqlDirectory || '.elementql',
            transpilesDirectory: options.transpilesDirectory || 'transpiles',
            elementsPaths: options.elementsPaths || DEFAULT_ELEMENTS_DIR,
            libraries: options.libraries || {},
            endpoint: options.endpoint || DEFAULT_ELEMENTQL_ENDPOINT,
            allowOrigin: options.allowOrigin || '*',
            allowHeaders: options.allowHeaders || '*',
            plugins: options.plugins || [],
            verbose: options.verbose ?? true,
            open: options.open ?? true,
            playground: options.playground ?? false,
            playgroundEndpoint: options.playgroundEndpoint || DEFAULT_PLAYGROUND_ENDPOINT,

            store: options.store || null,
            metadataFilename: options.metadataFilename || 'metadata.json',
        };

        return internalOptions;
    }


    /** ELEMENTS */
    private async registerElements() {
        const {
            store,
            elementsPaths,
            metadataFilename,
        } = this.options;


        if (store) {
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

        if (typeof elementsPaths === 'string') {
            const elementsPath = path.join(
                process.cwd(),
                this.options.buildDirectory,
                elementsPaths,
            );
            const elements = await this.extractElementsFromPath(
                elementsPath,
                elementsPaths,
            );
            for (const element of elements) {
                await this.registerElement(element);
            }

            for (const [_, registeredElement] of this.elementsRegistry) {
                await this.resolveImports(registeredElement);
            }

            await this.writeMetadataFile();

            return;
        }

        for (const elementPath of elementsPaths) {
            const elementsPath = path.join(
                process.cwd(),
                this.options.buildDirectory,
                elementPath,
            );
            const elements = await this.extractElementsFromPath(
                elementsPath,
                elementPath,
            );
            for (const element of elements) {
                await this.registerElement(element);
            }
        }

        for (const [_, registeredElement] of this.elementsRegistry) {
            await this.resolveImports(registeredElement);
        }

        await this.writeMetadataFile();
    }

    private async extractElementsFromPath(
        elementsPath: string,
        sourceDirectory: string,
    ) {
        // TODO
        // done - loop over elements recursively, checking if some are folders
        // resolve transpilation (from typesript-react to pure javascript or w/e the plugins say)
        // resolve dependencies - APage imports AHeader and AFooter from it's subfolders,
        // but maybe it also imports something else from the top

        const elements = await fsPromise.readdir(elementsPath);

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
                );
                processedElements.push(...directoryElements);
                continue;
            }

            /** Handle file */
            const file: ProcessedElementQLFile = await this.processElementFile(
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

    private async registerElement(
        element: ProcessedElementQL,
    ) {
        const elementql = await this.transpileElement(element);

        for (const transpile of Object.values(elementql.transpiles)) {
            this.elementsURLs.set(transpile.url, elementql.id);
        }

        this.elementsRegistry.set(elementql.id, elementql);
    }


    /** SERVER */
    private createServer(
        request: IncomingMessage,
        response: ServerResponse,
        options: InternalElementQLServerOptions,
    ) {
        // Set CORS headers
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
        response.setHeader('Access-Control-Allow-Headers', '*');
        if (request.method === 'OPTIONS') {
            response.writeHead(200);
            response.end();
            return;
        }

        if (!request.url) {
            response.statusCode = HTTP_BAD_REQUEST;
            response.end();
            return;
        }

        if (request.url === '/favicon.ico') {
            response.writeHead(
                HTTP_OK,
                { HEADER_CONTENT_TYPE: 'image/x-icon' },
            );
            fs.createReadStream(FAVICON).pipe(response);
            return;
        }

        if (options.playground && request.url === options.playgroundEndpoint) {
            this.renderPlayground(request, response);
            return;
        }

        if (request.url === options.endpoint) {
            this.handleElements(request, response);
            return;
        }

        if (this.elementsURLs.has(request.url)) {
            this.handleElementRequest(request, response);
            return;
        }

        response.statusCode = HTTP_NOT_FOUND;
        response.end('ElementQL');
        return;
    }

    private async handleElements(
        request: IncomingMessage,
        response: ServerResponse,
    ) {
        const invalidElementQLQuery = 'Not A Valid ElementQL Query.';

        if (request.method === METHOD_GET) {
            // MAYBE
            // return a special page with documentation/information
            response.statusCode = HTTP_METHOD_NOT_ALLOWED;
            response.end(invalidElementQLQuery);
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
                this.handleElementQLSpecificRequest(request, response);
                return;
            case APPLICATION_JSON:
                this.handleElementQLJSONRequest(request, response);
                return;
            default:
                response.statusCode = HTTP_UNSUPPORTED_MEDIA_TYPE;
                response.end(invalidElementQLQuery);
                return;
        }
    }

    private async handleElementQLSpecificRequest(
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

    private async handleElementQLJSONRequest(
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

    private async handleElementRequest(
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


    /** PLAYGROUND */
    private renderPlayground(
        request: IncomingMessage,
        response: ServerResponse,
    ) {
        response.end('ElementQL Playground');
    }


    /** UTILITIES */
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
        elementFilePath: string,
    ) {
        const fileType = path.extname(elementFilePath);

        const imports = await extractFileImports(elementFilePath);

        const file: ProcessedElementQLFile = {
            id: uuid.generate(),
            name: '',
            type: fileType,
            path: elementFilePath,
            imports,
        };

        return file;
    }

    private generateElementQLDirectories(
        options: InternalElementQLServerOptions,
    ) {
        const elementQLDirectory = path.join(
            process.cwd(),
            options.buildDirectory,
            options.elementqlDirectory,
        );
        if (!fs.existsSync(elementQLDirectory)) {
            fs.mkdirSync(elementQLDirectory);
        }

        const transpilesDirectory = path.join(
            elementQLDirectory,
            options.transpilesDirectory,
        );
        if (!fs.existsSync(transpilesDirectory)) {
            fs.mkdirSync(transpilesDirectory);
        } else {
            fs.rmdirSync(transpilesDirectory, {
                recursive: true,
            });
            fs.mkdirSync(transpilesDirectory);
        }
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

        const metadataFileContents = JSON.stringify(data);

        await fsPromise.writeFile(
            metadataFilePath,
            metadataFileContents,
        );
    }
}


export default ElementQLServer;
