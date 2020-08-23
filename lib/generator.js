(function (global) {
    'use strict';
    const Generator = function (opt, debug = false) {
        this._opt = opt
        this._debug = debug
    }

    //Generator 函数与 Promise 的结合 
    //使用 Generator 函数管理流程，遇到异步操作的时候，通常返回一个Promise对象
    //参考来源
    //https://es6.ruanyifeng.com/#docs/promise#Generator-%E5%87%BD%E6%95%B0%E4%B8%8E-Promise-%E7%9A%84%E7%BB%93%E5%90%88
    Generator.prototype.Run = function (generator) {
        this._debug && console.debug('call Generator Run...')
        if (typeof generator !== "function") {
            throw new Error('param generator is not function')
        }
        const it = generator();
        let that = this
        function go(result) {
            if (result.done) {
                return result.value;
            }

            return result.value.then(function (value) {
                return go(it.next(value));
            }, function (error) {
                return go(it.throw(error));
            });
        }

        go(it.next());
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = {
            Generator: Generator
        };
    }
}(this || {}));