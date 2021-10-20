const HtmlWebpackPlugin = require('html-webpack-plugin')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = (_, options) => {
    const isDev = options.mode === 'development'
    return {
        entry: './src/index.js',
        output: {
            filename: isDev ? 'bundle.js' : '[contenthash].js',
            path: __dirname + '/dist',
            clean: !isDev,
            assetModuleFilename: `assets/${isDev ? '[name]' : '[contenthash]'}[ext]`
        },
        devtool: isDev && 'inline-source-map',
        plugins: [
            new HtmlWebpackPlugin({
                template: __dirname + '/public/templates/index.html',
                inject: true,
                meta: {
                    viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
                },
                filename: 'index.html',
                minify: {
                    removeComments: true,
                    collapseWhitespace: true
                }
            }),
            new NodePolyfillPlugin()
        ],
        watchOptions: {
            ignored: ['/node_modules/', '/dist/']
        },
        target: 'web',
        devServer: {
            watchFiles: __dirname + '/public/templates',
            liveReload: true
        }
    }

}
