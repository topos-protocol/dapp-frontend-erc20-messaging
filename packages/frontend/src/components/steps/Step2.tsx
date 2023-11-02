import { CheckCircleFilled } from '@ant-design/icons'
import {
  context,
  propagation,
  Span,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api'
import * as ERC20MessagingJSON from '@topos-protocol/topos-smart-contracts/artifacts/contracts/examples/ERC20Messaging.sol/ERC20Messaging.json'
import { Avatar, List, Spin } from 'antd'
import { Job } from 'bull'
import {
  BigNumber,
  ContractReceipt,
  ContractTransaction,
  ethers,
  utils,
} from 'ethers'
import { useContext, useEffect, useMemo, useState } from 'react'
import { lastValueFrom, tap } from 'rxjs'

import { ErrorsContext } from '../../contexts/errors'
import { TracingContext } from '../../contexts/tracing'
import { MultiStepFormContext } from '../../contexts/multiStepForm'
import useEthers from '../../hooks/useEthers'
import useApproveAllowance from '../../hooks/useAllowance'
import useExecutorService, {
  TracingOptions,
} from '../../hooks/useExecutorService'
import useReceiptTrie from '../../hooks/useReceiptTrie'
import useSendToken from '../../hooks/useSendToken'
import { StepProps } from '../MultiStepForm'
import Progress from '../Progress'
import useTracingCreateSpan from '../../hooks/useTracingCreateSpan'
import { SubnetWithId, Token } from '../../types'
import { getErrorMessage } from '../../utils'

const Step2 = ({ onFinish }: StepProps) => {
  const { setErrors } = useContext(ErrorsContext)
  const { approveAllowance, getCurrentAllowance } = useApproveAllowance()
  const { observeExecutorServiceJob, sendToExecutorService } =
    useExecutorService()
  const { sendToken } = useSendToken()
  const { createMerkleProof } = useReceiptTrie()
  const { amount, receivingSubnet, recipientAddress, sendingSubnet, token } =
    useContext(MultiStepFormContext)
  const [progress, setProgress] = useState(0)
  const { rootSpan, tracingOptions: rootTracingOptions } =
    useContext(TracingContext)
  const stepSpan = useMemo(
    () => useTracingCreateSpan('Step2', 'step-2', rootSpan),
    [rootSpan]
  )

  const { provider } = useEthers({
    subnet: sendingSubnet,
    viaMetaMask: true,
  })

  const progressSteps = useMemo(
    () => [
      {
        description: `Requesting ${token?.symbol} allowance approval`,
        logo: sendingSubnet?.logoURL,
        title: sendingSubnet?.name,
      },
      {
        description: `Requesting ${token?.symbol} transfer`,
        logo: sendingSubnet?.logoURL,
        title: sendingSubnet?.name,
      },
      {
        description: `Waiting for transaction execution`,
        logo: receivingSubnet?.logoURL,
        title: receivingSubnet?.name,
      },
    ],
    []
  )

  const [activeProgressStep, setActiveProgressStep] = useState(0)

  useEffect(() => {
    let mainSpan: Span | undefined

    async function main() {
      const isReady =
        receivingSubnet &&
        recipientAddress &&
        token &&
        amount &&
        observeExecutorServiceJob &&
        sendToExecutorService &&
        stepSpan &&
        rootSpan

      if (isReady) {
        try {
          mainSpan = useTracingCreateSpan('Step2', 'main', stepSpan)
          const parsedAmount = ethers.utils.parseUnits(amount.toString())

          await processTokenAllowance(parsedAmount, token)
          setActiveProgressStep((s) => s + 1)

          const sendTokenOutput = await processSendTokenCall(
            receivingSubnet,
            token,
            recipientAddress,
            parsedAmount
          )
          setActiveProgressStep((s) => s + 1)

          const merkleProofOutput = await processMerkleProofCreation(
            sendTokenOutput!.sendTokenReceipt,
            sendTokenOutput!.sendTokenTx
          )

          const tokenSentLogIndex = await processSentTokenLogIndex(
            sendTokenOutput!.sendTokenReceipt
          )

          const executorServiceJob = await processExecutorServiceExecute(
            receivingSubnet,
            tokenSentLogIndex,
            merkleProofOutput.proof,
            merkleProofOutput.trieRoot
          )

          if (executorServiceJob) {
            const observable = await processExecutorServiceObserveJob(
              executorServiceJob
            )
            await lastValueFrom(observable)
              .then(() => {
                setActiveProgressStep((s) => s + 1)
              })
              .catch((error) => {
                throw error
              })
          }
        } catch (error: any) {
          setErrors((e) => [
            ...e,
            {
              message: `Something bad happened!`,
              description: (
                <span>
                  Request support on{' '}
                  <a
                    href={`https://discord.com/channels/1022950664650883092/1072269417762799676`}
                    target="_blank"
                    style={{ color: 'inherit', textDecoration: 'underline' }}
                  >
                    our dedicated Discord channel
                  </a>{' '}
                  by sending us this trace id:{' '}
                  {(rootSpan as any)._spanContext.traceId}
                </span>
              ),
            },
          ])
          const message = getErrorMessage(error)
          mainSpan?.setStatus({
            code: SpanStatusCode.ERROR,
            message,
          })
          stepSpan.setStatus({
            code: SpanStatusCode.ERROR,
          })
          rootSpan?.setStatus({
            code: SpanStatusCode.ERROR,
          })
          mainSpan?.end()
          stepSpan?.end()
          rootSpan?.end()
        }
      }
    }

    function processTokenAllowance(parsedAmount: BigNumber, token: Token) {
      return getCurrentAllowance(token)
        .then((currentAllowance) => {
          if (currentAllowance.lt(parsedAmount)) {
            const span = useTracingCreateSpan(
              'Step2',
              'processTokenAllowance',
              mainSpan
            )
            return approveAllowance(token, parsedAmount)
              .then(() => {
                span?.setStatus({ code: SpanStatusCode.OK })
              })
              .catch((error) => {
                const message = getErrorMessage(error)
                span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message,
                })
                throw error
              })
              .finally(() => {
                span?.end()
              })
          }
        })
        .catch((error) => {
          throw error
        })
    }

    function processSendTokenCall(
      receivingSubnet: SubnetWithId,
      token: Token,
      recipientAddress: string,
      parsedAmount: BigNumber
    ) {
      const span = useTracingCreateSpan(
        'Step2',
        'processSendTokenCall',
        mainSpan
      )

      return sendToken(
        receivingSubnet?.id,
        token?.addr,
        recipientAddress,
        parsedAmount
      )
        .then((data) => {
          span?.setStatus({ code: SpanStatusCode.OK })
          return data
        })
        .catch((error) => {
          const message = getErrorMessage(error)
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message,
          })
          throw error
        })
        .finally(() => {
          span.end()
        })
    }

    function processMerkleProofCreation(
      sendTokenReceipt: ContractReceipt,
      sendTokenTx: ContractTransaction
    ) {
      const span = useTracingCreateSpan(
        'Step2',
        'processMerkleProofCreation',
        mainSpan
      )
      return provider
        .getBlockWithTransactions(sendTokenReceipt.blockHash)
        .then((block) => {
          span.addEvent('got block', { block: JSON.stringify(block) })
          return createMerkleProof(block, sendTokenTx)
            .then(({ proof, trie }) => {
              const trieRoot = ethers.utils.hexlify(trie.root())
              span.addEvent('got proof and trie', {
                proof,
                trie: JSON.stringify(trie),
                trieRoot,
              })
              span.setStatus({ code: SpanStatusCode.OK })
              return { proof, trie, trieRoot }
            })
            .catch((error) => {
              const message = getErrorMessage(error)
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message,
              })
              throw error
            })
        })
        .catch((error) => {
          const message = getErrorMessage(error)
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message,
          })
          throw error
        })
        .finally(() => {
          span.end()
        })
    }

    function processSentTokenLogIndex(sendTokenReceipt: ContractReceipt) {
      const span = useTracingCreateSpan(
        'Step2',
        'processSentTokenLogIndex',
        mainSpan
      )

      const iface = new ethers.utils.Interface(ERC20MessagingJSON.abi)
      let tokenSentLogIndex: number | undefined = undefined

      for (let log of sendTokenReceipt.logs) {
        try {
          const logDescription = iface.parseLog(log)

          if (logDescription.name === 'TokenSent') {
            tokenSentLogIndex = log.logIndex
            break
          }
        } catch {
          // Empty catch to let errors pass as it's expected not to find
          // a matching event while looping through receipt logs
        }
      }

      if (tokenSentLogIndex == undefined) {
        const error = new Error(
          'TokenSent event was not found in receipt logs!'
        )
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        })
        throw error
      }

      return tokenSentLogIndex
    }

    function processExecutorServiceExecute(
      receivingSubnet: SubnetWithId,
      tokenSentLogIndex: number,
      proof: string,
      trieRoot: string
    ) {
      const span = useTracingCreateSpan(
        'Step2',
        'processExecutorServiceExecute',
        mainSpan
      )

      const messagingContractAddress = import.meta.env
        .VITE_ERC20_MESSAGING_CONTRACT_ADDRESS

      if (!messagingContractAddress) {
        throw new Error(
          'The address of the ERC20Messaging contract is either missing or incorrect'
        )
      }

      return context.with(trace.setSpan(context.active(), span), async () => {
        const tracingOptions: TracingOptions = {
          traceparent: '',
          tracestate: '',
        }

        propagation.inject(context.active(), tracingOptions)

        return sendToExecutorService!(
          {
            logIndexes: [tokenSentLogIndex!],
            messagingContractAddress,
            receiptTrieMerkleProof: proof,
            receiptTrieRoot: trieRoot,
            // receiptTrieRoot: trieRoot.substring(0, trieRoot.length - 1) + 'a',
            subnetId: receivingSubnet?.id,
          },
          rootTracingOptions,
          tracingOptions
        )
          .then((job) => {
            span.setStatus({
              code: SpanStatusCode.OK,
            })
            return job
          })
          .catch((error) => {
            const message = getErrorMessage(error)
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message,
            })
            throw error
          })
          .finally(() => {
            span.end()
          })
      })
    }

    function processExecutorServiceObserveJob(job: Job) {
      const span = useTracingCreateSpan(
        'Step2',
        'processExecutorServiceObserveJob',
        mainSpan
      )

      return context.with(trace.setSpan(context.active(), span), async () => {
        const tracingOptions: TracingOptions = {
          traceparent: '',
          tracestate: '',
        }

        propagation.inject(context.active(), tracingOptions)

        return observeExecutorServiceJob!(job.id, tracingOptions).pipe(
          tap({
            next: (progress: number) => {
              setProgress(progress)
              span.addEvent('got progress update', {
                progress,
              })
            },
            error: (error: string) => {
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message: error,
              })
              span.end()
            },
            complete: () => {
              span.setStatus({
                code: SpanStatusCode.OK,
              })
              span.end()
            },
          })
        )
      })
    }

    main()
  }, [
    amount,
    approveAllowance,
    createMerkleProof,
    observeExecutorServiceJob,
    provider,
    receivingSubnet,
    recipientAddress,
    sendToExecutorService,
    token,
    stepSpan,
    rootSpan,
  ])

  useEffect(
    function onCompletion() {
      if (onFinish && activeProgressStep === progressSteps.length) {
        setTimeout(() => {
          stepSpan?.end()
          onFinish()
        }, 1000)
      }
    },
    [activeProgressStep, stepSpan]
  )

  return (
    <>
      <Progress
        progress={
          activeProgressStep < progressSteps.length - 1
            ? (100 * activeProgressStep) / progressSteps.length
            : (100 * (progressSteps.length - 1)) / progressSteps.length +
              progress / progressSteps.length
        }
      />
      <List
        itemLayout="horizontal"
        dataSource={progressSteps}
        renderItem={({ description, logo, title }, index) => (
          <List.Item
            id={`executeStep${index}`}
            style={{ opacity: index > activeProgressStep ? 0.5 : 1 }}
          >
            <List.Item.Meta
              avatar={<Avatar src={logo} />}
              title={title}
              description={description}
            />
            {index === activeProgressStep ? <Spin /> : null}
            {index < activeProgressStep ? (
              <CheckCircleFilled style={{ fontSize: '1.4rem' }} />
            ) : null}
          </List.Item>
        )}
      />
    </>
  )
}

export default Step2
