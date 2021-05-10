import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import depsExternal from 'rollup-plugin-peer-deps-external';
// import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
// import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';



const plugins = [
    // replace({
    //     'process.env.MODE_ENV': JSON.stringify(process.env.MODE_ENV),
    // }),
    depsExternal(),
    // postcss({
    //     modules: true,
    // }),
    resolve({
        modulesOnly: true,
    }),
    typescript({
        check: false,
        rollupCommonJSResolveHack: true,
        clean: true
    }),
    commonjs(),
    terser({
        mangle: false,
        compress: false,
        format: {
            beautify: true,
            comments: false,
        },
    }),
];



export default plugins;
