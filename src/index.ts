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

  return `${toHex(power)}${forceLeadingZero(amount._hex)}`;
}
