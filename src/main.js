import Vue from "./core/vue";

new Vue({
  el: "#div1",
  data: {
    obj: {
      data: "obj.data",
    },
    ok: true,
    message: "message",
    modelMessage: 1,
    show: true,
    html: "<h2>v-html 😄</h2>",
    list: [11, 22, 33, 44],
    message2: "测试computed + modelMessage：",
  },
  computed: {
    hello() {
      return this.message2 + this.modelMessage;
    },
  },
  watch: {
    ok(val, oldVal) {
      console.log("watch", val, oldVal);
    },
    modelMessage(val, oldVal) {
      console.log("watch", val, oldVal);
    },
  },
  mounted() {
    setTimeout(() => {
      this.list = [11, 22];
    }, 1500);
  },
  methods: {
    fn() {
      console.log("fn click");
      this.show = !this.show;
      this.ok = !this.ok;
      this.html = "<h1>html innerHTML change</h1>";
      this.list = [111, 22, 331, 44];
    },
  },
});
