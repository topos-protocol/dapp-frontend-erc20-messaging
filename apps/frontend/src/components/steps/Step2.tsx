import { CheckCircleFilled } from '@ant-design/icons'
import { context, trace } from '@opentelemetry/api'
import { Avatar, List, Spin } from 'antd'
import { ContractReceipt, Transaction, ethers } from 'ethers'
import React from 'react'

import { ErrorsContext } from '../../contexts/errors'
import { TracingContext } from '../../contexts/tracing'
import { MultiStepFormContext } from '../../contexts/multiStepForm'
import useEthers from '../../hooks/useEthers'
import useApproveAllowance from '../../hooks/useApproveAllowance'
import useExecutorService from '../../hooks/useExecutorService'
import useTransactionTrie from '../../hooks/useTransactionTrie'
import useSendToken from '../../hooks/useSendToken'
import { getRawTransaction } from '../../util'
import { StepProps } from '../MultiStepForm'
import Progress from '../Progress'
import { SERVICE_NAME } from '../../tracing'

const Step2 = ({ onFinish }: StepProps) => {
  const { setErrors } = React.useContext(ErrorsContext)
  const { approveAllowance } = useApproveAllowance()
  const { observeExecutorServiceJob, sendToExecutorService } =
    useExecutorService()
  const { sendToken } = useSendToken()
  const { createMerkleProof } = useTransactionTrie()
  const { amount, receivingSubnet, recipientAddress, sendingSubnet, token } =
    React.useContext(MultiStepFormContext)
  const [progress, setProgress] = React.useState(0)
  const { activeSpan } = React.useContext(TracingContext)

  const { provider } = useEthers({
    subnet: sendingSubnet,
    viaMetaMask: true,
  })

  const progressSteps = React.useMemo(
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

  const [activeProgressStep, setActiveProgressStep] = React.useState(0)

  React.useEffect(() => {
    async function submitSendToken() {
      if (
        receivingSubnet &&
        recipientAddress &&
        token &&
        amount &&
        observeExecutorServiceJob &&
        sendToExecutorService
      ) {
        const tracer = trace.getTracer(SERVICE_NAME)
        const stepSpan = tracer.startSpan('step-2', {
          links: activeSpan ? [{ context: activeSpan.spanContext() }] : [],
        })
        const parsedAmount = ethers.utils.parseUnits(amount.toString())

        const allowanceSpan = tracer.startSpan(
          'approve-allowance',
          undefined,
          trace.setSpan(context.active(), stepSpan)
        )

        await approveAllowance(token, parsedAmount)
          .catch((error) => {
            allowanceSpan.recordException(error)
          })
          .finally(() => {
            allowanceSpan.end()
          })
        setActiveProgressStep((s) => s + 1)

        const sendTokenSpan = tracer.startSpan(
          'send-token',
          undefined,
          trace.setSpan(context.active(), stepSpan)
        )
        const { sendTokenTx, sendTokenReceipt } = await sendToken(
          receivingSubnet?.subnetId,
          recipientAddress,
          token?.symbol,
          parsedAmount
        )
        sendTokenSpan.end()
        setActiveProgressStep((s) => s + 1)

        if (sendTokenReceipt) {
          const block = await provider.getBlockWithTransactions(
            sendTokenReceipt.blockHash
          )

          const sendTokenTxRaw = getRawTransaction(sendTokenTx)
          const indexOfDataInTxRaw =
            sendTokenTxRaw.substring(2).indexOf(sendTokenTx.data.substring(2)) /
            2

          const { proof, trie } = await createMerkleProof(block, sendTokenTx)
          const trieRoot = ethers.utils.hexlify(trie.root())

          if (proof && trie) {
            const sendExecutorServiceSpan = tracer.startSpan(
              'send-to-executor-service',
              undefined,
              trace.setSpan(context.active(), stepSpan)
            )
            await sendToExecutorService({
              txRaw: sendTokenTxRaw,
              indexOfDataInTxRaw,
              subnetId: receivingSubnet?.subnetId,
              txTrieMerkleProof: proof,
              txTrieRoot: trieRoot,
            })
              .then((job) => {
                sendExecutorServiceSpan.end()

                const observeExecutorJobSpan = tracer.startSpan(
                  'observe-executor-service',
                  undefined,
                  trace.setSpan(context.active(), stepSpan)
                )
                observeExecutorServiceJob(job.id).subscribe({
                  next: (progress: number) => {
                    setProgress(progress)
                    observeExecutorJobSpan.addEvent('progress', {
                      progress,
                    })
                  },
                  error: (error) => {
                    setErrors((e) => [...e, error])
                    console.log('ending span step-2 error')
                    observeExecutorJobSpan.recordException(error)
                    observeExecutorJobSpan.end()
                    stepSpan.end()
                  },
                  complete: () => {
                    setActiveProgressStep((s) => s + 1)
                    console.log('ending span step-2')
                    observeExecutorJobSpan.end()
                    stepSpan.end()
                  },
                })
              })
              .catch((error: any) => {
                setErrors((e) => [
                  ...e,
                  `Error when calling the Executor Service`,
                ])
                sendExecutorServiceSpan.recordException(error)
                console.error(error)
              })
          }
        }
      }
    }

    submitSendToken()
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
  ])

  React.useEffect(
    function onCompletion() {
      if (onFinish && activeProgressStep === progressSteps.length) {
        setTimeout(onFinish, 1000)
      }
    },
    [activeProgressStep]
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
          <List.Item style={{ opacity: index > activeProgressStep ? 0.5 : 1 }}>
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
