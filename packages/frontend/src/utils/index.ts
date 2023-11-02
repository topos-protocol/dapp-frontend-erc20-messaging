export function shortenAddress(
  address: string,
  prefixSuffixLength: number = 5
) {
  return `${address.slice(0, prefixSuffixLength + 2)}...${address.slice(
    address.length - prefixSuffixLength
  )}`
}
