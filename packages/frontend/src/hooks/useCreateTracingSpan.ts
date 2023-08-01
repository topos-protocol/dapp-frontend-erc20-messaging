import { Span, context, trace } from '@opentelemetry/api'

import { SERVICE_NAME } from '../tracing'

export default function useTracingCreateSpan(
  spanName: string,
  parentSpan?: Span
) {
  const tracer = trace.getTracer(SERVICE_NAME)
  const span = tracer.startSpan(
    spanName,
    undefined,
    parentSpan ? trace.setSpan(context.active(), parentSpan) : undefined
  )

  return span
}
