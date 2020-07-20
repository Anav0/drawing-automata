const path = require("path");
const dotenv = require("dotenv-webpack");
module.exports = () => {
  return {
    mode: "development",
    entry: "./src/index.ts",
    devtool: "inline-source-map",
    devServer: {
      contentBase: "./build",
    },
    plugins: [new dotenv({ systemvars: true })],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: ["file-loader"],
        },
        {
          test: /\.svg$/,
          loader: "svg-inline-loader",
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "build"),
    },
  };
};
