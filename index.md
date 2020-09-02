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

##### resolve 和 reject

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

##### 状态和函数

* 如果传递了函数以外的类型我们就不执行也不报错

* 我们还需要让succeed和fail是可传，可不传的。TS中可选择传参加个"?"才行。

* 我们还需要让状态改变，并且promise的值作为 succeed 或者 fail 的参数

* 我们还要让这个函数只执行一遍

* 在执行上下文堆栈仅包含平台代码之前，不得调用 onFulfilled(then的第一个参数) 和 onRejected(then的第二个参数)。这句话的意思是，当你的代码没执行完之前，不得调用then里面的函数。以为我们写了setTimeout执行，所以then里面的函数一定不会先执行。

  ```
  class PromiseSun {
      succeed = null;
      fail = null;
      state = "pending"
  	
  	// 参数result为promise的返回值
      resolve(result) {
          setTimeout(() => {
          	// 只允许执行一遍
          	if(this.state !== "pending") return;
          	// 改变状态
          	this.state = 'fulfilled';
          	// 非函数允许传,但是不报错
              if (typeof this.succeed === 'function') {
                  this.succeed(result);
              }
          }, 0)
      }
      reject(reason) {
          setTimeout(() => {
          	if(this.state !== "pending") return;
          	this.state = 'rejected';
              if (typeof this.fail === 'function') {
                  this.fail(reason);
              }
          }, 0)
      }
      constructor(fn) {
          if (typeof fn !== "function") {
              throw new Error("我只接受函数");
          }
          fn(this.resolve.bind(this), this.reject.bind(this));
      }
      then(succeed?, fail?) {
          if (typeof succeed === "function") {
              this.succeed = succeed;
          }
          if (typeof fail === 'function') {
              this.fail = fail;
          }
      }
  }
  
  export default PromiseSun;
  ```

我们继续深入

* 我们的succeed 和 fail 应该是必须被当做函数来调用，比如不能有this传进来。

  * 我们使用call让this成为undefined

  ```
  class PromiseSun {
      succeed = null;
      fail = null;
      state = "pending"
  
      resolve(result) {
          setTimeout(() => {
              if (this.state !== "pending") return;
              this.state = 'fulfilled';
              if (typeof this.succeed === 'function') {
              	// 让this为undefined
                  this.succeed.call(undefined, result);
              }
          }, 0)
      }
      reject(reason) {
          setTimeout(() => {
              if (this.state !== "pending") return;
              this.state = 'rejected';
              if (typeof this.fail === 'function') {
                  this.fail.call(this, reason);
              }
          }, 0)
      }
      constructor(fn) {
          if (typeof fn !== "function") {
              throw new Error("我只接受函数");
          }
          fn(this.resolve.bind(this), this.reject.bind(this));
      }
      then(succeed?, fail?) {
          if (typeof succeed === "function") {
              this.succeed = succeed;
          }
          if (typeof fail === 'function') {
              this.fail = fail;
          }
      }
  }
  
  export default PromiseSun;
  ```

* then可以在同一个promise里被多次调用

  * 这一步思路是: 我们需要将 成功 和 失败 的函数放进数组中
  * 然后将这个数组放在对象属性的数组上
  * 不断地调用对象属性的这个数组就可以了
  * 数据结构是[ [succeed,fail] ]

  ```
   class PromiseSun {
      state = "pending"
      callbacks = []
  
      resolve(result) {
          setTimeout(() => {
          	// this.callbacks --- [ [succeed,fail] ]
              this.callbacks.forEach(handle => {
                  if (this.state !== "pending") return;
                  this.state = 'fulfilled';
                  if (typeof handle[0] === 'function') {
                      handle[0].call(undefined, result);
                  }
              })
          }, 0)
      }
      reject(reason) {
          setTimeout(() => {
              this.callbacks.forEach(handle => {
                  if (this.state !== "pending") return;
                  this.state = 'rejected';
                  if (typeof handle[1] === 'function') {
                      handle[1].call(this, reason);
                  }
              })
          }, 0)
      }
      constructor(fn) {
          if (typeof fn !== "function") {
              throw new Error("我只接受函数");
          }
          fn(this.resolve.bind(this), this.reject.bind(this));
      }
      then(succeed?, fail?) {
          const handle = [];
          if (typeof succeed === "function") {
              handle[0] = succeed;
          }
          if (typeof fail === 'function') {
              handle[1] = fail;
          }
          // this.callbacks --- [ [succeed,fail] ]
          this.callbacks.push(handle)
      }
  }
  
  export default PromiseSun;
  ```

我们现在的promise已经是一个A+的promise了