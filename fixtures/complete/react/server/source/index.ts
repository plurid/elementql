import ElementQLServer, {
    libraries,
} from '@plurid/elementql-server';



const server = new ElementQLServer({
    libraries: {
        react: libraries.react,
        "react-dom": libraries["react-dom"]
    },
    plugins: [
        'typescript',
    ],
});

server.start();
