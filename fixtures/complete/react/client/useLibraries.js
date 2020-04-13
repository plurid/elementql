const {
    promises: fs,
} = require('fs');
const path = require('path');

// const {
//     libraries,
//     useLibraries,
// } = require('@plurid/elementql');



const usedLibraries = {
    'react': {
        version: 'latest',
        module: true,
        development: './node_modules/react/umd/react.development.js',
        production: './node_modules/react/umd/react.production.min.js',
    },
    'react-dom': {
        version: 'latest',
        module: true,
        development: './node_modules/react-dom/umd/react-dom.development.js',
        production: './node_modules/react-dom/umd/react-dom.production.min.js',
    },
};

const useLibraries = async (
    options,
) => {
    const {
        libraries,
        buildDirectory,
    } = options;

    for (const library of Object.values(libraries)) {
        const libraryPath = path.join(
            __dirname,
            library.production,
        );
        const appModulePath = path.join(
            __dirname,
            buildDirectory,
            library.production,
        );
        const appModuleDirectory = path.dirname(
            appModulePath,
        );

        await fs.mkdir(
            appModuleDirectory,
            { recursive: true },
        );
        await fs.copyFile(
            libraryPath,
            appModulePath,
        );
    }
}



// const usedLibraries = {
//     react: libraries.react,
//     'react-dom': libraries['react-dom'],
// }

const buildDirectory = 'build';


useLibraries({
    libraries: usedLibraries,
    buildDirectory,
});
