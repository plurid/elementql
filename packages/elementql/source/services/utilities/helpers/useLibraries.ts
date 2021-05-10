// #region imports
    // #region libraries
    import {
        promises as fs,
    } from 'fs';

    import path from 'path';
    // #endregion libraries


    // #region external
    import {
        UseLibrariesOptions,
    } from '../../../data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const useLibraries = async (
    options: UseLibrariesOptions,
) => {
    try {
        const {
            libraries,
            buildDirectory,
        } = options;

        const isProduction = process.env.ENV_MODE === 'production';

        for (const library of Object.values(libraries)) {
            const {
                development,
                production,
            } = library;

            const nodeModulePath = path.join(
                process.cwd(),
                isProduction ? production : development,
            );
            const appModulePath = path.join(
                process.cwd(),
                buildDirectory,
                isProduction ? production : development,
            );
            const appModuleDirectory = path.dirname(
                appModulePath,
            );

            await fs.mkdir(
                appModuleDirectory,
                { recursive: true },
            );
            await fs.copyFile(
                nodeModulePath,
                appModulePath,
            );


            const serviceWorkerNodeModule = 'node_modules/@plurid/elementql/distribution/service-worker.js';
            const serviceWorkerPath = path.join(
                process.cwd(),
                serviceWorkerNodeModule,
            );
            const serviceWorkerAppPath = path.join(
                process.cwd(),
                buildDirectory,
                serviceWorkerNodeModule,
            );
            const serviceWorkerAppDirectory = path.dirname(
                serviceWorkerAppPath,
            );
            await fs.mkdir(
                serviceWorkerAppDirectory,
                { recursive: true },
            );
            await fs.copyFile(
                serviceWorkerPath,
                serviceWorkerAppPath,
            );
        }
    } catch (error) {
        console.log(`\n\tCould not port node_modules libraries to the application folder.\n`, error);
    }
}
// #endregion module



// #region exports
export default useLibraries;
// #endregion exports
