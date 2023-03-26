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
 * Converts a BigNumber into a hexadecimal string.
 * @param input BigNumber to convert
 * @returns Hexadecimal representation of the input
 */
export function bigNumbertoHex(input: BigNumber): string {
  return input._hex.substring(2, input._hex.length);
}

export function hexToBigNumber(input: string): BigNumber {
  return BigNumber.from(`0x${input}`);
}

/**
 * Converts a uint8 into a hexadecimal string.
 * @param input uint8 to convert
 * @returns Hexadecimal representation of the input
 */
export function uint8ToHex(input: number) {
  if (input > 0xff) {
    throw new Error('Pointer too large');
  }

  return input.toString(16).padStart(2, '0');
}

/**
 * Packs a BigNumber amount using our custom encoding (see README.md).
 * @param amount BigNumber to pack
 * @returns Packed amount as a hexadecimal string
 */
export function packAmount(amount: BigNumber) {
  let power = 0;

  while (amount.mod(10).eq(0)) {
    amount = amount.div(10);
    ++power;
  }

  return `${uint8ToHex(power)}${bigNumbertoHex(amount)}`;
}

/**
 * Unpacks a BigNumber amount using our custom encoding (see README.md).
 * @param amount BigNumber to unpack
 * @returns Unpacked amount as a BigNumber
 */
export function unpackAmount(amount: string): BigNumber {
  const power = parseInt(amount.substring(0, 2), 16);
  const value = parseInt(amount.substring(2, amount.length), 16);
  return BigNumber.from(value).mul(BigNumber.from(10).pow(power));
}

/**
 * Encodes the data for a `CREATE_PAIR` operation.
 * @param token0 First token address of the pair
 * @param token1 Second token address of the pair
 * @returns Hexadecimal representation of the encoded data
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
 * Encodes the data for a `CREATE_POOL` operation.
 * @param pairId Id of the pair to use to create the pool
 * @param controller Address of the controller of the pool
 * @param priorityFee Priority fee of the pool (10000 being 100%)
 * @param fee Fee of the pool (10000 being 100%)
 * @param vol Volatility of the pool
 * @param dur Duration of the pool (in days)
 * @param jit Just In Time liquidity policy (in blocks)
 * @param maxPrice Maximum price of the pool (expressed using the quote token)
 * @param price Actual market price of the pair (expressed using the quote token)
 * @returns Encoded operation as a hexadecimal string
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
  data += uint8ToHex(35 + packedMaxPrice.length / 2);
  data += packedMaxPrice;
  data += packAmount(price);

  return data;
}

/**
 * Encodes the data for an `ALLOCATE` or `DEALLOCATE` operation.
 * @param shouldAllocate True to `ALLOCATE`, false to `DEALLOCATE`
 * @param useMax True to use the complete balance of the sender
 * @param poolId Id of the pool to allocate/deallocate from
 * @param amount Amount of liquidity to allocate/deallocate
 * @returns Encoded operation as a hexadecimal string
 */
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

/**
 * Encodes the data for a `CLAIM` operation.
 * @param poolId Id of the pool to claim from
 * @param fee0 Amount of fee0 to claim
 * @param fee1 Amount of fee1 to claim
 * @returns Encoded operation as a hexadecimal string
 */
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
  data += uint8ToHex(pointer);
  data += fee0Packed;
  data += fee1Packed;

  return data;
}

/**
 * Encodes a `SWAP` operation.
 * @param useMax True to use all the balance of the sender
 * @param poolId Id of the pool to swap from
 * @param amount0 Amount of asset tokens to swap
 * @param amount1 Amount of quote tokens to swap
 * @param sellAsset True to swap asset tokens for quote tokens, false otherwise
 * @returns Encoded operation as a hexadecimal string
 */
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
  data += uint8ToHex(6 + amount0Packed.length / 2);
  data += amount0Packed;
  data += packAmount(amount1);

  return data;
}

// Make a function decodeSwap that inverses encodeSwap
export function decodeSwap(
  data: string,
): {
  useMax: boolean;
  poolId: BigNumber;
  amountIn: BigNumber;
  amountOut: BigNumber;
  sellAsset: boolean;
} {
  const useMax = data[0] === '1';
  const sellAsset = data[1] === '6';
  const poolId = hexToBigNumber(data.substring(2, 10));
  const pointer = Number(data.substring(10, 12)) * 2 // 2 hex chars per byte
  const amountIn = unpackAmount(data.substring(12, pointer));
  const amountOut = unpackAmount(data.substring(pointer, 26));

  return {
    useMax,
    poolId,
    amountIn,
    amountOut,
    sellAsset,
  };
}

// Make a function decodeAllocateOrDeallocate that inverses encodeAllocateOrDeallocate
export function decodeAllocateOrDeallocate(
  data: string,
): {
  shouldAllocate: boolean;
  useMax: boolean;
  poolId: BigNumber;
  amount: BigNumber;
} {
  const shouldAllocate = data[1] === '1';
  const useMax = data[0] === '1';
  const poolId = hexToBigNumber(data.substring(2, 10));
  const amount = unpackAmount(data.substring(10, 26));
  
  return {
    shouldAllocate,
    useMax,
    poolId,
    amount,
  };
}

// Make a function decodeCreatePool that inverses encodeCreatePool
export function decodeCreatePool(
  data: string,
): {
  pairId: BigNumber;
  controller: string;
  priorityFee: BigNumber;
  fee: BigNumber;
  vol: BigNumber;
  dur: BigNumber;
  jit: BigNumber;
  maxPrice: BigNumber;
  price: BigNumber;
} {
  const pairId = hexToBigNumber(data.substring(2, 8));
  const controller = `0x${data.substring(8, 48)}`;
  const priorityFee = hexToBigNumber(data.substring(48, 52));
  const fee = hexToBigNumber(data.substring(52, 56));
  const vol = hexToBigNumber(data.substring(56, 60));
  const dur = hexToBigNumber(data.substring(60, 64));
  const jit = hexToBigNumber(data.substring(64, 68));
  const pointer = hexToBigNumber(data.substring(68, 70)).mul(2).toNumber() // 2 hex chars per byte
  const maxPrice = unpackAmount(data.substring(70, pointer));
  const price = unpackAmount(data.substring(pointer));

  return {
    pairId,
    controller,
    priorityFee,
    fee,
    vol,
    dur,
    jit,
    maxPrice,
    price,
  };
}

// Decodes a createPair instruction of two addresses
export function decodeCreatePair(data: string): { token0: string; token1: string } {
  const token0 = `0x${data.substring(2, 42)}`;
  const token1 = `0x${data.substring(42, 82)}`;

  return {
    token0,
    token1,
  };
}



/**
 * Packs multiple instructions together.
 * See https://github.com/primitivefinance/portfolio/blob/main/contracts/libraries/FVMLib.sol#L54
 * for more details regarding the packing.
 * @param instructions An array of encoded operations
 * @returns Packed encoded operations as a hexadecimal string
 */
export function packInstructions(
  instructions: string[],
): string {
  let data = INSTRUCTION_JUMP;
  data += uint8ToHex(instructions.length);

  for (let i = 0; i < instructions.length; ++i) {
    data += uint8ToHex(instructions[i].length / 2);
    data += instructions[i];
  }

  return data;
}
