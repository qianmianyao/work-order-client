module.exports = {
  devServer: {
    open: false,
    host: '0.0.0.0',
    port: 8080,
    hot: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000/',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}
