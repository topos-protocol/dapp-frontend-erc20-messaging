import { Span } from '@opentelemetry/api'
import React from 'react'

interface TracingContext {
  activeSpan?: Span
  setActiveSpan?: React.Dispatch<React.SetStateAction<Span | undefined>>
}

export const TracingContext = React.createContext<TracingContext>({})
