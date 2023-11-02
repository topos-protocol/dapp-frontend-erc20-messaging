import { context } from '@opentelemetry/api'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics'
import {
  BatchSpanProcessor,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { ZoneContextManager } from '@opentelemetry/context-zone'

export const SERVICE_NAME =
  import.meta.env.VITE_OTEL_SERVICE_NAME || 'cross-subnet-message'
export const SERVICE_VERSION =
  import.meta.env.VITE_TRACING_SERVICE_VERSION || 'unknown'
export const OTEL_EXPORTER_OTLP_ENDPOINT =
  import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318'

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
    [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
  })
)

// Note: metrics don't seem to work for now in the browser
// const metricReader = new PeriodicExportingMetricReader({
//   exporter: new OTLPMetricExporter({
//     url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
//   }),

//   // Default is 60000ms (60 seconds). Set to 3 seconds for demonstrative purposes only.
//   exportIntervalMillis: 3000,
// })

const provider = new WebTracerProvider({
  resource: resource,
})
const exporter = new OTLPTraceExporter({
  url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
})
const processor = new BatchSpanProcessor(exporter)
provider.addSpanProcessor(processor)

provider.register({
  contextManager: new ZoneContextManager(),
})
