import {
    LibrariesResolvers
} from '../interfaces';



export const librariesResolvers: LibrariesResolvers = {
    'react': {
        version: 'latest',
        module: true,
        development: 'node_modules/react/umd/react.development.js',
        production: 'node_modules/react/umd/react.production.min.js',
    },
    'react-dom': {
        version: 'latest',
        module: true,
        development: 'node_modules/react/umd/react-dom.development.js',
        production: 'node_modules/react/umd/react-dom.production.min.js',
    },
};
