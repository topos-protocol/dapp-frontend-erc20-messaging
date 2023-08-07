import { Span, context, trace } from '@opentelemetry/api'
import React from 'react'

import { SERVICE_NAME, SERVICE_VERSION } from '../tracing'

export default function useTracingCreateSpan(
  spanName: string,
  parentSpan?: Span
) {
  const tracer = trace.getTracer(SERVICE_NAME, SERVICE_VERSION)
  const span = tracer.startSpan(
    spanName,
    undefined,
    parentSpan ? trace.setSpan(context.active(), parentSpan) : undefined
  )

  return span
}
