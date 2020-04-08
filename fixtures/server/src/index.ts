import ElementQLServer from '@plurid/elementql-server';

import resolvers from './elementql/resolvers';
import schema from './elementql/schema';



const options = {
    // resolvers,
    // schema,
    // elementsDir: './src/elements',
    // playground: true,
};

const server = new ElementQLServer(options);

// starting the server starts serving components from the ./components folder
// to pass an options object with
// componentsDir
// plugins - typescript, babel, etc.
server.start();
