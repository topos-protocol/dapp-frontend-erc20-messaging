import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web'

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { ZoneContextManager } from '@opentelemetry/context-zone'

export const SERVICE_NAME =
  import.meta.env.VITE_TRACING_SERVICE_NAME ||
  'dapp-frontend-erc20-messaging-web'
export const SERVICE_VERSION =
  import.meta.env.VITE_TRACING_SERVICE_VERSION || 'unknown'
export const OTEL_COLLECTOR_ENDPOINT =
  import.meta.env.VITE_TRACING_OTEL_COLLECTOR_ENDPOINT || ''

registerInstrumentations({
  instrumentations: [
    // getWebAutoInstrumentations({
    //   // load custom configuration for xml-http-request instrumentation
    //   '@opentelemetry/instrumentation-xml-http-request': {
    //     // clearTimingResources: true,
    //   },
    // }),
  ],
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

provider.addSpanProcessor(new BatchSpanProcessor(exporter))
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))

provider.register({
  contextManager: new ZoneContextManager(),
})
