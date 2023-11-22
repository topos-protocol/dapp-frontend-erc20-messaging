import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import * as contractExports from '../contracts'
import useRegisterToken from './useRegisterToken'
import { ethers } from 'ethers'

const deployTokenMock = vi
  .fn()
  .mockResolvedValue({ wait: vi.fn().mockResolvedValue({}) })

const contractConnectMock = vi.fn().mockReturnValue({
  deployToken: deployTokenMock,
})

vi.spyOn(contractExports, 'erc20MessagingContract', 'get').mockReturnValue({
  connect: contractConnectMock,
} as any)

vi.mock('./useEthers', () => ({
  default: vi.fn().mockReturnValue({ provider: { getSigner: vi.fn() } }),
}))

describe('useRegisterToken', () => {
  it('should return registerToken callback', () => {
    const { result } = renderHook(() => useRegisterToken())
    expect(result.current.loading).toBe(false)
    expect(result.current.registerToken).toBeTruthy()
  })
})

describe('registerToken', () => {
  it('should register token', () => {
    const { result } = renderHook(() => useRegisterToken())

    const cap = 1_000_000
    const dailyMintLimit = 10_000
    const name = 'token'
    const symbol = 'TST'
    const supply = 1_000

    const params = ethers.utils.defaultAbiCoder.encode(
      ['string', 'string', 'uint256', 'uint256', 'uint256'],
      [
        name,
        symbol,
        ethers.utils.parseUnits(cap.toString()),
        ethers.utils.parseUnits(dailyMintLimit.toString()),
        ethers.utils.parseUnits(supply.toString()),
      ]
    )

    result.current
      .registerToken({
        cap,
        dailyMintLimit,
        name,
        symbol,
        supply,
      })
      .then(() => {
        expect(deployTokenMock).toHaveBeenCalledWith(params)
      })
      .finally(() => {
        expect(result.current.loading).toBe(false)
      })
  })
})
