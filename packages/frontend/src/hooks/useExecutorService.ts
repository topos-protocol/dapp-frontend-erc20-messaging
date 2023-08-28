import axios from 'axios'
import { Job, JobId } from 'bull'
import { EventSourcePolyfill } from 'event-source-polyfill'
import React from 'react'
import { Observable } from 'rxjs'

import { OAuthResponse } from 'common'
import { ErrorsContext } from '../contexts/errors'

export interface ExecuteDto {
  logIndexes: number[]
  messagingContractAddress: string
  receiptTrieMerkleProof: string
  receiptTrieRoot: string
  subnetId: string
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
            {
              headers: { Authorization: `Bearer ${authToken}` },
              heartbeatTimeout: 200000,
            }
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

          eventSource.onerror = (error: any) => {
            const message = error.data || JSON.stringify(error)
            console.error(message)
            eventSource.close()
            subscriber.error(message)
          }
        })
      }
    } else {
      return null
    }
  }, [authToken])

  return { observeExecutorServiceJob, sendToExecutorService }
}
