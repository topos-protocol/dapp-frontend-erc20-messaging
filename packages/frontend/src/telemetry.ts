import { metrics } from '@opentelemetry/api'
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
  import.meta.env.VITE_OTEL_SERVICE_NAME || 'erc20-messaging-frontend'
export const SERVICE_VERSION =
  import.meta.env.VITE_OTEL_SERVICE_VERSION || 'unknown'
export const OTEL_EXPORTER_OTLP_ENDPOINT =
  import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318'

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
    [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
  })
)

// Note: metrics aren't supported at the moment in the browser
// See https://github.com/open-telemetry/opentelemetry-js/issues/4256
// ---
// const meterProvider = new MeterProvider({
//   resource: resource,
// })
// const metricReader = new PeriodicExportingMetricReader({
//   exporter: new OTLPMetricExporter({
//     url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
//   }),
// })
// meterProvider.addMetricReader(metricReader)
// metrics.setGlobalMeterProvider(meterProvider)
// ---

const traceProvider = new WebTracerProvider({
  resource: resource,
})
const processor = new BatchSpanProcessor(
  new OTLPTraceExporter({
    url: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
  })
)
traceProvider.addSpanProcessor(processor)

traceProvider.register({
  contextManager: new ZoneContextManager(),
})
