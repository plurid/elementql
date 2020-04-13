import ElementQLServer from '@plurid/elementql-server';



const server = new ElementQLServer({
    plugins: [
        'typescript',
    ],
});

server.start();
