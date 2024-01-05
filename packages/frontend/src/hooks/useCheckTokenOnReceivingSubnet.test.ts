import { act, renderHook } from '@testing-library/react'
import * as typechainExports from '@topos-protocol/topos-smart-contracts/typechain-types'
import * as ethersExports from 'ethers'
import { vi } from 'vitest'

import * as subnetsContextExports from '../contexts/subnets'
import { FetchData, SubnetWithId, Token } from '../types'
import useCheckTokenOnReceivingSubnet from './useCheckTokenOnReceivingSubnet'
import { createContext } from 'react'

const tokenMock: Token = {
  addr: 'address',
  symbol: 'TST',
}

const subnetsMock: SubnetWithId[] = [
  {
    chainId: BigInt(1),
    currencySymbol: '',
    id: 'id',
    endpointHttp: 'http://endpoint',
    endpointWs: 'ws://endpoint',
    logoURL: '',
    name: '',
  },
]

vi.spyOn(subnetsContextExports, 'SubnetsContext', 'get').mockReturnValue(
  createContext<FetchData<SubnetWithId[]>>({ data: subnetsMock })
)

vi.mock('ethers', async () => {
  const actual = (await vi.importActual('ethers')) as any
  return {
    ...actual,
    getDefaultProvider: vi
      .fn()
      .mockReturnValue({ getCode: vi.fn().mockResolvedValue('code') }),
  }
})

const getTokenBySymbolMock = vi.fn().mockResolvedValue(tokenMock)

const contractAddressMock = 'address'

const contractConnectMock = vi.fn().mockReturnValue({
  address: contractAddressMock,
  getTokenBySymbol: getTokenBySymbolMock,
})

const contractSpy = vi
  .spyOn(typechainExports, 'ERC20Messaging__factory', 'get')
  .mockReturnValue({ connect: contractConnectMock } as any)

describe('useCheckTokenOnReceivingSubnet', () => {
  it("should call connected contract's getTokenByAddress public method", () => {
    const getDefaultProviderSpy = vi.spyOn(ethersExports, 'getDefaultProvider')
    const { result } = renderHook(() => useCheckTokenOnReceivingSubnet())
    expect(result.current.loading).toBe(false)

    act(() => {
      result.current
        .checkTokenOnSubnet(tokenMock, subnetsMock[0].id)
        .then(() => {
          expect(result.current.loading).toBe(true)
          expect(getDefaultProviderSpy).toHaveBeenCalledWith(
            subnetsMock[0].endpointWs
          )
          expect(contractSpy).toHaveBeenCalled()
          // expect(getDefaultProviderSpy.mock.lastCall).toHaveBeenCalledWith(
          //   contractAddressMock
          // )
          expect(contractConnectMock).toHaveBeenCalled()
          expect(getTokenBySymbolMock).toHaveBeenCalledWith(tokenMock.symbol)
        })
    })
  })
})
