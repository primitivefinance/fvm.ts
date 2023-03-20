import { BigNumber } from "ethers";

const ALLOCATE = "0x01";
const DEALLOCATE = "0x03";
const CLAIM = "0x04";
const SWAP_QUOTE = "0x05";
const SWAP_ASSET = "0x06";
const CREATE_POOL = "0x0B";
const CREATE_PAIR = "0x0C";
const INSTRUCTION_JUMP = "0xAA";

function toHex(input: number) {
  return forceLeadingZero(input.toString(16));
}

function forceLeadingZero(input: string) {
  return input.length % 2 ? input : `0${input}`;
}

function packAmount(amount: BigNumber) {
  let power = 0;

  while (amount.mod(10).eq(0)) {
    amount = amount.div(10);
    ++power;
  }

  return `${toHex(power)}${forceLeadingZero(amount._hex)}`;
}

function encodeCreatePair(
  token0: string,
  token1: string,
): string {
  let token0Packed = token0.substring(2, token0.length);
  let token1Packed = token1.substring(2, token1.length);

  return `0x${CREATE_PAIR}${token0Packed}${token1Packed}`;
}

function encodeClaim(
  poolId: string,
  fee0: BigNumber,
  fee1: BigNumber,
): string {
  const fee0Packed = packAmount(fee0);
  const fee1Packed = packAmount(fee1);

  const pointer = 1 + 8 + fee0Packed.length;

  return `0x04${poolId}${toHex(pointer)}${fee0Packed}${fee1Packed}`;
}
