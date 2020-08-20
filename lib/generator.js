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