import { Span } from '@opentelemetry/api'
import React from 'react'

interface TracingContext {
  rootSpan?: Span
}

export const TracingContext = React.createContext<TracingContext>({})
