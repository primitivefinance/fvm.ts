"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ethers_1 = require("ethers");
const index_1 = require("../src/index");
describe('bigNumbertoHex', () => {
    it('should convert a BigNumber into hex', () => {
        chai_1.assert.equal((0, index_1.bigNumbertoHex)(ethers_1.BigNumber.from(2)), '02');
    });
    it('should convert another BigNumber into hex', () => {
        chai_1.assert.equal((0, index_1.bigNumbertoHex)(ethers_1.BigNumber.from(42)), '2a');
    });
});
describe('int8ToHex', () => {
    it('should convert to hex', () => {
        chai_1.assert.equal((0, index_1.uint8ToHex)(2), '02');
    });
    it('should convert to hex', () => {
        chai_1.assert.equal((0, index_1.uint8ToHex)(42), '2a');
    });
});
describe('packAmount', () => {
    it('should pack 1 into 0001', () => {
        chai_1.assert.equal((0, index_1.packAmount)(ethers_1.BigNumber.from(1)), '0001');
    });
    it('should pack 200 into 0202', () => {
        chai_1.assert.equal((0, index_1.packAmount)(ethers_1.BigNumber.from(200)), '0202');
    });
    it('should pack 1 ETH into 1201', () => {
        chai_1.assert.equal((0, index_1.packAmount)(ethers_1.BigNumber.from('1000000000000000000')), '1201');
    });
});
describe('encodeCreatePair', () => {
    it('should encode create pair', () => {
        const data = (0, index_1.encodeCreatePair)('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0x6B175474E89094C44Da98b954EedeAC495271d0F');
        chai_1.assert.equal(data, '0CA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB486B175474E89094C44Da98b954EedeAC495271d0F');
    });
});
describe('encodeCreatePool', () => {
    it('should encode create pool', () => {
        const data = (0, index_1.encodeCreatePool)(ethers_1.BigNumber.from(42), // 00002a
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', ethers_1.BigNumber.from(0), // 0000
        ethers_1.BigNumber.from(10), // 000a
        ethers_1.BigNumber.from(100), // 0064
        ethers_1.BigNumber.from(30), // 001e
        ethers_1.BigNumber.from(0), // 0000
        ethers_1.BigNumber.from('1000000000000000000'), // 1201
        ethers_1.BigNumber.from('1500000000000000000') // 1115
        );
        chai_1.assert.equal(data.toUpperCase(), ('0B'
            + '00002a'
            + 'A0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
            + '0000'
            + '000a'
            + '0064'
            + '001e'
            + '0000'
            + '25'
            + '1201'
            + '110f').toUpperCase());
    });
});
describe('encodeAllocateOrDeallocate', () => {
    it('should encode allocate', () => {
        const data = (0, index_1.encodeAllocateOrDeallocate)(true, false, ethers_1.BigNumber.from(42), // 0000002a
        ethers_1.BigNumber.from('1000000000000000000'));
        chai_1.assert.equal(data.toUpperCase(), '010000002a1201'.toUpperCase());
    });
    it('should encode deallocate', () => {
        const data = (0, index_1.encodeAllocateOrDeallocate)(false, false, ethers_1.BigNumber.from(42), // 0000002a
        ethers_1.BigNumber.from('1000000000000000000'));
        chai_1.assert.equal(data.toUpperCase(), '030000002a1201'.toUpperCase());
    });
});
describe('encodeClaim', () => {
    it('should encode claim', () => {
        const data = (0, index_1.encodeClaim)(ethers_1.BigNumber.from(42), // 0000002a
        ethers_1.BigNumber.from('500000000'), // 0805
        ethers_1.BigNumber.from('750'));
        chai_1.assert.equal(data.toUpperCase(), ('04' + '0000002a' + '08' + '0805' + '014b').toUpperCase());
    });
});
describe('encodeSwap', () => {
    it('should encode swap', () => {
        const data = (0, index_1.encodeSwap)(false, ethers_1.BigNumber.from(42), // 0000002a
        ethers_1.BigNumber.from('1000000000000000000'), // 1201
        ethers_1.BigNumber.from('1700000000'), // 0805
        true);
        chai_1.assert.equal(data.toUpperCase(), ('06' + '0000002a' + '08' + '1201' + '0811').toUpperCase());
    });
});
describe('packInstructions', () => {
    it('should pack instructions together', () => {
        const swap1 = (0, index_1.encodeSwap)(false, ethers_1.BigNumber.from(42), // 0000002a
        ethers_1.BigNumber.from('1000000000000000000'), // 1201
        ethers_1.BigNumber.from('1700000000'), // 0811
        true);
        const swap2 = (0, index_1.encodeSwap)(false, ethers_1.BigNumber.from(40), // 00000028
        ethers_1.BigNumber.from('1700000000'), // 0811
        ethers_1.BigNumber.from('100000000000000000'), // 1101
        true);
        const data = (0, index_1.packInstructions)([swap1, swap2]);
        chai_1.assert.equal(data.toUpperCase(), ('AA'
            + '02'
            + (0, index_1.uint8ToHex)(swap1.length / 2)
            + '06' + '0000002a' + '08' + '1201' + '0811'
            + (0, index_1.uint8ToHex)(swap2.length / 2)
            + '06' + '00000028' + '08' + '0811' + '1101').toUpperCase());
    });
});
