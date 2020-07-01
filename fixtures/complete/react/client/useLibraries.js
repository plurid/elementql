const {
    libraries,
    useLibraries,
} = require('@plurid/elementql');



const usedLibraries = {
    react: libraries.react,
    reactDom: libraries.reactDom,
};

const buildDirectory = 'build';


useLibraries({
    libraries: usedLibraries,
    buildDirectory,
});
