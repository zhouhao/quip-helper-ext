import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

// inject a custom div into current page
const body = document.querySelector('body');
const container = document.createElement('div');
body.appendChild(container);

new Vue({
  el: container,
  render: h => h(App),
});
