class PromiseSun {
    // 对象的默认属性
    succeed = null;
    fail = null;
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
        fn(this.resolve.bind(this), this.reject.bind(this));
    }
    then(succeed, fail) {
        // 将这两个函数提供给fn使用
        this.succeed = succeed;
        this.fail = fail;
    }
}

export default PromiseSun;