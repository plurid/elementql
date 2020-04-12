import {
    LibrariesResolvers
} from '../interfaces';



export const librariesResolvers: LibrariesResolvers = {
    react: {
        version: 'latest',
        development: 'umd/react.development.js',
        production: 'umd/react.production.min.js',
    },
};
