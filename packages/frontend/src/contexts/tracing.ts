import { Span } from '@opentelemetry/api'
import { createContext } from 'react'
import { TracingOptions } from '../hooks/useExecutorService'

export interface TracingContext {
  rootSpan?: Span
  tracingOptions: TracingOptions
}

export const TracingContext = createContext<TracingContext>({
  tracingOptions: { traceparent: '', tracestate: '' },
})
