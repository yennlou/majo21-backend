---
title: MAJO21个站拆解02|代码规范/ESLint
series: MAJO21个站拆解
createdAt: 2020-01-15
---

## 代码规范 | Code Style

大部分合作的项目肯定要定代码规范，这是为了代码整洁，保持一致性，少出bug。

几个典型的前端代码规范如下
+ [Airbnb](https://github.com/airbnb/javascript)
+ [Google](https://google.github.io/styleguide/jsguide.html)
+ [Standard JS](https://github.com/standard/standard)

这个项目会用standardJS作为代码规范，出于个人习惯更喜欢单引号和不加分号。

人是不可靠的，代码规范需要工具来保障，一般会用到linter或者搭配prettier。

## Linter 还是 Prettier

linter是一种代码分析工具可以定位bug以及格式错误，有的linter可以直接修复错误(例如ESlint)。典型的在js下的linter会提示的错误或者警告有：
+ 有未使用的变量
+ 不应使用var关键词
+ 缩进用2空格还是4空格（根据规则设置）
+ 应该加/不加分号（根据规则设置）

更多的规则可以参考ESLint的[Rules页面](https://eslint.org/docs/rules/)

prettier是一个code formatter，它的功能很简单，就是为你格式化代码。那为什么有了linter还要考虑prettier呢，显然linter也可以帮你修复格式问题。我也不懂啊！用过的好心人可以留言告诉我搭配prettier的优势吗？这里就先介绍只使用ESLint的方式。

## 为项目加上ESLint

首先安装eslint

```bash
npm i -D eslint
```

再根据所使用代码编辑器安装对应的eslint插件，插件会调用eslint命令。

接着安装standardJS需要的配置与插件

```bash
npm i -D babel-eslint eslint-config-standard eslint-config-standard-react eslint-plugin-standard eslint-plugin-promise eslint-plugin-import eslint-plugin-node eslint-plugin-react
```

这一串的由来参考eslint-config-standard-react的[github主页](https://github.com/standard/eslint-config-standard-react)

其中babel-eslint是专为babel设计的parser，ESLint自己的默认parser不支持实验阶段的语言特性，所以需要设置parser为babel-eslint。

eslint-config-xx就是一堆规则的合集，eslint-plugin-xx就是插件。

接着在package.json中加入以下配置

```json
  "eslintConfig": {
    "parser": "babel-eslint",
    "extends": [
      "standard",
      "standard-react"
    ],
    "rules": {
      "react/prop-types": 0
    }
  },
```
也可以放在.eslintrc文件里，上一节babel的配置同理也可以放在package.json中。

extends项用来设置用到的eslint-config，默认省略eslint-config-前缀。

rules里举了个自定义一条规则的例子。0代表关掉规则，1代表警告，2代表错误。

自动fix代码的功能需要代码编辑器里做设置，可以设置成在save的时候自动fix代码

## 总结

写博客太累了。。写完四篇再修吧。。。