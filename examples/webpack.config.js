const path = require('path');

module.exports = {
    mode: 'development',
    entry: "./src/app.ts",

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },

    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },

    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            }
        ]
    },

    devServer: {
        historyApiFallback: {
            index: 'index.htm'
        },
        
        static: {
            directory: __dirname,
            publicPath: '/',
        },
        port: 8080
    },

    devtool: "inline-source-map",
};