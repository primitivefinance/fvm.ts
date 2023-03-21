import { BigNumber } from "ethers";

const ALLOCATE = "01";
const DEALLOCATE = "03";
const CLAIM = "04";
const SWAP_QUOTE = "05";
const SWAP_ASSET = "06";
const CREATE_POOL = "0B";
const CREATE_PAIR = "0C";
const INSTRUCTION_JUMP = "AA";

export function bigNumbertoHex(input: BigNumber): string {
  return input._hex.substring(2, input._hex.length);
}

export function int8ToHex(input: number) {
  if (input > 0xff) {
    throw new Error('Pointer too large');
  }

  return input.toString(16).padStart(2, '0');
}

export function packAmount(amount: BigNumber) {
  let power = 0;

  while (amount.mod(10).eq(0)) {
    amount = amount.div(10);
    ++power;
  }

  return `${int8ToHex(power)}${bigNumbertoHex(amount)}`;
}

export function encodeCreatePair(
  token0: string,
  token1: string,
): string {
  if (token0.length !== 42 || token1.length !== 42) {
    throw new Error('Invalid token address');
  }

  let token0Packed = token0.substring(2, token0.length);
  let token1Packed = token1.substring(2, token1.length);

  return `0x${CREATE_PAIR}${token0Packed}${token1Packed}`;
}

export function encodeCreatePool(
  pairId: BigNumber,
  controller: string,
  priorityFee: BigNumber,
  fee: BigNumber,
  vol: BigNumber,
  dur: BigNumber,
  jit: BigNumber,
  maxPrice: BigNumber,
  price: BigNumber
): string {
  if (controller.length !== 42) {
    throw new Error('Invalid controller address');
  }

  const packedMaxPrice = packAmount(maxPrice);

  let data = `0x${CREATE_POOL}`;
  data += bigNumbertoHex(pairId).padStart(6, '0');
  data += controller.substring(2, controller.length);
  data += bigNumbertoHex(priorityFee).padStart(4, '0');
  data += bigNumbertoHex(fee).padStart(4, '0');
  data += bigNumbertoHex(vol).padStart(4, '0');
  data += bigNumbertoHex(dur).padStart(4, '0');
  data += bigNumbertoHex(jit).padStart(4, '0');
  data += int8ToHex(35 + packedMaxPrice.length / 2);
  data += packedMaxPrice;
  data += packAmount(price);

  return data;
}

export function encodeAllocateOrDeallocate(
  shouldAllocate: boolean,
  useMax: boolean,
  poolId: BigNumber,
  amount: BigNumber,
): string {
  let data = `0x${useMax ? '1' : '0'}${shouldAllocate ? '1' : '3'}`;
  data += bigNumbertoHex(poolId).padStart(8, '0');
  data += packAmount(amount);

  return data;
}

export function encodeClaim(
  poolId: BigNumber,
  fee0: BigNumber,
  fee1: BigNumber,
): string {
  const fee0Packed = packAmount(fee0);
  const fee1Packed = packAmount(fee1);
  const pointer = 1 + 8 + fee0Packed.length;

  let data = `0x${CLAIM}`;
  data += bigNumbertoHex(poolId).padStart(8, '0');
  data += int8ToHex(pointer);
  data += fee0Packed;
  data += fee1Packed;

  return data;
}

export function encodeSwap(
  useMax: boolean,
  poolId: BigNumber,
  amount0: BigNumber,
  amount1: BigNumber,
  sellAsset: boolean,
): string {
  const amount0Packed = packAmount(amount0);

  let data = `0x${useMax ? '1' : '0'}${sellAsset ? '6' : '5'}`;
  data += bigNumbertoHex(poolId).padStart(8, '0');
  data += int8ToHex(1 + 8 + amount0Packed.length);
  data += amount0Packed;
  data += packAmount(amount1);

  return data;
}
