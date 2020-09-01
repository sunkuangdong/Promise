## 手写Promise

为什么我们要学习手写Promise呢？通过思考以下一系列问题来回答这个问题

* 该技术要解决什么问题?
* 该技术是怎么解决它的?
* 该技术有什么优点?
* 该技术有什么缺点?
* 如何解决这些缺点?



我们来回答上面的问题:

* 能够解决回调地狱问题。
* 解决回调地狱是通过.then和.cache的方式
* 减少了代码缩进，解决了阅读困难。



Promise的完整API

* 类属性：length
* 类方法：all / allSettled / race / reject / resolve
* 对象属性：then(重要) / finally / catch
* 对象内部属性：state = pending / fulfilled / rejected

### Markdown

Markdown is a lightweight and easy-to-use syntax for styling your writing. It includes conventions for

```markdown
Syntax highlighted code block

# Header 1
## Header 2
### Header 3

- Bulleted
- List

1. Numbered
2. List

**Bold** and _Italic_ and `Code` text

[Link](url) and ![Image](src)
```

For more details see [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/).

### Jekyll Themes

Your Pages site will use the layout and styles from the Jekyll theme you have selected in your [repository settings](https://github.com/sunkuangdong/Promise/settings). The name of this theme is saved in the Jekyll `_config.yml` configuration file.

### Support or Contact

Having trouble with Pages? Check out our [documentation](https://docs.github.com/categories/github-pages-basics/) or [contact support](https://github.com/contact) and we’ll help you sort it out.
