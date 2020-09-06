const mode = require("gulp-mode")();

const isProduction = mode.production();

module.exports = {
  entry: "./src/js/index.js",
  mode: isProduction ? "production" : "development",
  output: {
    filename: "template.js",
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /(node_modules)/,
        loader: "babel-loader",
      },
    ],
  },
};
