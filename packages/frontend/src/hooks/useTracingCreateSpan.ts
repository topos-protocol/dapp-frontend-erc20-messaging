import { Span, context, trace } from '@opentelemetry/api'

export default function useTracingCreateSpan(
  scopeName: string,
  spanName: string,
  parentSpan?: Span
) {
  const tracer = trace.getTracer(scopeName)
  const span = tracer.startSpan(
    spanName,
    undefined,
    parentSpan ? trace.setSpan(context.active(), parentSpan) : undefined
  )

  return span
}
