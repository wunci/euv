import Vue from "./core/vue";

new Vue({
  el: "#div1",
  data: {
    a: { b: "a.b" },
    b: 2,
    c: false,
    d: true,
    test: 22,
    html: "<h2>2123123</h2>",
    list: [11, 22, 33, 44],
  },
  computed: {
    hello() {
      return this.b + this.html;
    },
  },
  watch: {
    b(val, oldVal) {
      console.log("watch", val, oldVal);
    },
    test(val, oldVal) {
      console.log("watch", val, oldVal);
    },
  },
  mounted() {
    console.log(this.hello);
    setTimeout(() => {
      // this.a = { b: 231231 };
      // this.b = "-----";
      // console.log(this.hello);
      debugger;
      this.list = [11, 22];
      this.c = false;
      // this.html = "0000";
      // setTimeout(() => {
      //   this.list = [11, 22, 33, 44];
      // }, 1000);
      // this.html = 12131;
      // this.c = true;
    }, 1000);
    // setTimeout(() => {
    //   this.b = 123;
    //   this.list = [1];
    // }, 3000);
  },
  methods: {
    fn() {
      this.b = 3;
      this.c = false;
      this.list = [111, 22, 331, 44];
    },
  },
});
