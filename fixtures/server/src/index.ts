import ElementQLServer from '@plurid/elementql-server';



const options = {
    elementsDir: '/src/elements',
};

const server = new ElementQLServer(options);

// starting the server starts serving components from the ./components folder
// to pass an options object with
// componentsDir
// plugins - typescript, babel, etc.
server.start();
