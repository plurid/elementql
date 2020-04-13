const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');



/** PLUGINS */
const copyPlugin = new CopyPlugin([
    {
        from: path.resolve(__dirname, './public'),
        to: './',
    },
    {
        from: path.resolve(__dirname, './source/service-worker.js'),
        to: './',
    },
]);



const tsRule = {
    test: /\.ts(x?)$/,
    exclude: /node_modules/,
    use: [
        {
            loader: 'ts-loader',
            options: {
                configFile: path.resolve(__dirname, './tsconfig.json'),
            },
        },
    ],
};


const babelRule = {
    test: /\.js$/,
    loader: 'babel-loader',
    exclude: /node_modules/,
    options: {
        presets: [
            '@babel/preset-react',
            [
                '@babel/env',
                {
                    targets: {
                        browsers: ['last 2 versions'],
                    },
                },
            ],
        ],
    },
};



/** CONFIGURATION */
const configuration = {
    entry: {
        index: path.join(__dirname, 'source/index.tsx'),
    },

    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'build'),
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },

    stats: {
        modules: false,
        chunks: false,
        assets: false,
    },

    module: {
        rules: [
            tsRule,
            babelRule,
        ],
    },

    mode: 'development',

    devtool: 'inline-source-map',

    plugins: [
        copyPlugin,
    ],
};



module.exports = configuration;
