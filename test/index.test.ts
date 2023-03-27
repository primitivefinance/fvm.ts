import { BigNumber } from "ethers";
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
} from "../src/index";

describe("bigNumbertoHex", () => {
  test("should convert a BigNumber into hex", () => {
    expect(bigNumbertoHex(BigNumber.from(2))).toBe("02");
  });

  test("should convert another BigNumber into hex", () => {
    expect(bigNumbertoHex(BigNumber.from(42))).toBe("2a");
  });
});

describe("int8ToHex", () => {
  test("should convert to hex", () => {
    expect(uint8ToHex(2)).toBe("02");
  });

  test("should convert to hex", () => {
    expect(uint8ToHex(42)).toBe("2a");
  });
});

describe("packAmount", () => {
  test("should pack 1 into 0001", () => {
    expect(packAmount(BigNumber.from(1))).toBe("0001");
  });

  test("should pack 200 into 0202", () => {
    expect(packAmount(BigNumber.from(200))).toBe("0202");
  });

  test("should pack 1 ETH into 1201", () => {
    expect(packAmount(BigNumber.from("1000000000000000000"))).toBe("1201");
  });
});

describe("encodeCreatePair", () => {
  test("should encode create pair", () => {
    const data = encodeCreatePair(
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    );
    expect(data).toBe(
      "0CA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB486B175474E89094C44Da98b954EedeAC495271d0F"
    );
  });
});

describe("encodeCreatePool", () => {
  test("should encode create pool", () => {
    const data = encodeCreatePool(
      BigNumber.from(42), // 00002a
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      BigNumber.from(0), // 0000
      BigNumber.from(10), // 000a
      BigNumber.from(100), // 0064
      BigNumber.from(30), // 001e
      BigNumber.from(0), // 0000
      BigNumber.from("1000000000000000000"), // 1201
      BigNumber.from("1500000000000000000") // 1115
    );
    expect(data.toUpperCase()).toBe(
      (
        "0B" +
        "00002a" +
        "A0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" +
        "0000" +
        "000a" +
        "0064" +
        "001e" +
        "0000" +
        "25" +
        "1201" +
        "110f"
      ).toUpperCase()
    );
  });
});

describe("encodeAllocateOrDeallocate", () => {
  test("should encode allocate", () => {
    const data = encodeAllocateOrDeallocate(
      true,
      false,
      BigNumber.from(42), // 0000002a
      BigNumber.from("1000000000000000000") // 1201
    );

    expect(data.toUpperCase()).toBe("010000002a1201".toUpperCase());
  });

  test("should encode deallocate", () => {
    const data = encodeAllocateOrDeallocate(
      false,
      false,
      BigNumber.from(42), // 0000002a
      BigNumber.from("1000000000000000000") // 1201
    );
    expect(data.toUpperCase()).toBe("030000002a1201".toUpperCase());
  });
});

describe("encodeClaim", () => {
  test("should encode claim", () => {
    const data = encodeClaim(
      BigNumber.from(42), // 0000002a
      BigNumber.from("500000000"), // 0805
      BigNumber.from("750") // 014b
    );
    expect(data.toUpperCase()).toBe(
      ("04" + "0000002a" + "08" + "0805" + "014b").toUpperCase()
    );
  });
});

describe("encodeSwap", () => {
  test("should encode swap", () => {
    const data = encodeSwap(
      false,
      BigNumber.from(42), // 0000002a
      BigNumber.from("1000000000000000000"), // 1201
      BigNumber.from("1700000000"), // 0805
      true
    );
    expect(data.toUpperCase()).toBe(
      ("06" + "0000002a" + "08" + "1201" + "0811").toUpperCase()
    );
  });
});

describe("packInstructions", () => {
  test("should pack instructions together", () => {
    const swap1 = encodeSwap(
      false,
      BigNumber.from(42), // 0000002a
      BigNumber.from("1000000000000000000"), // 1201
      BigNumber.from("1700000000"), // 0811
      true
    );
    const swap2 = encodeSwap(
      false,
      BigNumber.from(40), // 00000028
      BigNumber.from("1700000000"), // 0811
      BigNumber.from("100000000000000000"), // 1101
      true
    );

    const data = packInstructions([swap1, swap2]);

    expect(data.toUpperCase()).toBe(
      (
        "AA" +
        "02" +
        uint8ToHex(swap1.length / 2) +
        "06" +
        "0000002a" +
        "08" +
        "1201" +
        "0811" +
        uint8ToHex(swap2.length / 2) +
        "06" +
        "00000028" +
        "08" +
        "0811" +
        "1101"
      ).toUpperCase()
    );
  });
});
