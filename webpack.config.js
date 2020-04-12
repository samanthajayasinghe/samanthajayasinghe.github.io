'use strict'
const webpack = require('webpack');
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const PrettierPlugin = require("prettier-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: [
        path.resolve(__dirname, 'src')+'/app.js'
    ],
    devServer: {
         contentBase: './dist',
         compress: true,
         port: 9000
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.scss$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            hash: true,
            template: path.resolve(__dirname, 'src')+'/index.html',
            filename: path.resolve(__dirname)+'/index.html'
        }),
        new HtmlWebpackPlugin({
            hash: true,
            template: path.resolve(__dirname, 'src')+'/index.html',
            filename: path.resolve(__dirname,'dist')+'/index.html'
        }),
        new CopyPlugin([
            { from: path.resolve(__dirname, 'src')+'/assets/', to: path.resolve(__dirname, 'dist')+'/assets/' },
            { from: path.resolve(__dirname, 'src')+'/assets/', to: path.resolve(__dirname)+'/assets/'  },
        ]),
        new PrettierPlugin()
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
}