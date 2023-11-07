export function shortenAddress(
  address: string,
  prefixSuffixLength: number = 5
) {
  return `${address.slice(0, prefixSuffixLength + 2)}...${address.slice(
    address.length - prefixSuffixLength
  )}`
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
