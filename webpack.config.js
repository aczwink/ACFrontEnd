const webpack = require("webpack");
const fs = require("fs");

module.exports = {
    mode: "production",

    entry: "./src/main.ts",
    output: {
        path: __dirname + "/dist",
        filename: "acfrontend.js",
        libraryTarget: 'window',
    },
    devtool: 'inline-source-map', // Enable sourcemaps for debugging webpack's output.

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js"]
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
    
    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        "acts-util-core": "window",
    },

    plugins: [
        new webpack.BannerPlugin(fs.readFileSync('./LICENSE_HEADER', 'utf8')),
    ]
};