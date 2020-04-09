import http, { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import fs from 'fs';

import open from 'open';

import ElementQLParser from '@plurid/elementql-parser';

import {
    IElementQLServer,
    ElementQLServerOptions,
    RegisteredElementQL,
} from '../../interfaces';

import {
    DEFAULT_PORT,
    DEFAULT_ELEMENTS_DIR,
    DEFAULT_ELEMENTQL_ENDPOINT,
    DEFAULT_PLAYGROUND_ENDPOINT,
    FAVICON,
    METHOD_POST,
    APPLICATION_ELEMENTQL,
    APPLICATION_JSON,
} from '../../constants';

import {
    defaultServerStartOptions,
} from '../../data';

import {
    checkAvailablePort,
} from '../../utilities';



class ElementQLServer implements IElementQLServer {
    private server: http.Server;
    private port: number = DEFAULT_PORT;
    private verbose: boolean = false;
    private elementsDir: string = DEFAULT_ELEMENTS_DIR;
    private elementQLEndpoint: string = DEFAULT_ELEMENTQL_ENDPOINT;
    private playgroundEndpoint: string = DEFAULT_PLAYGROUND_ENDPOINT;
    private playground: boolean = false;
    private plugins: string[] = [];
    private elementsRoutes: string[] = [];
    private elements: RegisteredElementQL[] = [];

    constructor(
        options: ElementQLServerOptions,
    ) {
        this.handleOptions(options);
        this.server = this.createServer();

        process.addListener('SIGINT', () => {
            this.stop();
            process.exit(0);
        });
    }

    public async start(options = defaultServerStartOptions) {
        this.port = await checkAvailablePort(this.port);
        const serverlink = `http://localhost:${this.port}`;
        if (this.verbose) {
            console.log(`\n\tElementQL Server Started on Port ${this.port}: ${serverlink}\n`);
        }
        this.server.listen(this.port);
        if (options.open) {
            open(serverlink);
        }
    }

    public stop() {
        if (this.verbose) {
            console.log(`\n\tElementQL Server Closed on Port ${this.port}\n`);
        }

        this.server.close();
    }

    private handleOptions(options?: ElementQLServerOptions) {
        if (options) {
            if (options.port) {
                this.port = options.port;
            }

            if (options.verbose) {
                this.verbose = options.verbose;
            }

            if (options.elementsDir) {
                this.elementsDir = options.elementsDir;
            }

            if (options.endpoint) {
                this.elementQLEndpoint = options.endpoint;
            }

            if (options.playground) {
                this.playground = options.playground;
            }

            if (options.playgroundURL) {
                this.playgroundEndpoint = options.playgroundURL;
            }

            if (options.plugins) {
                this.plugins = options.plugins;
            }
        }
    }

    private createServer() {
        const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            // Set CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Request-Method', '*');
            res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
            res.setHeader('Access-Control-Allow-Headers', '*');
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            if (req.url === '/favicon.ico') {
                res.writeHead(200, {'Content-Type': 'image/x-icon'} );
                fs.createReadStream(FAVICON).pipe(res);
                return;
            }

            if (this.playground && req.url === this.playgroundEndpoint) {
                this.renderPlayground(req, res);
                return;
            }

            if (req.url === this.elementQLEndpoint)  {
                this.handleElements(req, res);
                return;
            }

            if (req.url && this.elementsRoutes.includes(req.url)) {
                this.handleElementRequest(req, res);
                return;
            }

            res.end('ElementQL');
            return;
        });

        return server;
    }

    private async handleElements(request: IncomingMessage, response: ServerResponse) {
        if (request.method === METHOD_POST
            && request.headers['content-type'] === APPLICATION_ELEMENTQL
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
            // console.log('body', body);
            // console.log('body', body.replace(/"/g, ''));

            const parsedBody = new ElementQLParser(body.replace(/"/g, '')).parse();
            // console.log('parsedBody', parsedBody);

            const elementsPath = path.join(process.cwd(), this.elementsDir);

            const host = request.headers.host;
            const protocol = 'http://';

            const responseElements: any[] = [];
            for (let parsedElement of parsedBody) {
                const {
                    name,
                } = parsedElement;

                await new Promise ((resolve, reject) => {
                    fs.readdir(elementsPath, (error, items) => {
                        if (error) {
                            reject(error);
                        }

                        if (items.includes(name)) {
                            // based on plugins
                            // to compile the element files

                            const jsRoute = `/elementql/${parsedElement.name}.js`;
                            const jsPath = `${protocol}${host}/elementql/${parsedElement.name}.js`;
                            this.registerElementRoute(jsRoute);
                            const cssRoute = `/elementql/${parsedElement.name}.css`;
                            const cssPath = `${protocol}${host}/elementql/${parsedElement.name}.css`;
                            this.registerElementRoute(cssRoute);
                            const responseElement = {
                                js: jsPath,
                                css: cssPath,
                            };
                            responseElements.push(responseElement);

                            const registerElement: RegisteredElementQL = {
                                name,
                                routes: {
                                    js: jsRoute,
                                    css: cssRoute,
                                },
                                paths: {
                                    js: `${elementsPath}/${name}/index.js`,
                                    css: `${elementsPath}/${name}/index.css`,
                                },
                            };
                            this.registerElement(registerElement);

                            resolve();
                        }
                    });
                });
            }

            response.setHeader('Content-Type', APPLICATION_JSON);
            response.end(JSON.stringify(responseElements));
        } else {
            response.end('Not A Valid ElementQL Query.');
        }
    }

    private registerElementRoute(route: string) {
        this.elementsRoutes.push(route);
    }

    private registerElement(element: RegisteredElementQL) {
        this.elements.push(element);
    }

    private async handleElementRequest(request: IncomingMessage, response: ServerResponse) {
        console.log('this.elements', this.elements);

        const element = this.elements.filter(element => {
            if (element.routes.js === request.url || element.routes.css === request.url) {
                return element;
            }
            return;
        })[0];

        console.log('element', element);

        if (element) {
            const file = await new Promise((resolve, reject) => {
                const jsFile = /\.js/.test(request.url || '');
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

    private renderPlayground(request: IncomingMessage, response: ServerResponse) {
        response.end('ElementQL Playground');
    }
}


export default ElementQLServer;
