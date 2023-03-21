import { BigNumber } from "ethers";

const ALLOCATE = "01";
const DEALLOCATE = "03";
const CLAIM = "04";
const SWAP_QUOTE = "05";
const SWAP_ASSET = "06";
const CREATE_POOL = "0B";
const CREATE_PAIR = "0C";
const INSTRUCTION_JUMP = "AA";

export function formatHex(input: BigNumber) {
  return input._hex.substring(2, input._hex.length);
}

export function toHex(input: number) {
  return forceLeadingZero(input.toString(16));
}

export function forceLeadingZero(input: string) {
  return input.length % 2 === 0 ? input : `0${input}`;
}

export function packAmount(amount: BigNumber) {
  let power = 0;

  while (amount.mod(10).eq(0)) {
    amount = amount.div(10);
    ++power;
  }

  return `${toHex(power)}${formatHex(amount)}`;
}

export function encodeCreatePair(
  token0: string,
  token1: string,
): string {
  let token0Packed = token0.substring(2, token0.length);
  let token1Packed = token1.substring(2, token1.length);

  return `0x${CREATE_PAIR}${token0Packed}${token1Packed}`;
}

export function encodeCreatePool(
  pairId: string,
  controller: string,
  priorityFee: BigNumber,
  fee: BigNumber,
  vol: BigNumber,
  dur: BigNumber,
  jit: BigNumber,
  maxPrice: BigNumber,
  price: BigNumber
): string {
  const packedMaxPrice = packAmount(maxPrice);

  let data = `0x${CREATE_POOL}`;
  data += pairId;
  data += controller.substring(2, controller.length);
  data += formatHex(priorityFee);
  data += formatHex(fee);
  data += formatHex(vol);
  data += formatHex(dur);
  data += formatHex(jit);
  data += toHex(36 + packedMaxPrice.length);
  data += packedMaxPrice;
  data += packAmount(price);

  return data;
}

export function encodeAllocateOrDeallocate(
  shouldAllocate: boolean,
  useMax: boolean,
  poolId: string,
  amount: BigNumber,
): string {
  let data = `0x${useMax ? '1' : '0'}${shouldAllocate ? '1' : '3'}`;
  data += poolId;
  data += packAmount(amount);

  return data;
}

export function encodeClaim(
  poolId: string,
  fee0: BigNumber,
  fee1: BigNumber,
): string {
  const fee0Packed = packAmount(fee0);
  const fee1Packed = packAmount(fee1);
  const pointer = 1 + 8 + fee0Packed.length;

  return `0x04${poolId}${toHex(pointer)}${fee0Packed}${fee1Packed}`;
}

export function encodeSwap(
  useMax: boolean,
  poolId: string,
  amount0: BigNumber,
  amount1: BigNumber,
  sellAsset: boolean,
): string {
  const amount0Packed = packAmount(amount0);

  let data = `0x${useMax ? '1' : '0'}${sellAsset ? '6' : '5'}`;
  data += poolId;
  data += toHex(1 + 8 + amount0Packed.length);
  data += amount0Packed;
  data += packAmount(amount1);

  return data;
}
