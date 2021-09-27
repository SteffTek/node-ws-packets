'use strict';
const webpack = require('webpack'), path = require('path'), glob = require('glob'), TerserPlugin = require("terser-webpack-plugin");
let config = {

    entry: {
        'bundle': glob.sync('./Pack.js'),
    }, output: {
        path: path.join(__dirname, './'),
        filename: 'Browser.js'
    },
    mode: "production",
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    mangle: true,
                    keep_classnames: true,
                    keep_fnames: true,
                }
            })
        ]
    },
}
module.exports = config;