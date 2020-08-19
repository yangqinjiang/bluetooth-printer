const { PrinterJobs, PrinterUtil } = require('../index')
var expect = require('chai').expect;

describe('测试PrinterJobs', function () {
    describe('测试PrinterJobs函数', function () {
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
        let printerJobs = new PrinterJobs();
        printerJobs
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

        let buffer = printerJobs.buffer();
        //console.log('ArrayBuffer', 'length: ' + buffer.byteLength, ' hex: ' + ab2hex(buffer).substring(0, 10) + '...');
        expect(buffer.byteLength).to.be.equal(490);
        expect(ab2hex(buffer).substring(0, 10)).to.be.equal('1b,40,2d,2');
    });
});