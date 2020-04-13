import {
    Libraries,
} from '../interfaces';



const libraries: Libraries = {
    react: {
        version: 'latest',
        module: true,
        development: './node_modules/react/umd/react.development.js',
        production: './node_modules/react/umd/react.production.min.js',
    },
    reactDom: {
        version: 'latest',
        module: true,
        development: './node_modules/react-dom/umd/react-dom.development.js',
        production: './node_modules/react-dom/umd/react-dom.production.min.js',
    },
};


export default libraries;
