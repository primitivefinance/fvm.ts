import { BigNumber } from "ethers";

/**
 * The following constants are the opcodes for the different operations. They are
 * represented as hexadecimal strings without the `0x` prefix. Strings with a
 * single character will be packed later with an extra parameter.
 */
const ALLOCATE = "1";
const DEALLOCATE = "3";
const CLAIM = "04";
const SWAP_QUOTE = "5";
const SWAP_ASSET = "6";
const CREATE_POOL = "0B";
const CREATE_PAIR = "0C";
const INSTRUCTION_JUMP = "AA";

/**
 * Converts a BigNumber into a hexadecimal string without the `0x` prefix.
 * @param input BigNumber to convert
 * @returns Hexadecimal representation of the input (without the `0x` prefix)
 */
export function bigNumbertoHex(input: BigNumber): string {
  return input._hex.substring(2, input._hex.length);
}

/**
 * Converts a uint8 into a hexadecimal string without the `0x` prefix.
 * @param input uint8 to convert
 * @returns Hexadecimal representation of the input (without the `0x` prefix)
 */
export function int8ToHex(input: number) {
  if (input > 0xff) {
    throw new Error('Pointer too large');
  }

  return input.toString(16).padStart(2, '0');
}

/**
 * Packs a BigNumber amount using our custom encoding (see README.md).
 * @param amount BigNumber to pack
 * @returns Packed amount as a hexadecimal string (without the `0x` prefix)
 */
export function packAmount(amount: BigNumber) {
  let power = 0;

  while (amount.mod(10).eq(0)) {
    amount = amount.div(10);
    ++power;
  }

  return `${int8ToHex(power)}${bigNumbertoHex(amount)}`;
}

/**
 * Encodes the data for a CREATE_PAIR operation.
 * @param token0 First token address of the pair
 * @param token1 Second token address of the pair
 * @returns Hexadecimal representation of the encoded data (with the `0x` prefix)
 */
export function encodeCreatePair(
  token0: string,
  token1: string,
): string {
  if (token0.length !== 42 || token1.length !== 42) {
    throw new Error('Invalid token address');
  }

  let token0Packed = token0.substring(2, token0.length);
  let token1Packed = token1.substring(2, token1.length);

  return `${CREATE_PAIR}${token0Packed}${token1Packed}`;
}

/**
 * Encodes the data for a CREATE_POOL operation.
 * @param pairId Id of the pair to use to create the pool
 * @param controller Address of the controller of the pool
 * @param priorityFee Priority fee of the pool
 * @param fee Fee of the pool (in 10,000)
 * @param vol Volatility of the pool
 * @param dur Duration of the pool (in days)
 * @param jit Just In Time liquidity (in blocks)
 * @param maxPrice Maximum price of the pool
 * @param price Actual market price of the pair
 * @returns Encoded operation as a hexadecimal string (without the `0x` prefix)
 */
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

  let data = `${CREATE_POOL}`;
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
  let data = `${useMax ? '1' : '0'}${shouldAllocate ? ALLOCATE : DEALLOCATE}`;
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
  const pointer = 6 + fee0Packed.length / 2;

  let data = `${CLAIM}`;
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

  let data = `${useMax ? '1' : '0'}${sellAsset ? SWAP_ASSET : SWAP_QUOTE}`;
  data += bigNumbertoHex(poolId).padStart(8, '0');
  data += int8ToHex(6 + amount0Packed.length / 2);
  data += amount0Packed;
  data += packAmount(amount1);

  return data;
}
