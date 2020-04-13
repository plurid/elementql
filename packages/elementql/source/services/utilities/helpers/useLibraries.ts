import {
    promises as fs,
} from 'fs';

import path from 'path';

import {
    UseLibrariesOptions,
} from '../../../data/interfaces';



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
                __dirname,
                isProduction ? production : development,
            );
            const appModulePath = path.join(
                __dirname,
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
        }
    } catch (error) {
        console.log(`\n\tCould not port node_modules libraries to the application folder.\n`);
    }
}


export default useLibraries;
