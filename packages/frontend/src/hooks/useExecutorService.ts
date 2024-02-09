import * as ERC20MessagingJSON from '@topos-protocol/topos-smart-contracts/artifacts/contracts/examples/ERC20Messaging.sol/ERC20Messaging.json'
import * as BurnableMintableCappedERC20JSON from '@topos-protocol/topos-smart-contracts/artifacts/contracts/topos-core/BurnableMintableCappedERC20.sol/BurnableMintableCappedERC20.json'
import axios from 'axios'
import { Job, JobId } from 'bull'
import { OAuthResponse } from 'common'
import { Interface } from 'ethers'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { useContext, useEffect, useMemo, useState } from 'react'
import { Observable } from 'rxjs'

import { ErrorsContext } from '../contexts/errors'
import {
  ExecuteError,
  ExecuteProcessorError,
  ExecuteTransactionError,
} from '../types'

export interface ExecuteDto {
  logIndexes: number[]
  messagingContractAddress: string
  receiptTrieMerkleProof: string
  receiptTrieRoot: string
  subnetId: string
}

export interface TracingOptions {
  traceparent: string
  tracestate: string
}

export default function useExecutorService() {
  const { setErrors } = useContext(ErrorsContext)
  const [authToken, setAuthToken] = useState<string>()

  useEffect(function getAuthToken() {
    axios
      .get<OAuthResponse>('api/auth')
      .then(({ data }) => {
        setAuthToken(data.access_token)
      })
      .catch((error) => {
        console.error(error)
        setErrors((e) => [
          ...e,
          { message: `Error when requesting an access token (Auth0)` },
        ])
      })
  }, [])

  const sendToExecutorService = useMemo(() => {
    if (authToken) {
      const api = axios.create({
        baseURL: import.meta.env.VITE_EXECUTOR_SERVICE_ENDPOINT,
        headers: {
          common: { Authorization: `Bearer ${authToken}` },
        },
      })

      return (
        executeDto: ExecuteDto,
        {
          traceparent: rootTraceparent,
          tracestate: rootTracestate,
        }: TracingOptions,
        { traceparent, tracestate }: TracingOptions
      ) => {
        return api
          .post<Job>('v1/execute', executeDto, {
            // Root tracing options are used to have the job
            // consumer work attached to the root trace
            headers: {
              rootTraceparent,
              rootTracestate,
              traceparent,
              tracestate,
            },
          })
          .then(({ data }) => data)
      }
    } else {
      return null
    }
  }, [authToken])

  const observeExecutorServiceJob = useMemo(() => {
    if (authToken) {
      return (jobId: JobId, tracingOptions?: TracingOptions) => {
        return new Observable<number>((subscriber) => {
          const eventSource = new EventSourcePolyfill(
            `${
              import.meta.env.VITE_EXECUTOR_SERVICE_ENDPOINT
            }/v1/job/subscribe/${jobId.toString()}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                traceparent: tracingOptions?.traceparent || '',
                tracestate: tracingOptions?.tracestate || '',
              },
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

          eventSource.onerror = ({ data }: any) => {
            try {
              const executeError: ExecuteError = JSON.parse(data)
              let { message } = executeError

              if (
                executeError.type ===
                ExecuteProcessorError.EXECUTE_TRANSACTION_REVERT
              ) {
                const executeTransactionError: ExecuteTransactionError =
                  JSON.parse(executeError.message)

                if (!executeTransactionError.decoded) {
                  const ERC20MessagingInterface = new Interface(
                    ERC20MessagingJSON.abi
                  )
                  const ERC20Interface = new Interface(
                    BurnableMintableCappedERC20JSON.abi
                  )

                  const decodedError =
                    ERC20MessagingInterface.parseError(
                      executeTransactionError.data
                    ) || ERC20Interface.parseError(executeTransactionError.data)

                  message = JSON.stringify({
                    type: ExecuteProcessorError.EXECUTE_TRANSACTION_REVERT,
                    message: decodedError?.name,
                  })
                } else {
                  message = JSON.stringify({
                    type: ExecuteProcessorError.EXECUTE_TRANSACTION_REVERT,
                    message: executeTransactionError.data,
                  })
                }
              } else {
                message = executeError.message
              }

              console.error(message)
              eventSource.close()
              subscriber.error(message)
            } catch (error) {
              console.error(error)
              eventSource.close()
              subscriber.error(error)
            }
          }
        })
      }
    } else {
      return null
    }
  }, [authToken])

  return { observeExecutorServiceJob, sendToExecutorService }
}
