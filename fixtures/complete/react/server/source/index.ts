import ElementQLServer from '@plurid/elementql-server';

import {
    libraries,
} from '@plurid/elementql';



const server = new ElementQLServer({
    libraries: {
        react: libraries.react,
        reactDom: libraries.reactDom,
    },
    plugins: [
        'typescript',
    ],
});

server.start();
