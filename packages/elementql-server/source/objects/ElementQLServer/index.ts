import http, {
    IncomingMessage,
    ServerResponse,
} from 'http';
import path from 'path';
import fs, {
    promises as fsPromise,
} from 'fs';

import open from 'open';

// import ElementQLParser from '@plurid/elementql-parser';

import {
    IElementQLServer,
    ElementQLServerOptions,
    InternalElementQLServerOptions,
    RegisteredElementQL,
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

    defaultServerStartOptions,
} from '../../data/constants';

import {
    checkAvailablePort,
} from '../../utilities';



class ElementQLServer implements IElementQLServer {
    private options: InternalElementQLServerOptions;
    private routes: Map<string, string> = new Map();
    private elements: Map<string, RegisteredElementQL> = new Map();
    private server: http.Server;


    constructor(
        options: ElementQLServerOptions,
    ) {
        this.options = this.handleOptions(options);
        this.registerElements();
        this.server = http.createServer(this.createServer);

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
        const elementsPath = path.join(process.cwd(), 'build', 'this.options.elementsPaths');
        // const elementsPath = path.join(process.cwd(), 'build', this.options.elementsPaths);

        const elements = await fsPromise.readdir(elementsPath);

        const elementsData: any[] = [];

        for (const element of elements) {
            const elementPath = path.join(elementsPath, element);
            const elementFiles = await fsPromise.readdir(elementPath);
            for (const elementFile of elementFiles) {
                const elementData = {
                    elementName: element,
                    elementFile,
                };
                elementsData.push(elementData);
            }
        }

        console.log(elementsData);
    }

    private registerElement(
        element: RegisteredElementQL,
    ) {
        this.routes.set(element.routes.js, element.name);
        this.routes.set(element.routes.css, element.name);

        this.elements.set(element.routes.js, element);
    }


    /** SERVER */
    private createServer(
        request: IncomingMessage,
        response: ServerResponse,
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

        if (this.options.playground && request.url === this.options.playgroundEndpoint) {
            this.renderPlayground(request, response);
            return;
        }

        if (request.url === this.options.endpoint)  {
            this.handleElements(request, response);
            return;
        }

        if (this.elements.has(request.url)) {
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
    }

    private async handleElementQLJSONRequest(
        request: IncomingMessage,
        response: ServerResponse,
    ) {

    }

    private async handleElementRequest(
        request: IncomingMessage,
        response: ServerResponse,
    ) {
        if (!request.url) {
            return;
        }
        // console.log('this.elements', this.elements);

        const element = this.elements.get(request.url);

        if (element) {
            const file = await new Promise((resolve, reject) => {
                const jsFile = /\.mjs/.test(request.url || '');
                const cssFile = /\.css/.test(request.url || '');
                const filePath = jsFile
                    ? element.paths.js
                    : cssFile
                        ? element.paths.css
                        : '';

                if (jsFile) {
                    response.setHeader('Content-Type', 'text/javascript');
                }

                if (cssFile) {
                    response.setHeader('Content-Type', 'text/css');
                }

                fs.readFile(filePath, (error, data) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(data);
                });
            });

            response.end(file);
        } else {
            response.setHeader('content-type', 'text/plain');
            response.end(`Could not find element for ${request.url}.`);
        }
    }

    private async fetchElement(
        name: string,
        request: IncomingMessage,
    ) {
        const elementsPath = path.join(process.cwd(), 'build', 'this.options.elementsPaths');
        // const elementsPath = path.join(process.cwd(), 'build', this.options.elementsPaths);
        console.log('elementsPath', elementsPath);

        const host = request.headers.host;
        const protocol = 'http://';

        const element = await new Promise ((resolve, reject) => {
            fs.readdir(elementsPath, (error, items) => {
                if (error) {
                    reject(error);
                }

                if (items.includes(name)) {
                    // based on plugins
                    // to compile the element files

                    const jsRoute = `/elementql/${name}.mjs`;
                    const jsPath = `${protocol}${host}${jsRoute}`;
                    // this.registerElementRoute(jsRoute);
                    const cssRoute = `/elementql/${name}.css`;
                    const cssPath = `${protocol}${host}${cssRoute}`;
                    // this.registerElementRoute(cssRoute);
                    const responseElement = {
                        js: jsPath,
                        css: cssPath,
                    };
                    // responseElements.push(responseElement);

                    const registerElement: RegisteredElementQL = {
                        name,
                        routes: {
                            js: jsRoute,
                            css: cssRoute,
                        },
                        paths: {
                            js: `${elementsPath}/${name}/index.mjs`,
                            css: `${elementsPath}/${name}/index.css`,
                        },
                    };
                    this.registerElement(registerElement);

                    resolve(responseElement);
                }
            });
        });

        return element;
    }


    /** PLAYGROUND */
    private renderPlayground(
        request: IncomingMessage,
        response: ServerResponse,
    ) {
        response.end('ElementQL Playground');
    }
}


export default ElementQLServer;
