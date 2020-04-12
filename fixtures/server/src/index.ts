import ElementQLServer, {
    ElementQLServerOptions,
} from '@plurid/elementql-server';



const options: ElementQLServerOptions = {
    elementsDirectories: [
        './elementsB',
    ],
    plugins: [
        'minify',
        'typescript',
    ],
    verbose: true,
    open: false,
};

const server = new ElementQLServer(options);

server.start();
