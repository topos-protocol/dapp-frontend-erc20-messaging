import { renderHook, waitFor } from '@testing-library/react'
import * as typechainExports from '@topos-protocol/topos-smart-contracts/typechain-types'
import { formatUnits } from 'ethers'
import { vi } from 'vitest'

import { Subnet, Token } from '../types'
import useTokenBalance from './useTokenBalance'

const subnetMock: Subnet = {
  chainId: BigInt(1),
  currencySymbol: 'TST',
  endpointHttp: '',
  endpointWs: '',
  logoURL: '',
  name: 'subnetMock',
}

const tokenMock: Token = {
  addr: '',
  symbol: 'TST2',
}

const balanceOfMock = vi.fn().mockResolvedValue(BigInt(1))

const contractConnectMock = vi
  .fn()
  .mockReturnValue({ balanceOf: balanceOfMock })

vi.spyOn(
  typechainExports,
  'BurnableMintableCappedERC20__factory',
  'get'
).mockReturnValue({
  connect: contractConnectMock,
} as any)

vi.mock('./useEthers', () => ({
  default: vi.fn().mockReturnValue({
    provider: {
      getSigner: vi.fn().mockResolvedValue({ getAddress: vi.fn() }),
    },
  }),
}))

describe('useTokenBalance', () => {
  it('should return token balance', async () => {
    const { result } = renderHook(() => useTokenBalance(subnetMock, tokenMock))
    expect(result.current.loading).toBe(false)

    await waitFor(() => {
      expect(balanceOfMock).toHaveBeenCalled()
      expect(result.current.balance).toBe(formatUnits(1))
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
