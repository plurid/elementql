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
import Terser from 'terser';

// import ElementQLParser from '@plurid/elementql-parser';

import {
    uuid,
} from '@plurid/plurid-functions';

import {
    ElementQLServerOptions,
    InternalElementQLServerOptions,
    RegisteredElementQL,
    RegisteredElementQLRoute,
    ElementQLJSONRequest,
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
} from '../../utilities';



class ElementQLServer {
    private options: InternalElementQLServerOptions;
    // private elementsNames: Map<string, string> = new Map();
    private elementsRoutes: Map<string, string> = new Map();
    private elementsRegistry: Map<string, RegisteredElementQL> = new Map();
    private server: http.Server;


    constructor(
        options: ElementQLServerOptions,
    ) {
        this.options = this.handleOptions(options);
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
            schema: options.schema,
            resolvers: options.resolvers,
            port: options.port || DEFAULT_PORT,
            buildDirectory: options.buildDirectory || 'build',
            elementsPaths: options.elementsPaths || DEFAULT_ELEMENTS_DIR,
            endpoint: options.endpoint || DEFAULT_ELEMENTQL_ENDPOINT,
            allowOrigin: options.allowOrigin || '*',
            allowHeaders: options.allowHeaders || '*',
            plugins: options.plugins || [],
            verbose: options.verbose ?? true,
            open: options.open ?? true,
            playground: options.playground ?? false,
            playgroundEndpoint: options.playgroundEndpoint || DEFAULT_PLAYGROUND_ENDPOINT,
        };

        return internalOptions;
    }


    /** ELEMENTS */
    private async registerElements() {
        const {
            elementsPaths,
        } = this.options;

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

        const registeredElements: RegisteredElementQL[] = [];
        const routes: RegisteredElementQLRoute[] = [];

        for (const element of elements) {
            const elementFilePath = path.join(elementsPath, element);

            const isDirectory = fs.statSync(elementFilePath).isDirectory();
            if (isDirectory) {
                /** Handle directory */
                const directoryElements = await this.extractElementsFromPath(
                    elementFilePath,
                    sourceDirectory,
                );
                registeredElements.push(...directoryElements);
                continue;
            }

            /** Handle file */
            const route: RegisteredElementQLRoute = this.processElementFile(
                element,
                elementFilePath,
            );
            routes.push(route);
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

        if (routes.length > 0) {
            const registeredElement: RegisteredElementQL = {
                id: uuid.generate(),
                name: relativePath,
                routes,
            };

            registeredElements.push(registeredElement);
        }

        return registeredElements;
    }

    private async registerElement(
        element: RegisteredElementQL,
    ) {
        const transpiledElement = await this.transpileElement(element);

        for (const route of transpiledElement.routes) {
            const url = this.assembleElementURL(route.url);
            this.elementsRoutes.set(url, transpiledElement.id);
        }

        this.elementsRegistry.set(transpiledElement.id, transpiledElement);
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

        if (this.elementsRoutes.has(request.url)) {
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
        console.log('responseElements', responseElements);

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
            console.log(this.elementsRegistry);
            console.log(this.elementsRoutes);

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
        const elementID = this.elementsRoutes.get(request.url);
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

        const routeFile = this.resolveRouteFile(request.url, element);

        if (!routeFile) {
            response.statusCode = HTTP_NOT_FOUND;
            response.end('Not Found.');
            return;
        }

        const {
            fileType,
            filePath,
        } = routeFile;

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
                    const urls = registeredElement.routes.map(route => route.url);
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

    private resolveRouteFile(
        requestURL: string,
        element: RegisteredElementQL,
    ) {
        const {
            routes,
        } = element;

        for (const route of routes) {
            const url = this.assembleElementURL(route.url);
            if (url === requestURL) {
                return route;
            }
        }

        return;
    }

    private async transpileElement(
        element: RegisteredElementQL,
    ) {
        const {
            routes,
        } = element;

        const updatedElement: RegisteredElementQL = {
            ...element,
        };
        const updatedRoutes = [
            ...updatedElement.routes,
        ];

        for (const route of routes) {
            const transpiledRoute = await this.transpileRoute(route);
            // if (transpiledRoute) {
            //     updatedRoutes.push(transpiledRoute);
            // }
        }

        updatedElement.routes = [
            ...updatedRoutes,
        ];

        // this.elementsRegistry.set(updatedElement.id, updatedElement);
        return updatedElement;
    }

    private async transpileRoute(
        route: RegisteredElementQLRoute,
    ) {
        const {
            plugins,
        } = this.options;

        // based on this.options.plugins
        // and on the routes[i].filePath
        // transpile to the target
        if (plugins) {
            for (const plugin of plugins) {
                if (plugin === 'minimize') {
                    const {
                        filePath,
                    } = route;

                    const fileContents = await fsPromise.readFile(filePath, 'utf-8');

                    const terser = Terser.minify(
                        fileContents
                    );
                    const {
                        code,
                    } = terser;

                    if (code) {
                        // save to file
                    }
                }
            }
        }

        return;
    }

    private assembleElementURL(
        routeURL: string,
    ) {
        const url = this.options.endpoint + routeURL;
        return url;
    }

    private processElementFile(
        elementFileName: string,
        elementFilePath: string,
    ) {
        // elementFilePath is the original
        // for transpilation move the file into the `./.elementql/transpiled` mirror directory

        const fileType = path.extname(elementFilePath);

        const elementHash = crypto
            .createHash('md5')
            .update(elementFilePath)
            .digest('hex');
        const url = `/${elementHash}${fileType}`;

        const route = {
            fileType,
            filePath: elementFilePath,
            url,
        };

        return route;
    }
}


export default ElementQLServer;
