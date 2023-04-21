import { CheckCircleFilled } from '@ant-design/icons'
import { Avatar, List, Spin } from 'antd'
import { ethers } from 'ethers'
import React from 'react'

import { ErrorsContext } from '../../contexts/errors'
import { TracingContext } from '../../contexts/tracing'
import { MultiStepFormContext } from '../../contexts/multiStepForm'
import useEthers from '../../hooks/useEthers'
import useApproveAllowance from '../../hooks/useApproveAllowance'
import useCreateTracingSpan from '../../hooks/useCreateTracingSpan'
import useExecutorService from '../../hooks/useExecutorService'
import useTransactionTrie from '../../hooks/useTransactionTrie'
import useSendToken from '../../hooks/useSendToken'
import { getRawTransaction } from '../../util'
import { StepProps } from '../MultiStepForm'
import Progress from '../Progress'

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
  const { rootSpan } = React.useContext(TracingContext)
  const stepSpan = React.useMemo(
    () => useCreateTracingSpan('step-2', rootSpan),
    [rootSpan]
  )

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
        sendToExecutorService &&
        stepSpan
      ) {
        const submitSendTokenSpan = useCreateTracingSpan(
          'submit-send-token',
          stepSpan
        )
        const parsedAmount = ethers.utils.parseUnits(amount.toString())

        const allowanceSpan = useCreateTracingSpan(
          'approve-allowance',
          submitSendTokenSpan
        )

        await approveAllowance(token, parsedAmount)
          .catch((error) => {
            allowanceSpan.recordException(error)
          })
          .finally(() => {
            allowanceSpan.end()
          })
        setActiveProgressStep((s) => s + 1)

        const sendTokenSpan = useCreateTracingSpan(
          'send-token',
          submitSendTokenSpan
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
            const sendExecutorServiceSpan = useCreateTracingSpan(
              'send-request-to-executor-service',
              submitSendTokenSpan
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

                const observeExecutorJobSpan = useCreateTracingSpan(
                  'wait-for-executor-service-job-execution',
                  submitSendTokenSpan
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
                    observeExecutorJobSpan.recordException(error)
                    observeExecutorJobSpan.end()
                    submitSendTokenSpan.end()
                  },
                  complete: () => {
                    setActiveProgressStep((s) => s + 1)
                    observeExecutorJobSpan.end()
                    submitSendTokenSpan.end()
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
    stepSpan,
  ])

  React.useEffect(
    function onCompletion() {
      if (onFinish && activeProgressStep === progressSteps.length) {
        setTimeout(() => {
          stepSpan.end()
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
