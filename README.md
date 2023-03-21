# FVM.ts

TypeScript library providing a set of encoding functions to interact with the FVM.

## Amounts Encoding

To reduce the size of the calldata, amounts are encoded using a special format, inspired by the `Run-length encoding`:

```bash
0x | amount of trailing zeros | base amount |
```

Here is an example with `1 ether (1000000000000000000)`:

```bash
# 1000000000000000000 has 18 trailing zeros, converted to hexadecimal this is 0x12:

0x | 12 | 01 |
```

## Operations Encoding

### Create Pair

```bash
0x | 0C | token0 | token1 |
```
