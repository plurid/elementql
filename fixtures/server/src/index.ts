import ElementQLServer, {
    ElementQLServerOptions,
} from '@plurid/elementql-server';

import resolvers from './elementql/resolvers';
import schema from './elementql/schema';



// starting the server starts serving components from the ./components folder
// to pass an options object with
// componentsDir
// plugins - typescript, babel, etc.
const options: ElementQLServerOptions = {
    resolvers,
    schema,
    elementsPaths: './elements',
    verbose: true,
    open: false,
    // plugins: [ 'minimize' ],
};

const server = new ElementQLServer(options);

server.start();
