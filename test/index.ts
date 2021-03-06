import * as chai from "chai"
import Promise from "../src/promise"
import * as sinon from "sinon"
import * as sinonChai from "sinon-chai"
chai.use(sinonChai)

const assert = chai.assert;
describe("Promise", () => {
    it("是一个类", () => {
        assert.isFunction(Promise);
        assert.isObject(Promise.prototype);
    })
    it("new Promise() 如果接受的不是一个函数就报错", () => {
        assert.throw(() => {
            // @ts-ignore
            new Promise()
        })
        assert.throw(() => {
            new Promise(false)
        })
        assert.throw(() => {
            new Promise(1)
        })
    })
    it("new Promise() 会生成一个对象, 对象有then方法", () => {
        const promise = new Promise(() => { })
        assert.isFunction(promise.then)
    })
    it("new Promise(fn) 中的fn立即执行", () => {
        let fn = sinon.fake()
        new Promise(fn)
        assert(fn.called);
    })
    it("new Promise() 中的 fn 执行的时候接受 resolve 和 reject 两个函数", () => {
        let called = false
        const promise = new Promise((resolve, reject) => {
            called = true
            assert.isFunction(resolve);
            assert.isFunction(reject);
        })
        // @ts-ignore
        assert(called === true);
    })
    it("promise.then(success) 中的 success 会在 resolve 被调用的时候执行", done => {
        const success = sinon.fake();
        const promise = new Promise((resolve, reject) => {
            assert.isFalse(success.called)
            resolve();
            setTimeout(() => {
                assert.isTrue(success.called)
                done();
            })
        })
        // @ts-ignore
        promise.then(success)
    })
    it("promise.then(null, fail) 中的 fail 会在 reject 被调用的时候执行", done => {
        const fail = sinon.fake();
        const promise = new Promise((resolve, reject) => {
            assert.isFalse(fail.called)
            reject();
            setTimeout(() => {
                assert.isTrue(fail.called)
                done();
            })
        })
        // @ts-ignore
        promise.then(null, fail)
    })
    it("then里传的不是一个函数也不报错", () => {
        const promise = new Promise(resolve => {
            resolve();
        });
        promise.then(false, null);
        assert(1 === 1);
    })
    it("关于succeed 判断我们的状态是调用后改变的", done => {
        const succeed = sinon.fake();
        const promise = new Promise(resolve => {
            resolve(233);
            resolve(2332);
            setTimeout(() => {
                assert(promise.state === 'fulfilled');
                assert.isTrue(succeed.calledOnce);
                assert(succeed.calledWith(233));
                done();
            })
        })
        promise.then(succeed)
    })
    it("关于fail 判断我们的状态是调用后改变的", done => {
        const fail = sinon.fake();
        const promise = new Promise(reject => {
            reject(233);
            reject(2332);
            setTimeout(() => {
                assert(promise.state === 'fulfilled');
                assert.isTrue(fail.calledOnce);
                assert(fail.calledWith(233));
                done();
            })
        })
        promise.then(fail)
    })
    it("在我的代码执行完之前，不得调用 then 后面的两个函数", done => {
        const succeed = sinon.fake();
        const promise = new Promise(resolve => {
            resolve(233);
        })
        promise.then(succeed);
        assert.isFalse(succeed.called);
        setTimeout(() => {
            assert.isTrue(succeed.called);
            done()
        }, 0);
    })
    it("失败回调", done => {
        const fail = sinon.fake();
        const promise = new Promise((resolve, reject) => {
            reject();
        });
        promise.then(null, fail);
        assert.isFalse(fail.called);
        setTimeout(() => {
            assert.isTrue(fail.called);
            done();
        }, 0);
    })
    it("我们的succeed 和 fail 应该是必须被当做函数来调用", (done) => {
        const promise = new Promise(resolve => {
            resolve();
        });
        promise.then(function () {
            "use strict";
            assert(this === undefined);
            done()
        })
    })
    it("then可以在同一个promise里被多次调用, 测试resolve", (done) => {
        const promise = new Promise(resolve => {
            resolve();
        });
        const callbacks = [sinon.fake(), sinon.fake(), sinon.fake()];
        promise.then(callbacks[0]);
        promise.then(callbacks[1]);
        promise.then(callbacks[2]);
        setTimeout(() => {
            assert(callbacks[0].called);
            assert(callbacks[1].called);
            assert(callbacks[2].called);
            assert(callbacks[1].calledAfter(callbacks[0]))
            assert(callbacks[2].calledAfter(callbacks[1]))
            done();
        })
    })
    it("then可以在同一个promise里被多次调用, 测试rejected", (done) => {
        const promise = new Promise((resolve, reject) => {
            reject();
        });
        const callbacks = [sinon.fake(), sinon.fake(), sinon.fake()];
        promise.then(null, callbacks[0]);
        promise.then(null, callbacks[1]);
        promise.then(null, callbacks[2]);
        setTimeout(() => {
            assert(callbacks[0].called);
            assert(callbacks[1].called);
            assert(callbacks[2].called);
            assert(callbacks[1].calledAfter(callbacks[0]))
            assert(callbacks[2].calledAfter(callbacks[1]))
            done();
        })
    })
})