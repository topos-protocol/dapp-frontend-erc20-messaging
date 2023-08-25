export function shortenAddress(
  address: string,
  prefixSuffixLength: number = 5
) {
  return `${address.slice(0, prefixSuffixLength)}...${address.slice(
    address.length - prefixSuffixLength
  )}`
}

export function sanitizeURLProtocol(protocol: 'ws' | 'http', endpoint: string) {
  return location.protocol.startsWith('https')
    ? `${protocol}s://${endpoint}`
    : `${protocol}://${endpoint}`
}
