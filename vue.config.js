module.exports = {
  assetsDir: 'static',
  parallel: false,
  publicPath: './',
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = '湖南伊爱售后工单系统'
        return args
      })
  },
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
