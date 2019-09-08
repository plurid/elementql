import http, { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import fs from 'fs';

import open from 'open';

import ElementQLParser from '@plurid/elementql-parser';

import {
    IElementQLServer,
    ElementQLServerOptions,
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

    constructor(options?: ElementQLServerOptions) {
        this.handleOptions(options);
        this.createServer();

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
        this.server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
            if (req.url === '/favicon.ico') {
                res.writeHead(200, {'Content-Type': 'image/x-icon'} );
                fs.createReadStream(FAVICON).pipe(res);
                return;
            }

            if (this.playground && req.url === this.playgroundEndpoint) {
                res.end('ElementQL Playground');
            }

            if (req.url === this.elementQLEndpoint)  {
                this.handleElements(req, res);
            }

            // res.end('ElementQL');
        });
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
            console.log('body', body);

            const parsedBody = new ElementQLParser(body).parse();
            console.log(parsedBody);

            const elementsPath = path.join(process.cwd(), this.elementsDir);

            const responseElements: any[] = [];
            for (let parsedElement of parsedBody) {
                const {
                    name,
                } = parsedElement;

                // console.log(process.cwd());
                // console.log(elementsPath);
                fs.readdir(elementsPath, (_, items) => {
                    console.log(items);
                    if (items.includes(name)) {
                        console.log(name);
                    }
                });
                // based on the name get the element

                // const responseElement = {
                //     js: `${parsedElement.name}.js`,
                //     css: `${parsedElement.name}.css`,
                // };
            }

            response.setHeader('Content-Type', APPLICATION_JSON);
            response.end(JSON.stringify(responseElements));
        } else {
            response.end('Not A Valid ElementQL Query.');
        }
    }
}


export default ElementQLServer;
