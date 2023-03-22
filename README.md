#  FVM.ts

TypeScript library providing a set of encoding functions to interact with the FVM.

## Amounts Encoding

To reduce the size of the calldata, amounts are encoded using a special format, inspired by the Run-length encoding. The amount of trailing zeros is stored as a single byte before the base amount. This packing is specially efficient for round values (e.g. `1 ETH`):

```python
# Packed amount
0x | Amount of trailing zeros | Base amount |
```


Here is an example using `1 ETH`:

```python
# 1 ETH is 1 followed by 18 zeros:
1000000000000000000

# All the trailing zeros are removed and their quantity is stored before the base amount:
| 18 | 01 |

# Amount is then converted to hexadecimal:
0x1201

# Same non-packed amount:
0xde0b6b3a7640000
```

*Please note that we only use this technique for `uint128` integers, smaller variable types are used directly.*

## Operations Encoding

All the operations are following the same encoding format, where the parameters are packed together.
Most of them have static sizes (determined by their type of variable), but large amounts have dynamic sizes (>= 2 bytes). So when two amounts need to be passed, we keep track of where an amount ends and where another starts. To do this, we add a single byte before the first amount, indicating the index of the start of the second amount.

### Create Pair

| Designation | Size |
|---|---|
| `CREATE_PAIR` opcode | 1 byte |
| Asset token address | 20 bytes |
| Quote token address| 20 bytes |

### Create Pool

| Designation | Size |
|---|---|
| `CREATE_POOL` opcode | 1 byte |
| Asset / Quote pair id | 3 bytes |
| Address of the controller | 20 bytes |
| Priority fee | 2 bytes |
| Fee | 2 bytes |
| Volatility | 2 bytes |
| Duration | 2 bytes |
| JIT policity | 2 bytes |
| Price pointer | 1 byte |
| Maximum price | >= 2 bytes |
| Price | >= 2 bytes |

### Allocate / Deallocate

| Designation | Size |
|---|---|
| `ALLOCATE` / `DEALLOCATE` opcode | 1 byte |
| Id of the pool | 8 bytes |
| Liquidity amount | >= 2 bytes |

### Claim

| Designation | Size |
|---|---|
| `CLAIM` opcode | 1 byte |
| Id of the pool | 8 bytes |
| Quote fee pointer | 1 byte |
| Asset fee | >= 2 bytes |
| Quote fee | >= 2 bytes |

### Swap

| Designation | Size |
|---|---|
| Use maximum balance | 4 bits |
| `SWAP_ASSET` / `SWAP_QUOTE` opcode | 4 bits |
| Id of the pool | 8 bytes |
| Quote amount pointer | 1 byte |
| Asset amount | >= 2 bytes |
| Quote amount | >= 2 bytes |
