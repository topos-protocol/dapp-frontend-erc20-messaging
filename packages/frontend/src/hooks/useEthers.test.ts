import { renderHook } from '@testing-library/react'
import { BigNumber, ethers } from 'ethers'
import { useMetaMask } from 'metamask-react'
import { vi } from 'vitest'

import useEthers from './useEthers'
import React from 'react'

const existingChainIds = ['1', '2'].map((x) => BigNumber.from(x))
const subnetMock = { chainId: existingChainIds[0], endpointWs: 'ws://endpoint' }
const subnetOtherMock = {
  chainId: existingChainIds[1],
  endpointWs: 'ws://other-endpoint',
}
const newSubnetMock = {
  chainId: BigNumber.from('3'),
  currencySymbol: '',
  endpointWs: 'ws://other-other-endpoint',
  name: '',
}

vi.mock('metamask-react', () => ({
  useMetaMask: vi.fn().mockReturnValue({
    addChain: vi.fn().mockResolvedValue(null),
    connect: vi.fn(),
    ethereum: {},
    switchChain: vi.fn().mockImplementation(
      (chainId: string) =>
        new Promise<void>((resolve, reject) => {
          if (
            existingChainIds
              .map((x) => ethers.utils.hexStripZeros(x.toHexString()))
              .indexOf(chainId) > -1
          ) {
            resolve()
          }

          reject({ code: 4902 })
        })
    ),
  }),
}))

const webSocketProviderSpy = vi
  .spyOn(ethers.providers, 'WebSocketProvider')
  .mockReturnValue({} as any)

const web3ProviderSpy = vi
  .spyOn(ethers.providers, 'Web3Provider')
  .mockReturnValue({} as any)

describe('useEthers', () => {
  it('should use webSocket provider with Topos Subnet if not requested to use metaMask and no subnet', () => {
    renderHook(() => useEthers({ viaMetaMask: false }))
    expect(webSocketProviderSpy).toHaveBeenCalledWith(
      import.meta.env.VITE_TOPOS_SUBNET_ENDPOINT_WS
    )
  })

  it('should use webSocket provider with passed subnet if not requested to use metaMask and no subnet', () => {
    renderHook(() =>
      useEthers({ subnet: subnetMock as any, viaMetaMask: false })
    )
    expect(webSocketProviderSpy).toHaveBeenCalledWith(subnetMock.endpointWs)
  })

  it('should use web3 provider if not requested to use metaMask', () => {
    renderHook(() => useEthers({ viaMetaMask: true }))
    expect(web3ProviderSpy).toHaveBeenCalled()
  })

  it('should try to switch network if requested to use metaMask with subnet and subnet changes', () => {
    const { switchChain } = useMetaMask()

    renderHook(() =>
      useEthers({ subnet: subnetMock as any, viaMetaMask: true })
    )

    renderHook(() =>
      useEthers({ subnet: subnetOtherMock as any, viaMetaMask: true })
    )

    expect(switchChain).toHaveBeenCalledWith(
      ethers.utils.hexStripZeros(subnetOtherMock.chainId.toHexString())
    )
  })

  it('should add network if requested to use metaMask with subnet, subnet changes, and switch failed because of unknown network', () => {
    const { addChain, switchChain } = useMetaMask()

    renderHook(() =>
      useEthers({ subnet: subnetMock as any, viaMetaMask: true })
    )

    renderHook(() =>
      useEthers({ subnet: newSubnetMock as any, viaMetaMask: true })
    )

    expect(switchChain).toHaveBeenCalledWith(
      ethers.utils.hexStripZeros(newSubnetMock.chainId.toHexString())
    )

    // TODO: make this test work (the addChain call should be picked)
    // expect(addChain).toHaveBeenCalled()
  })
})
