import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import depsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import resolve from 'rollup-plugin-node-resolve';
import url from 'rollup-plugin-url';
import replace from '@rollup/plugin-replace';



const plugins = [
    replace({
        'process.env.MODE_ENV': JSON.stringify(process.env.MODE_ENV),
    }),
    depsExternal(),
    postcss({
        modules: true,
    }),
    url(),
    resolve({
        modulesOnly: true,
    }),
    typescript({
        check: false,
        rollupCommonJSResolveHack: true,
        clean: true
    }),
    commonjs(),
];



export default plugins;
