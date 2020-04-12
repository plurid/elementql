import ElementQLServer, {
    ElementQLServerOptions,
    librariesResolvers,
} from '@plurid/elementql-server';



const options: ElementQLServerOptions = {
    elementsDirectories: [
        './elementsB',
    ],
    plugins: [
        'minify',
        'typescript',
    ],
    libraries: {
        'react': librariesResolvers["react"],
        'react-dom': librariesResolvers["react-dom"],
    },
    open: false,
};

const server = new ElementQLServer(options);

server.start();
