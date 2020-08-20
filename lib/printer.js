
var Generator = require("./generator.js");
/**
 * @fileoverview Global |this| required for resolving indexes in node.
 * @suppress {globalThis}
 */
(function (global) {
    /**
     * 编写原型函数
     * 分割数据给打印机，因为打印机一次消费不了这么多的数据量
     * @param {*} maxByteCount  每次最大读取的字节数量
     */
    ArrayBuffer.prototype.sliceData = function (maxByteCount) {
        let i = 0; //使用闭包，保持变量i ，在闭包内更新变量i

        return function () {
            if (this.byteLength <= 0) {
                console.error("打印空数据")
                return new ArrayBuffer(0)
            }

            //获取一部分数据
            let subPackage = this.slice(i, i + maxByteCount <= this.byteLength ? (i + maxByteCount) : this.byteLength);
            i += maxByteCount //在闭包内更新变量i

            return subPackage

        }.bind(this)
    }
    'use strict';
    const Printer = function (byte_count_per) {
        if (typeof byte_count_per !== 'number') {
            throw new Error('byte_count_per 必须是一个Number类型的数据.')
        }
        /**
         * 当前每次发送字节数
         */
        this._BYTE_COUNT_PER = byte_count_per
    }

    Printer.prototype.Write = function (buffer) {
        if (!buffer) {
            throw new Error('buffer 数据不完整,请输入重量.')
        }

        if (typeof buffer != 'object' || !buffer.sliceData) {
            throw new Error('ArrayBuffer没有定义sliceData原型函数')
        }

        if (this._BYTE_COUNT_PER <= 0) {
            throw new Error("_BYTE_COUNT_PER must > 0")
        }

        //更新变量
        this._total = parseInt(buffer.byteLength / this._BYTE_COUNT_PER) + 1 //循环次数要加一，否则不发送最后一次数据
        let _lastSendDataLengthPerCopdy = parseInt(buffer.byteLength % this._BYTE_COUNT_PER) //最后一次数据的大小


        console.debug(`打印一份的元数据: \n每次发送的数据大小BYTE_COUNT_PER=${this._BYTE_COUNT_PER}  \n循环发送次数  _total=${this._total} \n最后一次发送的数据大小_lastSendDataLengthPerCopdy=${_lastSendDataLengthPerCopdy} \n总发送的数据大小buff.byteLength=${buffer.byteLength}`)

        let slicer = buffer.sliceData(this._BYTE_COUNT_PER)
        this.SendToBLEPrinter(slicer)
        //http://www.ruanyifeng.com/blog/2009/08/learning_javascript_closures.html

        //由于闭包会使得函数中的变量都被保存在内存中，内存消耗很大，
        //所以不能滥用闭包，否则会造成网页的性能问题，在IE中可能导致内存泄露。
        //  -->  解决方法是，在退出函数之前，将不使用的局部变量全部删除。
        slicer = null
    }
    /**
 * 分包发送给蓝牙打印机
 */
    Printer.prototype.SendToBLEPrinter = function (slicer) {
        if (typeof slicer != 'function') {
            throw new Error("slicer 必须是一个闭包函数")
        }


        // this.SendToPrinter = function (write_buf,i,  _total) {
        //     return new Promise(function (resolve, reject) {
        //         setTimeout(function () {
        //             resolve(`打印-${idx}`);
        //         }, 200)
        //     });
        // }
        if (typeof this.SendToPrinter !== 'function') {
            throw new Error("SendToPrinter 必须是一个闭包函数,签名是: function (write_buf,i,  _total) , 返回值是Promise")
        }

        //使用 yield,generator 构造任务队列

        let gen = new Generator.Generator({
            onStartEvent: function (e) {
                console.log('call onStartEvent')
            },
            onDoneEvent: function (e) {
                console.log('call onDoneEvent')
            },
            onNextEvent: function (e) {
                console.log('call onNextEvent')
            },
            onErrorEvent: function (e) {
                console.log('call onErrorEvent')
            },
        })
        //TODO: 可以把 g改写成Printer的原型函数
        const g = function* () {
            //循环 this._total次
            for (var i = 1; i <= this._total; i++) {
                //slicer 调用分割函数，获取相应的部分数据
                yield this.SendToPrinter(slicer(), i, this._total)
            }
        }.bind(this);

        gen.Run(g)
    }

    //code here
    var printerjobs = require("./printerjobs.js");

    if (typeof module !== "undefined" && module.exports) {
        module.exports = {
            printerjobs: printerjobs,
            Printer: Printer
        };
    }

}(this || {}));