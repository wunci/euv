const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = {
  mode: "production",
  entry: {
    euv: "./src/core/euv.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"],
          plugins: [
            "@babel/plugin-transform-runtime",
            "@babel/plugin-proposal-class-properties",
          ],
        },
      },
    ],
  },
  plugins: [new CleanWebpackPlugin()],
  output: {
    filename: "[name].min.js",
    libraryTarget: "umd",
    libraryExport: "default",
    library: "Euv",
    path: path.resolve(__dirname, "lib"),
  },
};
