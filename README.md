# euv

why euv? because:  
```js
'vue'.split('').sort().join('') // euv
```
source:
```js
'node'.split('').sort().join('') // deno
```
# Quick Start

> 初版，目前还有 `case` 没有测试

安装 `parcel` 运行项目
```
npm install -g parcel-bundler
```
运行
```
npm run dev
// or
parcel index.html
```

# 目前支持功能

- [x] `虚拟DOM`
- [x] `Diff更新`
- [x] `{{ data }}` or `{{ data + 'test' }}` or `{{ fn(data) }}`
- [x] `v-for` // `v-for="(item, index) in list"` or `v-for="(item, index) in 10"` or `v-for="(item, index) in 'string'"`
- [x] `v-if`
- [x] `v-show`
- [x] `v-html`
- [x] `v-model`
- [x] `v-click` 点击事件
- [x] `computed` 计算属性
- [x] `watch` 监听
- [x] `beforeCreate`、`created`、`mounted`、`beforeUpdate`、`updated`
- [x] `:class`
- [x] `:style`

