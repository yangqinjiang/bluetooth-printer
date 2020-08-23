const { PrintDataBuilder, PrinterUtil, Printer, Generator } = require('../index')
var expect = require('chai').expect;

describe('测试PrintDataBuilder', function () {
    describe('测试PrintDataBuilder函数', function () {
        // ArrayBuffer转16进度字符串示例
        function ab2hex(buffer) {
            const hexArr = Array.prototype.map.call(
                new Uint8Array(buffer),
                function (bit) {
                    return ('00' + bit.toString(16)).slice(-2)
                }
            )
            return hexArr.join(',')
        }
        let builder = new PrintDataBuilder();
        builder
            .print(PrinterUtil.fillAround('打印测试 开始'))
            .print(PrinterUtil.formatDateTime(new Date()))
            .print(PrinterUtil.fillLine())
            .setAlign('ct')
            .setSize(2, 2)
            .print('#20 XYZ外卖')
            .setSize(1, 1)
            .print('切尔西Chelsea')
            .setSize(1, 1)
            .text('在线支付(已支付)')
            .setSize(2, 2)
            .print('￥100.00')
            .setSize(1, 1)
            .print('订单号：5415221202244734')
            .print('下单时间：2017-07-07 18:08:08')
            .setAlign('lt')
            .print(PrinterUtil.fillAround('一号口袋'))
            .print(PrinterUtil.inline('意大利茄汁一面 * 1', '15'))
            .print(PrinterUtil.fillAround('其他'))
            .print('餐盒费：1')
            .print('[赠送康师傅冰红茶] * 1')
            .print(PrinterUtil.fillLine())
            .setAlign('rt')
            .print('原价：￥16')
            .print('总价：￥16')
            .setAlign('lt')
            .print(PrinterUtil.fillLine())
            .print('备注')
            .print("无")
            .print(PrinterUtil.fillAround('打印测试 结束'))
            .println();

        let buffer = builder.buffer();

        expect(buffer.byteLength).to.be.equal(490);
        expect(ab2hex(buffer).substring(0, 10)).to.be.equal('1b,40,2d,2');
        let eventHandler = {
            onStartEvent: function (e) {
                console.log('call onStartEvent eventHandler')
            },
            onDoneEvent: function (e) {
                console.log('call onDoneEvent eventHandler')
            },
            onNextEvent: function (e) {
                console.log('call onNextEvent eventHandler')
            },
            onErrorEvent: function (e) {
                console.log('call onErrorEvent eventHandler', e)
            },
        }
        let printer = new Printer(20, eventHandler, !false)
        printer.SendToPrinter = function (write_buf, idx, total) {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    console.log(`第 ${idx}/${total} 次发送数据大小为：${write_buf.byteLength}`)
                    console.debug(`SendToPrinter:打印-${idx}/${total}`, (new Date()).toUTCString())
                    if (idx == total - 1) {
                        reject(new Error('your error'))
                    } else {
                        resolve();
                    }

                }, 20)
            });
        }
        printer.Write(buffer)

    });
    describe('测试yield与Generator', function () {
        function getFoo(idx) {
            return new Promise(function (resolve, reject) {
                resolve(`模拟打印-${idx}`);
            });
        }

        const g = function* () {

            try {
                for (var i = 0; i < 20; i++) {
                    console.log(yield getFoo(i));
                }

            } catch (e) {
                console.log(e);
            }
        };
        let gen = new Generator.Generator()
        gen.Run(g)
    })
});