import { renderHook } from '@testing-library/react'
import * as tracingExports from '@opentelemetry/api'
import { vi } from 'vitest'

import { SERVICE_NAME } from '../tracing'
import useCreateTracingSpan from './useCreateTracingSpan'

const setSpanMock = vi.fn().mockReturnValue({})
const startSpanMock = vi.fn().mockReturnValue({})

const tracerMock = {
  startSpan: startSpanMock,
}

const getTracerMock = vi.fn().mockReturnValue(tracerMock)

vi.spyOn(tracingExports, 'trace', 'get').mockReturnValue({
  getTracer: getTracerMock,
  setSpan: setSpanMock,
} as any)

describe('useCreateTracingSpan', () => {
  it('should get tracer and create root span if no parent span', () => {
    const spanName = 'spanMock'
    renderHook(() => useCreateTracingSpan(spanName))

    expect(getTracerMock).toHaveBeenCalledWith(SERVICE_NAME)
    expect(startSpanMock).toHaveBeenCalledWith(spanName, undefined, undefined)
  })

  it('should create non-root span if parent span', () => {
    const spanName = 'spanMock'
    const parentSpan = {}
    renderHook(() => useCreateTracingSpan(spanName, parentSpan as any))

    expect(getTracerMock).toHaveBeenCalledWith(SERVICE_NAME)
    expect(startSpanMock).toHaveBeenCalledWith(spanName, undefined, parentSpan)
  })
})
