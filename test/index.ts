import * as chai from "chai"
import Promise from "../src/promise"

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
        let called = false
        const promise = new Promise(() => {
            called = true
        })
        // @ts-ignore
        assert(called === true);
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
    it("promise.then(success) 中的 success 会在 resolve 被调用的时候执行", () => {
        let called = false;
        const promise = new Promise((resolve, reject) => {
            assert(called === false);
            resolve();
            setTimeout(() => {
                assert(called === true);
            })
        })
        // @ts-ignore
        promise.then(() => {
            called = true;
        })
    })
})