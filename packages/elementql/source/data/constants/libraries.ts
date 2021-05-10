// #region imports
    // #region external
    import {
        Libraries,
    } from '../interfaces';
    // #endregion external
// #endregion imports



// #region module
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
// #endregion module



// #region exports
export default libraries;
// #endregion exports
