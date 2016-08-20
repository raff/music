module.exports = {
  entry: "./app/renderer.js",
  output: {
    filename: "./app/app.bundle.js"
  },
  node: {
    fs: "empty"
  }
}
