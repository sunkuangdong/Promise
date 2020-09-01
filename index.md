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



### 学习准备

这里先准备一下我们所需要的工具

* 单元测试工具chai / mocha
* 代码编辑工具ts

```
yarn global add ts-node mocha
yarn add --dev @types/chai @types/mocha
```

### Promise开始

先从最简单的开始，然后我们逐渐去改写这个Promise

##### Promise的类

* 创建一个关于Promise的类，这里注意一下，由于我们用的是TS，所以这个类名不能和Promise重复，本人姓孙，就起了个名字

  ```
  class PromiseSun {}
  export default PromiseSun;
  ```

* 对这个类我们会不断地思考、补充，最后会形成我们的Promise，我们先来思考我们 new Promise里面应该接受的是什么？？？

  是true？是string？很明显，应该是一个function，如果不是一个function我们应该让他报错

  ```
  class PromiseSun {
  	constructor(fn) {
  		if(typeof fn !== "function"){
  			throw new Error("我只接受函数")
  		}
  	}
  }
  export default PromiseSun;
  ```

* 好啦，我们现在必须接受一个函数了，但是我们最关键的一个函数没有，then函数，我们先让它可以支持返回一个then函数，then函数先啥也不干。

  ```
  class PromiseSun {
  	constructor(fn) {
  		if(typeof fn !== "function"){
  			throw new Error("我只接受函数")
  		}
  	}
  	then() {}
  }
  export default PromiseSun;
  ```

* 我们知道我们的Promise是一个立即执行函数，如何能让他成为一个立即执行函数，测试代码又怎么写呢？

  ```
  class PromiseSun {
  	constructor(fn) {
  		if(typeof fn !== "function"){
  			throw new Error("我只接受函数")
  		}
  		// 传过来就执行，立即执行
  		fn();
  	}
  	then() {}
  }
  
  // 测试代码
  let called = false
  const promise = new Promise(() => {
  	called = true
  })
  // @ts-ignore
  assert(called === true);
  
  export default PromiseSun;
  ```

#### resolve 和 reject

* 接下来我们要逐渐深入了，我们知道Promise传递函数的时候还有两个参数 resolve 和 reject ，这两个参数是两个函数，我们来让fn函数接受这两个参数

  ```
  class PromiseSun {
      constructor(fn) {
          if (typeof fn !== "function") {
              throw new Error("我只接受函数");
          }
          // 让fn接受两个函数
          fn(() => { }, () => { });
      }
      then() { }
  }
  
  export default PromiseSun;
  ```

  我们的promise是支持.then的并且会返回一个success，这个success会在resolve 被调用的时候执行，这里面会有一个问题，我们一边来完善代码一边来分析解决这个问题

  看下面的代码：

  * 我们想要给我们的Promise传递一个fn，这个fn的两个参数是then传递过来的两个函数
  * 我的fn会执行，then传递过来的函数，从而对完成then的实现
  * 可是我的fn是一个立即执行函数（上面测试过），你传给Promise我就调用了，这个时候我还没给then传参，导致报错。

  ```
  class PromiseSun {
      // 对象的默认属性
      succeed = null;
      fail = null;
      constructor(fn) {
          if (typeof fn !== "function") {
              throw new Error("我只接受函数");
          }
          // 问题在这里
          /* fn现在就是这个函数：
          	(resolve, reject) => {
          		/*  resolve()就是() => { this.succeed(); }()
          			而执行this.succeed()的时候then还没有传递过来，导致报错
          		*/
  				resolve();
  			}
  		*/
          fn(() => {
              this.succeed();
          }, () => {
              this.fail();
          });
      }
      then(succeed, fail) {
          this.succeed = succeed;
          this.fail = fail;
      }
  }
  
  // 测试代码
  let called = false;
  // 给Promise传递一个fn
  const promise = new Promise((resolve, reject) => {
  	// 这个是调用then传递过来的函数
  	resolve();
  })
  // @ts-ignore
  // 给then传一个函数供fn执行
  promise.then(() => {
      called = true;
  })
          
  export default PromiseSun;
  ```

* 我们知道了问题之后对这个代码进行改造

  * 我们将fn中的函数添加上setTimeout让它后执行。
  * 代码优化一下

  ```
  class PromiseSun {
      succeed = null;
      fail = null;
      // fn里面的函数 //
      resolve() {
          setTimeout(() => {
              this.succeed();
          }, 0)
      }
      reject() {
          setTimeout(() => {
              this.fail();
          }, 0)
      }
      
      constructor(fn) {
          if (typeof fn !== "function") {
              throw new Error("我只接受函数");
          }
          // 优化了
          fn(this.resolve.bind(this), this.reject.bind(this));
      }
      then(succeed, fail) {
          // 将这两个函数提供给fn使用
          this.succeed = succeed;
          this.fail = fail;
      }
  }
  
  export default PromiseSun;
  ```

  









### Support or Contact







