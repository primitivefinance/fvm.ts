import { assert } from 'chai';

import {
  BigNumber, ethers,
} from 'ethers';
import {
  packAmount,
  bigNumbertoHex,
  uint8ToHex,
  encodeCreatePair,
  encodeCreatePool,
  encodeAllocateOrDeallocate,
  encodeClaim,
  encodeSwap,
  packInstructions,
  decodeSwap,
  decodeAllocateOrDeallocate,
  decodeCreatePool,
  decodeCreatePair
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
    assert.equal(uint8ToHex(2), '02');
  });

  it('should convert to hex', () => {
    assert.equal(uint8ToHex(42), '2a');
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

describe('packInstructions', () => {
  it('should pack instructions together', () => {
    const swap1 = encodeSwap(
      false,
      BigNumber.from(42), // 0000002a
      BigNumber.from('1000000000000000000'), // 1201
      BigNumber.from('1700000000'), // 0811
      true
    );

    const swap2 = encodeSwap(
      false,
      BigNumber.from(40), // 00000028
      BigNumber.from('1700000000'), // 0811
      BigNumber.from('100000000000000000'), // 1101
      true
    );

    const data = packInstructions([swap1, swap2]);

    assert.equal(
      data.toUpperCase(),
      ('AA'
      + '02'
      + uint8ToHex(swap1.length / 2)
      + '06' + '0000002a' + '08' + '1201' + '0811'
      + uint8ToHex(swap2.length / 2)
      + '06' + '00000028' + '08' + '0811' + '1101').toUpperCase()
    );
  });
})


describe('decodeSwap', () => {
  it('should decode swap', () => {

    const [poolId, amountIn, amountOut, sellAsset] = [
      BigNumber.from(42), // 0000002a
      BigNumber.from('1000000000000000000'), // 1201
      BigNumber.from('1700000000'), // 0811
      true
    ];

    const data = encodeSwap(
      false,
      BigNumber.from(42), // 0000002a
      BigNumber.from('1000000000000000000'), // 1201
      BigNumber.from('1700000000'), // 0811
      true
    );

    const decoded = decodeSwap(data);

    assert.equal(decoded.poolId.toHexString(), poolId.toHexString());
    assert.equal(decoded.amountIn.toHexString(), amountIn.toHexString());
    assert.equal(decoded.amountOut.toHexString(), amountOut.toHexString());
    assert.equal(decoded.sellAsset, sellAsset);
  })
})

describe('decodeAllocateOrDeallocate', () => {
  it('should decode allocate', () => {
    const [poolId, amount] = [
      BigNumber.from(42), // 0000002a
      BigNumber.from('1000000000000000000'), // 1201
    ];

    const data = encodeAllocateOrDeallocate(
      true,
      false,
      BigNumber.from(42), // 0000002a
      BigNumber.from('1000000000000000000'), // 1201
    );

    const decoded = decodeAllocateOrDeallocate(data);

    assert.equal(decoded.poolId.toHexString(), poolId.toHexString());
    assert.equal(decoded.amount.toHexString(), amount.toHexString());
  })

  it('should decode deallocate', () => {
    const [poolId, amount] = [
      BigNumber.from(42), // 0000002a
      BigNumber.from('1000000000000000000'), // 1201
    ];

    const data = encodeAllocateOrDeallocate(
      false,
      false,
      BigNumber.from(42), // 0000002a
      BigNumber.from('1000000000000000000'), // 1201
    );

    const decoded = decodeAllocateOrDeallocate(data);

    assert.equal(decoded.poolId.toHexString(), poolId.toHexString());
    assert.equal(decoded.amount.toHexString(), amount.toHexString());
  })
})

describe('decodeCreatePool', () => {
  it('should decode create pool with decodeCreatePool', () => {
    const [pairId, controller, priorityFee, fee, vol, dur, jit, max, price] = [
      BigNumber.from(42), // 0000002a
      ethers.constants.AddressZero,
      // cannot be zero values, must be > 100
      BigNumber.from(10), // priority fee
      BigNumber.from(100), // fee
      BigNumber.from(100),// vol
      BigNumber.from(100),// dur
      BigNumber.from(100),// jit
      BigNumber.from(100),// max
      BigNumber.from(100),// price
    ];

    const data = encodeCreatePool(
      pairId,
      controller,
      priorityFee,
      fee,
      vol,
      dur,
      jit,
      max,
      price,
    );

    const decoded = decodeCreatePool(data);

    assert.equal(decoded.pairId.toHexString(), pairId.toHexString());
    assert.equal(decoded.controller, controller);
    assert.equal(decoded.priorityFee.toHexString(), priorityFee.toHexString());
    assert.equal(decoded.fee.toHexString(), fee.toHexString());
    assert.equal(decoded.vol.toHexString(), vol.toHexString());
    assert.equal(decoded.dur.toHexString(), dur.toHexString());
    assert.equal(decoded.jit.toHexString(), jit.toHexString());
    assert.equal(decoded.maxPrice.toHexString(), max.toHexString());
    assert.equal(decoded.price.toHexString(), price.toHexString());
  })
})


describe('decodeCreatePair', () => {
  it('should decode create pair', () => {
    const [token0, token1] = [
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
    ];

    const data = encodeCreatePair(
      token0,
      token1
    );

    const decoded = decodeCreatePair(data);

    assert.equal(decoded.token0, token0);
    assert.equal(decoded.token1, token1);
  })
})