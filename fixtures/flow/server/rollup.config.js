const typescript = require('rollup-plugin-typescript2');
const babel = require('rollup-plugin-babel');
const external = require('rollup-plugin-peer-deps-external');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const sourceMaps = require('rollup-plugin-sourcemaps');
import copy from 'rollup-plugin-copy';



const BUILD_DIRECTORY = 'build';

const input = 'source/index.ts';

const output = [
    {
        file: `./${BUILD_DIRECTORY}/index.js`,
        format: 'cjs',
    },
];

const plugins = {
    typescript: () => typescript({
        tsconfig: './tsconfig.json',
    }),
    babel: () => babel(),
    external: () => external({
        includeDependencies: true,
    }),
    resolve: () => resolve({
        preferBuiltins: true,
    }),
    commonjs: () => commonjs(),
    sourceMaps: () => sourceMaps(),
    copy: () => copy({
        targets: [
            { src: 'source/elements', dest: 'build/' },
        ],
    }),
};


export default {
    input,
    output,
    plugins: [
        plugins.typescript(),
        plugins.babel(),
        plugins.external(),
        plugins.resolve(),
        plugins.commonjs(),
        plugins.sourceMaps(),
        plugins.copy(),
    ],
}
