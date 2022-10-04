import { ApiPromise, HttpProvider, WsProvider } from '@polkadot/api'
import React from 'react'

export default function usePolkadotApi(endpoint: string) {
  const [api, setApi] = React.useState<ApiPromise>()

  React.useEffect(() => {
    async function createApiPromise() {
      const provider = endpoint.startsWith('http')
        ? new HttpProvider(endpoint)
        : new WsProvider(endpoint)

      const api = await ApiPromise.create({ provider })
      setApi(api)
    }

    createApiPromise()
  }, [])

  return api
}
