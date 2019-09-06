import http from 'http';
import fs from 'fs';

import open from 'open';

import {
    IElementQLServer,
    ElementQLServerOptions,
} from '../../interfaces';

import {
    DEFAULT_PORT,
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

    constructor(options?: ElementQLServerOptions) {
        if (options) {
            if (options.port) {
                this.port = options.port;
            }

            if (options.verbose) {
                this.verbose = options.verbose;
            }
        }

        this.server = http.createServer((req: any, res: any) => {
            if (req.url === '/favicon.ico') {
                res.writeHead(200, {'Content-Type': 'image/x-icon'} );
                fs.createReadStream(FAVICON).pipe(res);
                return;
            }
        });

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
}


export default ElementQLServer;
