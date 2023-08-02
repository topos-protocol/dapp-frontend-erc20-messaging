import { renderHook, waitFor } from '@testing-library/react'
import { BigNumber, ethers } from 'ethers'
import { vi } from 'vitest'

import { Subnet, Token } from '../types'
import useTokenBalance from './useTokenBalance'

const subnetMock: Subnet = {
  chainId: BigNumber.from(1),
  currencySymbol: 'TST',
  endpoint: '',
  logoURL: '',
  name: 'subnetMock',
}

const tokenMock: Token = {
  addr: '',
  symbol: 'TST2',
}

const balanceOfMock = vi.fn().mockResolvedValue(1)

vi.spyOn(ethers, 'Contract').mockReturnValue({
  balanceOf: balanceOfMock,
} as any)

vi.mock('./useEthers', () => ({
  default: vi.fn().mockReturnValue({
    provider: {
      getSigner: vi.fn().mockReturnValue({ getAddress: vi.fn() }),
    },
  }),
}))

describe('useTokenBalance', () => {
  it('should return token balance', async () => {
    const { result } = renderHook(() => useTokenBalance(subnetMock, tokenMock))
    expect(result.current.loading).toBe(false)

    await waitFor(() => {
      expect(balanceOfMock).toHaveBeenCalled()
      expect(result.current.balance).toBe(ethers.utils.formatUnits(1))
    })
  })

  it('should return undefined balance if no subnet nor token', async () => {
    const { result } = renderHook(() => useTokenBalance())
    expect(result.current.loading).toBe(false)

    await waitFor(() => {
      expect(balanceOfMock).toHaveBeenCalled()
      expect(result.current.balance).toBeUndefined()
    })
  })
})
