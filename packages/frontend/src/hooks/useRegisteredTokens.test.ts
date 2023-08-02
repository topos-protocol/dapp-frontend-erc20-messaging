import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import * as contractExports from '../contracts'
import { Token } from '../types'
import useRegisteredTokens from './useRegisteredTokens'
import { BigNumber } from 'ethers'

const subnetMock = {
  chainId: BigNumber.from(1),
  currencySymbol: 'TST',
  endpoint: '',
  logoURL: '',
  name: 'subnetMock',
}

const registeredTokens: { [x: string]: Token } = {
  token1: {
    addr: '',
    symbol: 'TST',
  },
  token2: {
    addr: '',
    symbol: 'TST2',
  },
}

const tokenKeysByIndexes = ['token1', 'token2']

const expectedTokens = tokenKeysByIndexes.map((id) => registeredTokens[id])

const getTokenCountMock = vi
  .fn()
  .mockResolvedValue(BigNumber.from(tokenKeysByIndexes.length))

const getTokenKeyAtIndexMock = vi
  .fn()
  .mockImplementation((index: number) =>
    Promise.resolve(tokenKeysByIndexes[index])
  )

const tokensMock = vi
  .fn()
  .mockImplementation((subnetId: string) =>
    Promise.resolve(registeredTokens[subnetId])
  )

const onMock = vi.fn()

const contractConnectMock = vi.fn().mockReturnValue({
  getTokenCount: getTokenCountMock,
  getTokenKeyAtIndex: getTokenKeyAtIndexMock,
  on: onMock,
  removeListener: vi.fn(),
  tokens: tokensMock,
})

vi.spyOn(contractExports, 'erc20MessagingContract', 'get').mockReturnValue({
  connect: contractConnectMock,
} as any)

vi.mock('./useEthers', () => ({
  default: vi.fn().mockReturnValue({ provider: {} }),
}))

describe('useRegisteredTokens', () => {
  it('should return tokens', async () => {
    const { result } = renderHook(() => useRegisteredTokens(subnetMock))

    expect(result.current.loading).toBe(true)
    expect(result.current.tokens).toBeUndefined()

    expect(getTokenCountMock).toHaveBeenCalled()

    await waitFor(() => {
      expect(getTokenKeyAtIndexMock).toBeCalled()
    })

    expect(getTokenKeyAtIndexMock).toHaveBeenCalledWith(0)
    expect(getTokenKeyAtIndexMock).toHaveBeenCalledWith(1)
    expect(tokensMock).toBeCalledWith('token1')
    expect(tokensMock).toBeCalledWith('token2')
    expect(result.current.loading).toBe(false)
    expect(result.current.tokens).toStrictEqual(expectedTokens)
  })

  it('should listen for new tokens', async () => {
    renderHook(() => useRegisteredTokens(subnetMock))
    expect(onMock).toHaveBeenCalledWith('TokenDeployed', expect.anything())
  })
})
