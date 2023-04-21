import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import {
  BatchSpanProcessor,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { ZoneContextManager } from '@opentelemetry/context-zone'

export const SERVICE_NAME =
  import.meta.env.VITE_TRACING_SERVICE_NAME || 'cross-subnet-message'
export const SERVICE_VERSION =
  import.meta.env.VITE_TRACING_SERVICE_VERSION || 'unknown'
export const OTEL_COLLECTOR_ENDPOINT =
  import.meta.env.VITE_TRACING_OTEL_COLLECTOR_ENDPOINT || ''

// Optionally register instrumentation libraries
registerInstrumentations({
  instrumentations: [],
})

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
    [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
  })
)

const provider = new WebTracerProvider({
  resource: resource,
})
// const exporter = new ConsoleSpanExporter()
const exporter = new OTLPTraceExporter({
  // optional - default url is http://localhost:4318/v1/traces
  url: OTEL_COLLECTOR_ENDPOINT,
  // optional - collection of custom headers to be sent with each request, empty by default
  headers: {},
})
const processor = new BatchSpanProcessor(exporter)
provider.addSpanProcessor(processor)

provider.register({
  contextManager: new ZoneContextManager(),
})
