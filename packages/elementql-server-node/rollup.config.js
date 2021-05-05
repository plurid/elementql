import copy from 'rollup-plugin-copy';

import plugins from '../rollup.plugins';

import pkg from './package.json';



export default {
    input: 'source/index.ts',
    external: [
        'open',
        'portscanner',
        'source-map',
    ],
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            exports: 'named',
            sourcemap: true,
        },
        {
            file: pkg.module,
            format: 'es',
            exports: 'named',
            sourcemap: true,
        }
    ],
    plugins: [
        ...plugins,
        copy({
            targets: [
                { src: 'source/assets', dest: 'distribution' },
            ],
        }),
    ],
}
