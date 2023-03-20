import { BigNumber } from "ethers";

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

  return `${forceLeadingZero(toHex(power))}${forceLeadingZero(amount._hex)}`;
}

function encodeClaim(
  poolId: string,
  fee0: BigNumber,
  fee1: BigNumber,
): string {
  const fee0Packed = packAmount(fee0);
  const fee1Packed = packAmount(fee1);

  const pointer = 1 + 8 + fee0Packed.length;

  return `0x04${poolId}${pointer}${fee0Packed}${fee1Packed}`;
}
