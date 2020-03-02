---
title: MAJO21个站拆解01|环境搭建
series: MAJO21个站拆解
tags: REACT,WEBPACK,BABEL
createdAt: 2020-01-12
---

## 前言

个站代码暂时不想开源，因为是一人项目，所以很多地方写的很随便，不好意思公开阿\_(:з」∠)_。So这里会用一个新的例子来说明个站用到的技术。这个系列简而言之就是基于React和Serverless的基础web开发教程。

具体会涉及的内容：webpack，babel，eslint，react全家桶，styled-components，自适应布局，自适应图片，图标/字体管理，jest，storybook，serverless，dynamodb，dns，cdn，cicd，加其它一些乌七八糟web开发需要的东西。。。欸，个站现在也没做测试也没做自适应图片，本来就没开发完嘛¯\\\_(ツ)_/¯。这个系列主要是想涵盖一个一般web开发可能涉及到的所有点，完了做一张cheatsheet给自己用。

{这里是一张架构图，先空着}

要做的这个例子是一个猫头鹰图片站Owwwwls，就是展示很多猫头鹰的图片和描述帮你认猫头鹰，之后会多加一个认猫头鹰的小游戏和截猫头鹰头像的功能（不包含在教程里），快来撸猫头鹰🦉～～

{最终效果图，还没做完，先空着}

## 创建项目

创建一个项目文件夹owwwwls并初始化项目
```sh
npm init -y
```

初始文件目录很简单
```
owwwwls
├── package.json
├── src
│   ├── index.html      #首页模版
│   └── index.js        #app入口
├── webpack.config.js   #webpack配置文件
└── .babelrc            #babel配置文件
```

安装React依赖库
```sh
npm i react react-dom
```
PS.新版npm早就不需要``--save``了

先写一个最简单的React应用，[React的使用](https://reactjs.org/docs/getting-started.html)

src/index.js
```javascript
import React from 'react'
import ReactDOM from 'react-dom'

const App = () => (
  <h1>Owwwwls</h1>
)

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
```

## Babel
为什么需要Babel？不同版本浏览器对js的语法的支持度不同，babel可以将es6以上的语法编译为es5以兼容更多的浏览器，也可以依靠预设或者插件来完成任何想要的语法转换（比如jsx）。

安装Babel依赖库
```sh
npm i -D @babel/core @babel/plugin-proposal-class-properties @babel/preset-env @babel/preset-react
```

+ @babel/core：babel本体
+ @babel/preset-env：这个预设可以根据设置的浏览器覆盖范围，智能转换语法，不设置就转换所有es6以上语法
+ @babel/preset-react：这个预设可以转换jsx语法
+ @babel/plugin-proposal-class-properties：https://babeljs.io/docs/en/babel-plugin-proposal-class-properties

配置babel

.babel
```json
{
  "presets": [
    [
      "@babel/preset-env",
      { "modules":false }
    ],
    "@babel/preset-react"
  ],
  "plugins": [
    "@babel/plugin-proposal-class-properties"
  ]
}
```

``{ "modules":false }``是因为babel默认把模块化语法从esm转换成cjs（后面解释），webpack可以直接打包esm或者cjs，但是cjs会影响treeshaking。

## Webpack

为什么需要webpack？浏览器环境原生不支持js模块化，所以需要模块化方案。模块化方案简单说就是require，import，export，define这些东西，一般模块化方案有[IIFE](https://coryrylan.com/blog/javascript-module-pattern-basics)，[AMD](https://requirejs.org/docs/whyamd.html)，[UMD](https://riptutorial.com/javascript/example/16339/universal-module-definition--umd-)，CJS(nodejs)，[ESM](https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export)，然后这些都是什么鬼呢，为什么就模块化这一件事要搞那么多不一样的规范和实践呢，都是历史遗留问题，现在就看ES吧，ES是语言官方标准。

webpack呢，主要工作负责把不同模块资源打包好让浏览器运行，而且还能干很多别的事情，具体参考[官方指南](https://webpack.js.org/guides/)左边这排索引。

安装Webpack依赖库
```sh
npm i -D webpack webpack-cli
npm i -D babel-loader html-webpack-plugin
```

+ webpack：webpack本体
+ webpack-cli：webpack命令行工具
+ babel-loader：webpack通过它调用babel
+ html-webpack-plugin：根据模版输出最终带编译后js文件链接的html文件

配置webpack

webpack.config.js
```javascript
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    app: './src/index.js'   //入口文件，从入口开始分析所有的依赖关系
  },
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist')   //打包后文件会输出到dist目录下
  },
  module: {
    rules: [
      {
        test: /.js$/,     //通过正则匹配，不同类型文件使用不同的loader处理
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: './index.html'
    })
  ]
}
```

补上``src/index.html``模版文件
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Owwwwls</title>
</head>
<body>
  <div id="app"></div>
</html>
```

## 运行环境

目前``package.json``文件如下所示
```json
{
  "name": "owwwwls",
  "version": "0.1.0",
  "description": "",
  "main": "index.js",
  "dependencies": {
    "react": "^16.12.0",
    "react-dom": "^16.12.0"
  },
  "devDependencies": {
    "@babel/core": "^7.7.7",
    "@babel/plugin-proposal-class-properties": "^7.7.4",
    "@babel/preset-env": "^7.7.7",
    "@babel/preset-react": "^7.7.4",
    "babel-loader": "^8.0.6",
    "html-webpack-plugin": "^3.2.0",
    "webpack": "^4.41.5",
    "webpack-cli": "^3.3.10"
  },
  "scripts": {
    "build": "webpack --mode production"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/yennlou/Owls.git"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/yennlou/Owls/issues"
  },
  "homepage": "https://github.com/yennlou/Owls#readme"
}

```

开始打包
```sh
npm start build
```

这里用http-searver来serve打包后的文件

```sh
npm i http-server -g
http-server ./dist
```

打开浏览器就可以看到结果了。

最后为了防止多次build导致dist里文件越来越多，可以装一个``clean-webpack-plugin``插件。
```sh
npm i -D clean-webpack-plugin
```

webpack.config.js
```javascript
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
...
plugins: [
  new CleanWebpackPlugin(),
  new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html'
  })
]
```

## 总结

就，不用create-react-app写react应用也是很简单的，下一期讲eslint。