import { assert, expect } from 'chai';

import {
  BigNumber,
} from 'ethers';
import {
  packAmount,
  toHex,
  formatHex,
  forceLeadingZero,
} from '../src/index';

describe('packAmount', () => {
  it('should pack amount', () => {
    assert.equal(packAmount(BigNumber.from(200)), '0202');
  });
});
