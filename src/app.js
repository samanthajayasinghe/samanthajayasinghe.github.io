import Vue from "vue";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import "./assets/app.scss";

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
import App from "./App.vue";
new Vue({
  el: "#app",
  render: (h) => h(App),
});
