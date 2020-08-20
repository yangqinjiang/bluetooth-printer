(function (global) {
    'use strict';
    const Generator = function (opt) {
        this._opt = opt
    }
    //触发事件
    Generator.prototype._triggerEvent = function (type = '', e = {}) {
        console.log(`trigger event of ${type}`)
        if (!this._opt) {
            console.error('unset opt')
            return
        }
        switch (type.toLowerCase()) {
            case 'start':
                this._opt.onStartEvent && this._opt.onStartEvent(e);
                break
            case 'done':
                this._opt.onDoneEvent && this._opt.onDoneEvent(e);
                break
            case 'next':
                this._opt.onNextEvent && this._opt.onNextEvent(e);
                break
            case 'error':
                this._opt.onErrorEvent && this._opt.onErrorEvent(e);
                break
            default:
                break
        }
    }

    //Generator 函数与 Promise 的结合 
    //使用 Generator 函数管理流程，遇到异步操作的时候，通常返回一个Promise对象
    //参考来源
    //https://es6.ruanyifeng.com/#docs/promise#Generator-%E5%87%BD%E6%95%B0%E4%B8%8E-Promise-%E7%9A%84%E7%BB%93%E5%90%88
    Generator.prototype.Run = function (generator) {
        console.debug('call Generator Run...')
        if (typeof generator !== "function") {
            throw new Error('param generator is not function')
        }
        this._triggerEvent('start')
        const it = generator();
        let that = this
        function go(result) {
            if (result.done) {
                that._triggerEvent('done')
                return result.value;
            }

            return result.value.then(function (value) {
                that._triggerEvent('next')
                return go(it.next(value));
            }, function (error) {
                that._triggerEvent('error')
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