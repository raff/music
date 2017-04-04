const path = require('path');

module.exports = {
  entry: "./app/renderer.js",
  output: {
    filename: "./app/app.bundle.js"
  },
  node: {
    fs: "empty"
  },
  resolve: {
    // options for resolving module requests
    // (does not apply to resolving to loaders)

    modules: [
      path.join(__dirname, "app"),
      "node_modules"
    ],
    // directories where to look for modules

    extensions: [".js", ".json", ".css"]
    // extensions that are used
  },
}
