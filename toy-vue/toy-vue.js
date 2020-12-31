export class ToyVue {
  constructor(config) {
    this.template = document.querySelector(config.el);
    this.data = reactive(config.data);
    this.methods = config.methods;

    for (let name in config.methods) {
      this[name] = (...args) => config.methods[name].apply(this.data, args);
    }

    this.traversal(this.template);
  }
  traversal(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.trim().match(/^{{([\s\S]+)}}$/)) {
        const name = RegExp.$1.trim();
        effect(() => (node.textContent = this.data[name]));
      }
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      let attributes = node.attributes;
      for (let attr of attributes) {
        console.log(attr.name);
        if (attr.name === "v-model") {
          let name = attr.value;
          effect(() => {
            node.value = this.data[name];
          });
          node.addEventListener("input", (event) => {
            this.data[name] = node.value;
          });
        } else if (attr.name.trim().match(/^v-bind:([\s\S]*)$/)) {
          const key = RegExp.$1.trim();
          const name = attr.value;
          console.log(key, name);
          effect(() => {
            node[key] = this.data[name];
          });
        } else if (attr.name.trim().match(/^v-on:([\s\S]*)$/)) {
          const key = RegExp.$1.trim();
          const name = attr.value;
          node.addEventListener(key, this[name]);
        }
      }
    }
    if (node.childNodes.length) {
      node.childNodes.forEach((r) => this.traversal(r));
    }
  }
}

let effects = new Map();
let currentEffect = null;
function effect(fn) {
  currentEffect = fn;
  fn();
  currentEffect = null;
}
function reactive(object) {
  let observed = new Proxy(object, {
    get(obj, prop) {
      //   console.log(obj, prop);
      if (currentEffect) {
        if (!effects.has(obj)) {
          effects.set(obj, new Map());
        }
        if (!effects.get(obj).has(prop)) {
          effects.get(obj).set(prop, new Array());
        }
        effects.get(obj).get(prop).push(currentEffect);
      }
      return obj[prop];
    },
    set(obj, prop, value) {
      obj[prop] = value;
      if (effects.get(obj)?.get(prop)) {
        effects
          .get(obj)
          ?.get(prop)
          .forEach((effect) => effect());
      }
      return true;
    },
  });
  return observed;
}

// let dummy;
// const counter = reactive({ num: 0 });
// effect(() => {
//   alert(counter.num);
//   //   dummy = counter.num;
// });
// window.counter = counter;
