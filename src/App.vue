<template>
  <div id="app">
    <FireworkConfig msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import FireworkConfig from './components/FireworkConfig.vue'

export default {
  name: 'App',
  components: {
    FireworkConfig
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
