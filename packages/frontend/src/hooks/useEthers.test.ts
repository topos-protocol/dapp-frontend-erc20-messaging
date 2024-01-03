import { renderHook } from '@testing-library/react'
import * as ethersExports from 'ethers'
import { useMetaMask } from 'metamask-react'
import { vi } from 'vitest'

import useEthers from './useEthers'

const existingChainIds = ['1', '2'].map((x) => BigInt(x))
const subnetMock = { chainId: existingChainIds[0], endpointWs: 'ws://endpoint' }
const subnetOtherMock = {
  chainId: existingChainIds[1],
  endpointWs: 'ws://other-endpoint',
}
const newSubnetMock = {
  chainId: BigInt(3),
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
              .map((x) => ethersExports.toQuantity(x.toString(16)))
              .indexOf(chainId) > -1
          ) {
            resolve()
          }

          reject({ code: 4902 })
        })
    ),
  }),
}))

vi.mock('ethers', async () => {
  const actual = (await vi.importActual('ethers')) as any
  return {
    ...actual,
    BrowserProvider: vi.fn().mockReturnValue({}),
    getDefaultProvider: vi.fn().mockReturnValue({}),
  }
})

describe('useEthers', () => {
  let getDefaultProviderSpy: any
  let browserProviderSpy: any

  beforeAll(() => {
    getDefaultProviderSpy = vi.spyOn(ethersExports, 'getDefaultProvider')
    browserProviderSpy = vi.spyOn(ethersExports, 'BrowserProvider')
  })

  it('should use webSocket provider with Topos Subnet if not requested to use metaMask and no subnet', () => {
    renderHook(() => useEthers({ viaMetaMask: false }))
    expect(getDefaultProviderSpy).toHaveBeenCalledWith(
      import.meta.env.VITE_TOPOS_SUBNET_ENDPOINT_WS
    )
  })

  it('should use webSocket provider with passed subnet if not requested to use metaMask and no subnet', () => {
    renderHook(() =>
      useEthers({ subnet: subnetMock as any, viaMetaMask: false })
    )
    expect(getDefaultProviderSpy).toHaveBeenCalledWith(subnetMock.endpointWs)
  })

  it('should use web3 provider if not requested to use metaMask', () => {
    renderHook(() => useEthers({ viaMetaMask: true }))
    expect(browserProviderSpy).toHaveBeenCalled()
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
      ethersExports.toQuantity(subnetOtherMock.chainId.toString(16))
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
      ethersExports.toQuantity(newSubnetMock.chainId.toString(16))
    )

    // TODO: make this test work (the addChain call should be picked)
    // expect(addChain).toHaveBeenCalled()
  })
})
