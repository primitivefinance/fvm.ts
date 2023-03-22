import { assert } from 'chai';

import {
  BigNumber,
} from 'ethers';
import {
  packAmount,
  bigNumbertoHex,
  int8ToHex,
  encodeCreatePair,
  encodeCreatePool,
  encodeAllocateOrDeallocate,
  encodeClaim,
  encodeSwap,
} from '../src/index';

describe('bigNumbertoHex', () => {
  it('should convert a BigNumber into hex', () => {
    assert.equal(bigNumbertoHex(BigNumber.from(2)), '02');
  });

  it('should convert another BigNumber into hex', () => {
    assert.equal(bigNumbertoHex(BigNumber.from(42)), '2a');
  });
});

describe('int8ToHex', () => {
  it('should convert to hex', () => {
    assert.equal(int8ToHex(2), '02');
  });

  it('should convert to hex', () => {
    assert.equal(int8ToHex(42), '2a');
  });
});

describe('packAmount', () => {
  it('should pack 1 into 0001', () => {
    assert.equal(packAmount(BigNumber.from(1)), '0001');
  });

  it('should pack 200 into 0202', () => {
    assert.equal(packAmount(BigNumber.from(200)), '0202');
  });

  it('should pack 1 ETH into 1201', () => {
    assert.equal(packAmount(BigNumber.from('1000000000000000000')), '1201');
  });
});

describe('encodeCreatePair', () => {
  it('should encode create pair', () => {
    const data = encodeCreatePair(
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    );

    assert.equal(
      data,
      '0CA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB486B175474E89094C44Da98b954EedeAC495271d0F'
    );
  });
});

describe('encodeCreatePool', () => {
  it('should encode create pool', () => {
    const data = encodeCreatePool(
      BigNumber.from(42), // 00002a
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      BigNumber.from(0), // 0000
      BigNumber.from(10), // 000a
      BigNumber.from(100), // 0064
      BigNumber.from(30), // 001e
      BigNumber.from(0), // 0000
      BigNumber.from('1000000000000000000'), // 1201
      BigNumber.from('1500000000000000000') // 1115
    );

    assert.equal(
      data.toUpperCase(),
      ('0B'
      + '00002a'
      + 'A0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      + '0000'
      + '000a'
      + '0064'
      + '001e'
      + '0000'
      + '25'
      + '1201'
      + '110f').toUpperCase()
    );
  });
});

describe('encodeAllocateOrDeallocate', () => {
  it('should encode allocate', () => {
    const data = encodeAllocateOrDeallocate(
      true,
      false,
      BigNumber.from(42), // 0000002a
      BigNumber.from('1000000000000000000'), // 1201
    );

    assert.equal(
      data.toUpperCase(),
      '010000002a1201'.toUpperCase()
    );
  });

  it('should encode deallocate', () => {
    const data = encodeAllocateOrDeallocate(
      false,
      false,
      BigNumber.from(42), // 0000002a
      BigNumber.from('1000000000000000000'), // 1201
    );

    assert.equal(
      data.toUpperCase(),
      '030000002a1201'.toUpperCase()
    );
  });
});

describe('encodeClaim', () => {
  it('should encode claim', () => {
    const data = encodeClaim(
      BigNumber.from(42), // 0000002a
      BigNumber.from('500000000'), // 0805
      BigNumber.from('750'), // 014b
    );

    assert.equal(
      data.toUpperCase(),
      ('04' + '0000002a' + '08' + '0805' + '014b').toUpperCase()
    );
  });
});

describe('encodeSwap', () => {
  it('should encode swap', () => {
    const data = encodeSwap(
      false,
      BigNumber.from(42), // 0000002a
      BigNumber.from('1000000000000000000'), // 1201
      BigNumber.from('1700000000'), // 0805
      true
    );

    assert.equal(
      data.toUpperCase(),
      ('06' + '0000002a' + '08' + '1201' + '0811').toUpperCase(),
    );
  });
});
