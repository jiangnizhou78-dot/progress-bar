const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    // 配置本地代理，解决开发环境跨域/404问题
    proxy: {
      '/api': {
        target: 'http://localhost:9090', // 本地后端地址
        changeOrigin: true,
        pathRewrite: {
          '^/api': '' // 把请求路径里的 /api 去掉，匹配后端接口
        }
      }
    }
  }
})