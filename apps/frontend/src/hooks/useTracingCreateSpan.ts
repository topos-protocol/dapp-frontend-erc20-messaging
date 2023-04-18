import { Span, trace } from '@opentelemetry/api'
import React from 'react'

import { SERVICE_NAME } from '../tracing'

export default function useTracingCreateSpan(
  spanName: string,
  activeSpan?: Span
) {
  const [span, setSpan] = React.useState<Span>()

  React.useEffect(
    function init() {
      if (spanName && activeSpan) {
        const tracer = trace.getTracer(SERVICE_NAME)
        const span = tracer?.startSpan(spanName, {
          links: [{ context: activeSpan.spanContext() }],
        })
        setSpan(span)
      }
    },
    [spanName, activeSpan]
  )

  return {
    span,
  }
}
