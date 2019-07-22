var path = require('path');
var webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');

var config = {
    entry: path.resolve('./src/index.js'),
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules)/,
                loader: "babel-loader",
                options: {
                    presets: ["@babel/env"],
                }
            },
            {
                test: /\.(css|scss)$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            }
        ]
    },
    resolve: { extensions: ["*", ".js", ".jsx"] },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[hash].js',
        publicPath: "/",
    },
    devServer: {
        contentBase: './dist',
        port: 3000,
        hotOnly: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: false,
            hash: true,
            template: './src/index.html',
            filename: 'index.html'
          }),
        new WebpackMd5Hash()
    ],
    resolve: {
        alias: {
            'react-dom': '@hot-loader/react-dom',
        }
    }
};

module.exports = config;