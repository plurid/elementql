import http from 'http';
import path from 'path';
import fs from 'fs';

import open from 'open';

import {
    IElementQLServer,
    ElementQLServerOptions,
} from '../../interfaces';

import {
    DEFAULT_PORT,
    DEFAULT_ELEMENTS_DIR,
    DEFAULT_ENDPOINT,
    FAVICON,
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
    private endpoint: string = DEFAULT_ENDPOINT;
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
                this.endpoint = options.endpoint;
            }

            if (options.plugins) {
                this.plugins = options.plugins;
            }
        }
    }

    private createServer() {
        this.server = http.createServer((req: any, res: any) => {
            if (req.url === '/favicon.ico') {
                res.writeHead(200, {'Content-Type': 'image/x-icon'} );
                fs.createReadStream(FAVICON).pipe(res);
                return;
            }

            if (req.url === this.endpoint)  {
                this.handleElements();
            }

            // res.end('ElementQL');
        });
    }

    private handleElements() {
        const elementsPath = path.join(process.cwd(), this.elementsDir);

        console.log(process.cwd());
        console.log(elementsPath);

        fs.readdir(elementsPath, (_, items) => {
            console.log(items);
            if (items) {
                for (var i=0; i<items.length; i++) {
                    console.log(items[i]);
                }
            }
        });
    }
}


export default ElementQLServer;
