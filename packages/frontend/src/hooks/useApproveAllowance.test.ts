import { act, renderHook } from '@testing-library/react'
import * as BurnableMintableCappedERC20JSON from '@topos-protocol/topos-smart-contracts/artifacts/contracts/topos-core/BurnableMintableCappedERC20.sol/BurnableMintableCappedERC20.json'
import { ethers } from 'ethers'
import { vi } from 'vitest'

import { Token } from '../types'
import useApproveAllowance from './useApproveAllowance'

const tokenMock: Token = {
  addr: 'address',
  symbol: 'TST',
}

const txMock = {
  wait: vi.fn().mockResolvedValue({}),
}

const amountMock = ethers.BigNumber.from(1)
const approveMock = vi.fn().mockResolvedValue(txMock)

const contractSpy = vi
  .spyOn(ethers, 'Contract')
  .mockReturnValue({ approve: approveMock } as any)

vi.mock('./useEthers', () => ({
  default: vi.fn().mockReturnValue({ provider: { getSigner: vi.fn() } }),
}))

describe('useApproveAllowance', () => {
  it("should call instantiated contract's approve public method", () => {
    const { result } = renderHook(() => useApproveAllowance())
    expect(result.current.loading).toBe(false)

    act(() => {
      result.current.approveAllowance(tokenMock, amountMock).then(() => {
        expect(result.current.loading).toBe(true)
        expect(contractSpy).toHaveBeenCalledWith(
          tokenMock.addr,
          BurnableMintableCappedERC20JSON.abi,
          undefined
        )

        expect(approveMock).toHaveBeenCalledWith(
          import.meta.env.VITE_ERC20_MESSAGING_CONTRACT_ADDRESS,
          amountMock
        )
      })
    })
  })
})
