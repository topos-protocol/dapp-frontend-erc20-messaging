import { renderHook, waitFor } from '@testing-library/react'
import EventSourceMock, { sources } from 'eventsourcemock'
import { vi } from 'vitest'

import useExecutorService, { ExecuteDto } from './useExecutorService'
import axios from 'axios'

const validExecuteDtoMock: ExecuteDto = {
  logIndexes: [],
  messagingContractAddress: '',
  receiptTrieMerkleProof: '',
  receiptTrieRoot: '',
  subnetId: '1',
}

const axiosPostMock = vi.fn().mockResolvedValue({})

const axiosCreateSpy = vi
  .spyOn(axios, 'create')
  .mockReturnValue({ post: axiosPostMock } as any)

const axiosGetSpy = vi
  .spyOn(axios, 'get')
  .mockResolvedValue({ data: { access_token: 'token' } } as any)

vi.mock('event-source-polyfill', () => ({
  EventSourcePolyfill: EventSourceMock,
}))

describe('useExecutorService', () => {
  it('should get auth token and create apis on start', async () => {
    const { result } = renderHook(() => useExecutorService())

    expect(result.current.sendToExecutorService).toBe(null)
    expect(result.current.observeExecutorServiceJob).toBe(null)

    await waitFor(() => {
      expect(axiosGetSpy).toHaveBeenCalledWith('api/auth')
      expect(result.current.sendToExecutorService).toBeTruthy()
      expect(axiosCreateSpy).toHaveBeenCalled()
      expect(result.current.observeExecutorServiceJob).toBeTruthy()
    })
  })

  it('should not create apis if auth token was not resolved', async () => {
    axiosGetSpy.mockRejectedValueOnce('')
    const { result } = renderHook(() => useExecutorService())

    expect(result.current.sendToExecutorService).toBe(null)
    expect(result.current.observeExecutorServiceJob).toBe(null)

    await waitFor(() => {
      expect(axiosGetSpy).toHaveBeenCalledWith('api/auth')
    })

    expect(result.current.sendToExecutorService).toBe(null)
    expect(result.current.observeExecutorServiceJob).toBe(null)
  })
})

describe('sendToExecutorService', () => {
  it('should send execute POST request', async () => {
    const { result } = renderHook(() => useExecutorService())

    await waitFor(() => {
      expect(axiosGetSpy).toHaveBeenCalledWith('api/auth')
    })

    if (result.current.sendToExecutorService) {
      result.current.sendToExecutorService(validExecuteDtoMock)
      expect(axiosPostMock).toBeCalledWith('v1/execute', validExecuteDtoMock)
    }
  })
})

describe('observeExecutorServiceJob', () => {
  it('should next() progress when eventsource sends progress event', async () => {
    const { result } = renderHook(() => useExecutorService())

    await waitFor(() => {
      expect(axiosGetSpy).toHaveBeenCalledWith('api/auth')
    })

    if (result.current.observeExecutorServiceJob) {
      const observable = result.current.observeExecutorServiceJob(1)
      observable.subscribe({
        next: (data) => {
          expect(data).toEqual(50)
        },
      })

      sources[
        `${import.meta.env.VITE_EXECUTOR_SERVICE_ENDPOINT}/v1/job/subscribe/1`
      ].emitMessage({ data: JSON.stringify({ type: 'progress', payload: 50 }) })
    }
  })

  it('should complete() when eventsource sends completed event', async () => {
    const { result } = renderHook(() => useExecutorService())

    await waitFor(() => {
      expect(axiosGetSpy).toHaveBeenCalledWith('api/auth')
    })

    if (result.current.observeExecutorServiceJob) {
      const observable = result.current.observeExecutorServiceJob(1)
      observable.subscribe({
        complete: () => {
          expect(1).toEqual(1)
          expect.assertions(2) // Trick to ensure the above assertion was reached
        },
      })

      sources[
        `${import.meta.env.VITE_EXECUTOR_SERVICE_ENDPOINT}/v1/job/subscribe/1`
      ].emitMessage({
        data: JSON.stringify({ type: 'completed' }),
      })
    }
  })

  it('should error() when eventsource sends error event', async () => {
    const { result } = renderHook(() => useExecutorService())

    await waitFor(() => {
      expect(axiosGetSpy).toHaveBeenCalledWith('api/auth')
    })

    if (result.current.observeExecutorServiceJob) {
      const observable = result.current.observeExecutorServiceJob(1)
      observable.subscribe({
        error: (error) => {
          expect(error).toBe('"any error"')
        },
      })

      sources[
        `${import.meta.env.VITE_EXECUTOR_SERVICE_ENDPOINT}/v1/job/subscribe/1`
      ].emitError('any error')
    }
  })
})
