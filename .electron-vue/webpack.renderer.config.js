'use strict'

process.env.BABEL_ENV = 'renderer'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')

const BabelMinifyPlugin = require('babel-minify-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

/**
 * List of node_modules to include in webpack bundle
 *
 * Required for specific packages like Vue UI libraries
 * that provide pure *.vue files that need compiling
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/webpack-configurations.html#white-listing-externals
 */
let whiteListedModules = ['vue']

let rendererConfig = {
    devtool: '#cheap-module-eval-source-map',
    entry: {
        renderer: path.join(__dirname, '../src/renderer/main.js'),
        mvpage: path.join(__dirname, '../src/mvpage/mv.js'),
        lyrpage: path.join(__dirname, '../src/lyrpage/lyr.js')

    },
    externals: [
        ...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d))
    ],
    module: {
        rules: [{
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {
                test: /\.html$/,
                use: 'vue-html-loader'
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            // {
            //     test: /\.node$/,
            //     use: 'node-loader'
            // },
            {
                test: /\.node$/,
                loader: 'native-ext-loader',
                options: {
                    rewritePath: './'
                }
            },
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader',
                    options: {
                        extractCSS: process.env.NODE_ENV === 'production',
                        loaders: {
                            sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
                            scss: 'vue-style-loader!css-loader!sass-loader'
                        }
                    }
                }
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: {
                    loader: 'url-loader',
                    query: {
                        limit: 10000,
                        name: 'imgs/[name]--[folder].[ext]'
                    }
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'media/[name]--[folder].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: {
                    loader: 'url-loader',
                    query: {
                        limit: 10000,
                        name: 'fonts/[name]--[folder].[ext]'
                    }
                }
            }
        ]
    },
    node: {
        __dirname: process.env.NODE_ENV !== 'production',
        __filename: process.env.NODE_ENV !== 'production'
    },
    plugins: [
        new ExtractTextPlugin('[name].css'), //多入口 写固定的名字会被认为是主进程样式，其他窗口内容回报
        // new HtmlWebpackPlugin({
        //     filename: 'index.html',
        //     template: path.resolve(__dirname, '../src/index.ejs'),
        //     minify: {
        //         collapseWhitespace: true,
        //         removeAttributeQuotes: true,
        //         removeComments: true
        //     },
        //     hash: true,
        //     chunks:['renderer'], //页面实际引入哪些js
        //     nodeModules: process.env.NODE_ENV !== 'production' ?
        //         path.resolve(__dirname, '../node_modules') : false,
        // }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '../dist/electron')
    },
    resolve: {
        alias: {
            '@': path.join(__dirname, '../src/renderer'),
            'components': path.join(__dirname, '../src/renderer/components'),
            'utils': path.join(__dirname, '../src/renderer/utils'),
            'service': path.join(__dirname, '../src/renderer/service'),
            'directives': path.join(__dirname, '../src/renderer/directives'),
            'renderer': path.join(__dirname, '../src/renderer'),
            // 'resources': path.join(__dirname, '../src/renderer/resources'),
            'static': path.join(__dirname, '../static'),
            'build': path.join(__dirname, '../build'),
            'config': path.join(__dirname, '../dist/config'),
            'vue$': 'vue/dist/vue.esm.js'
        },
        extensions: ['.js', '.vue', '.json', '.css', '.node']
    },
    target: 'electron-renderer'
}

Object.keys(rendererConfig.entry).forEach(function(name) {
    let ejsname = name;
    if (name == 'renderer') {
        ejsname = 'index'
    }
    var plugin = new HtmlWebpackPlugin({
        filename: ejsname + '.html',
        template: path.resolve(__dirname, '../src/' + ejsname + '.ejs'),
        minify: {
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeComments: true
        },
        chunks: [name], //页面实际引入哪些js
        hash: true,
        nodeModules: process.env.NODE_ENV !== 'production' ?
            path.resolve(__dirname, '../node_modules') : false,
    });
    rendererConfig.plugins.push(plugin);
})



/**
 * Adjust rendererConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
    rendererConfig.plugins.push(
        new webpack.DefinePlugin({
            '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
        })
    )
}

/**
 * Adjust rendererConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
    rendererConfig.devtool = ''

    rendererConfig.plugins.push(
        new BabelMinifyPlugin(),
        new CopyWebpackPlugin([{
            from: path.join(__dirname, '../static'),
            to: path.join(__dirname, '../dist/electron/static'),
            ignore: ['.*']
        }]),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    )
}

module.exports = rendererConfig