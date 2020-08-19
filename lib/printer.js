/**
 * @fileoverview Global |this| required for resolving indexes in node.
 * @suppress {globalThis}
 */
(function (global) {
    'use strict';
    const Printer = function (BYTE_COUNT_PER, writeMetaData) {
        this._BYTE_COUNT_PER = BYTE_COUNT_PER
        /**
         * 打印每一份时，循环发送分包数据的总次数
         */
        this._sendLoopTimesOfPerCopy = 0
        /**
         * 打印每一份时，最后发送的数据大小
         */
        this._lastSendDataLengthPerCopdy = 0
        /**
         * 打印每一份时，分包发送的第几次数
         */
        this._sendDataTimesOfPerCopy = 1
        /**
         * 当前已打印的份数
         */
        this._currentPrintCopies = 1


        this._writeMetaData = writeMetaData
    }
    Printer.prototype.processState = function (state) {
        //TODO: 执行状态
    }
    Printer.prototype.Write = function (buffer) {
        if (!buffer) {
            throw new Error('buffer 数据不完整,请输入重量.')
        }

        if (typeof buffer != 'object' || !buffer.sliceData2Printer) {
            throw new Error('ArrayBuffer没有定义sliceData2Printer原型函数')
        }

        if (this._BYTE_COUNT_PER <= 0) {
            throw new Error("_BYTE_COUNT_PER must > 0")
        }

        //更新变量
        this._sendLoopTimesOfPerCopy = parseInt(buffer.byteLength / this._BYTE_COUNT_PER) + 1 //循环次数要加一，否则不发送最后一次数据
        this._lastSendDataLengthPerCopdy = parseInt(buffer.byteLength % this._BYTE_COUNT_PER) //最后一次数据的大小
        this._sendDataTimesOfPerCopy = 1

        console.log(`打印一份的元数据: \n每次发送的数据大小BYTE_COUNT_PER=${this._BYTE_COUNT_PER}  \n循环发送次数_sendLoopTimesOfPerCopy=${this._sendLoopTimesOfPerCopy} \n最后一次发送的数据大小_lastSendDataLengthPerCopdy=${this._lastSendDataLengthPerCopdy} \n总发送的数据大小buff.byteLength=${buffer.byteLength}`)
        this.processState(2) //打印中
        let slicer = buffer.sliceData2Printer(this._BYTE_COUNT_PER)
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
        var that = this
        var currentTime = this._sendDataTimesOfPerCopy
        var loopTime = this._sendLoopTimesOfPerCopy
        var currentPrintCopies = this._currentPrintCopies
        //调用分割函数，获取相应的部分数据
        let write_buf = slicer()
        console.log("第" + currentTime + "次发送数据大小为：" + write_buf.byteLength)

        if (typeof wx != 'object') {
            throw new Error("此函数必须在微信小程序内运行.")
        }
        if (typeof wx.writeBLECharacteristicValue != 'function') {
            throw new Error("wx.writeBLECharacteristicValue 必须是一个函数")
        }

        wx.writeBLECharacteristicValue({
            deviceId: this._writeMetaData.deviceId || 0,
            serviceId: this._writeMetaData.serviceId || 0,
            characteristicId: this._writeMetaData.characteristicId || 0,
            value: write_buf,
            success: function (res) {
                console.log(res)
                if (0 !== res.errCode) {
                    console.error(res)
                    //that.showBLEModalWithoutCancelBtn(`打印失败,原因:${res.errMsg}`)
                    throw new Error(`打印失败,原因:${res.errMsg}`)
                }
                //打印每一份，第几次发送数据
                currentTime++
                if (currentTime <= loopTime) {
                    //下一次发送数据
                    that._sendDataTimesOfPerCopy = currentTime
                    that.SendToBLEPrinter(slicer) //下一次发送数据给打印机
                } else {

                    if (currentPrintCopies == PRINT_COPIES) {
                        //打印完成  多少份
                        that._sendLoopTimesOfPerCopy = 0
                        that._lastSendDataLengthPerCopdy = 0
                        that._sendDataTimesOfPerCopy = 1
                        that._currentPrintCopies = 1

                        //延时3s，更新打印状态
                        // setTimeout(function () {
                        //     that.processState(7) //打印
                        //     //    wx.showToast({
                        //     //      title: '打印完成'
                        //     //    })
                        // }, 5000)
                    } else {
                        //接着打印下一份
                        currentPrintCopies++
                        that._currentPrintCopies = currentPrintCopies
                        that._sendDataTimesOfPerCopy = 1
                        that.SendToBLEPrinter(slicer) //继续发送给打印机
                    }
                }
            },
            fail: function (e) {
                console.error("向低功耗蓝牙设备特征值中写入二进制数据失败=", e)
                //恢复状态
                that.processState(0) // 连接打印机
                throw new Error(`向打印机写入数据失败,请重新连接打印机 ， 检查蓝牙是否开启。\n${e.errMsg}`)
            },
            complete: function () {
                //  wx.hideLoading();
            }
        })

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