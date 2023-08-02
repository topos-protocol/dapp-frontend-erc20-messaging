import { render, screen } from '@testing-library/react'
import * as MetaMaskReactExports from 'metamask-react'
import { describe, it, expect, vi } from 'vitest'

import MetaMask from './MetaMask'
import TestId from '../utils/testId'

vi.mock('metamask-react', () => ({
  useMetaMask: vi.fn().mockReturnValue({}),
}))

vi.mock('antd', async () => {
  const actual = (await vi.importActual('antd')) as any
  return {
    ...actual,
    Spin: vi.fn().mockReturnValue('Spin'),
  }
})

describe('MetaMask', () => {
  it('should start by rendering Spin loader', () => {
    render(<MetaMask />)
    expect(screen.queryByText('Spin')).toBeInTheDocument()
  })

  it('should render "initialization" content if MetaMask is initializing', async () => {
    vi.spyOn(MetaMaskReactExports, 'useMetaMask').mockReturnValue({
      status: 'initializing',
    } as any)
    render(<MetaMask />)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    expect(
      screen.queryByText('Synchronisation with MetaMask ongoing...')
    ).toBeInTheDocument()
  })

  it('should render "please install" content if MetaMask is unavailable', async () => {
    vi.spyOn(MetaMaskReactExports, 'useMetaMask').mockReturnValue({
      status: 'unavailable',
    } as any)
    render(<MetaMask />)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    expect(screen.queryByText('Please install MetaMask')).toBeInTheDocument()
  })

  it('should render "not connected" content if MetaMask is not connected', async () => {
    vi.spyOn(MetaMaskReactExports, 'useMetaMask').mockReturnValue({
      status: 'notConnected',
    } as any)
    render(<MetaMask />)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    expect(
      screen.queryByTestId(TestId.METAMASK_CONNECT_BUTTON)
    ).toBeInTheDocument()
    expect(screen.queryByText('Connect to MetaMask')).toBeInTheDocument()
  })

  it('should render "connecting" content if MetaMask is connecting', async () => {
    vi.spyOn(MetaMaskReactExports, 'useMetaMask').mockReturnValue({
      status: 'connecting',
    } as any)
    render(<MetaMask />)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    expect(screen.queryByText('Connecting...')).toBeInTheDocument()
  })

  it('should render "connected" content if MetaMask is connected', async () => {
    vi.spyOn(MetaMaskReactExports, 'useMetaMask').mockReturnValue({
      status: 'connected',
    } as any)
    render(<MetaMask />)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    expect(screen.queryByTestId(TestId.METAMASK_CONNECTED)).toBeInTheDocument()
  })
})
