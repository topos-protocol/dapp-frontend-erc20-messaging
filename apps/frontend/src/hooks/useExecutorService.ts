import axios from 'axios'
import { Job, JobId } from 'bull'
import { EventSourcePolyfill } from 'event-source-polyfill'
import React from 'react'
import { Observable } from 'rxjs'

import { OAuthResponse } from '@dapp-frontend-cross-subnet/backend/auth'
import { ErrorsContext } from '../contexts/errors'

interface ExecuteDto {
  txRaw: string
  indexOfDataInTxRaw: number
  subnetId: string
  txTrieMerkleProof: string
  txTrieRoot: string
}

export default function useExecutorService() {
  const { setErrors } = React.useContext(ErrorsContext)
  const [authToken, setAuthToken] = React.useState<string>()

  React.useEffect(function getAuthToken() {
    axios
      .get<OAuthResponse>('api/auth')
      .then(({ data }) => {
        setAuthToken(data.access_token)
      })
      .catch((error) => {
        console.error(error)
        setErrors((e) => [
          ...e,
          `Error when requesting an access token (Auth0)`,
        ])
      })
  }, [])

  const sendToExecutorService = React.useMemo(() => {
    if (authToken) {
      const api = axios.create({
        baseURL: import.meta.env.VITE_EXECUTOR_SERVICE_ENDPOINT,
        headers: {
          common: { Authorization: `Bearer ${authToken}` },
        },
      })

      return (executeDto: ExecuteDto) => {
        return api.post<Job>('v1/execute', executeDto).then(({ data }) => data)
      }
    } else {
      return null
    }
  }, [authToken])

  const observeExecutorServiceJob = React.useMemo(() => {
    if (authToken) {
      return (jobId: JobId) => {
        return new Observable<number>((subscriber) => {
          const eventSource = new EventSourcePolyfill(
            `${
              import.meta.env.VITE_EXECUTOR_SERVICE_ENDPOINT
            }/v1/job/subscribe/${jobId.toString()}`,
            { headers: { Authorization: `Bearer ${authToken}` } }
          )

          eventSource.onmessage = ({ data }) => {
            const { payload, type } = JSON.parse(data)

            switch (type) {
              case 'progress':
                subscriber.next(payload)
                break
              case 'completed':
                eventSource.close()
                subscriber.complete()
                break
            }
          }

          eventSource.onerror = (error) => {
            console.error(error)
            eventSource.close()
            subscriber.error(error)
          }
        })
      }
    } else {
      return null
    }
  }, [authToken])

  return { observeExecutorServiceJob, sendToExecutorService }
}
