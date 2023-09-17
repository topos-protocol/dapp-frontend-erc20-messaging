import { CheckCircleFilled } from '@ant-design/icons'
import { apm } from '@elastic/apm-rum'
import * as ERC20MessagingJSON from '@topos-protocol/topos-smart-contracts/artifacts/contracts/examples/ERC20Messaging.sol/ERC20Messaging.json'
import { Avatar, List, Spin } from 'antd'
import { ethers } from 'ethers'
import { useContext, useEffect, useMemo, useState } from 'react'

import { ErrorsContext } from '../../contexts/errors'
import { TracingContext } from '../../contexts/tracing'
import { MultiStepFormContext } from '../../contexts/multiStepForm'
import useEthers from '../../hooks/useEthers'
import useApproveAllowance from '../../hooks/useAllowance'
import useExecutorService from '../../hooks/useExecutorService'
import useReceiptTrie from '../../hooks/useReceiptTrie'
import useSendToken from '../../hooks/useSendToken'
import { StepProps } from '../MultiStepForm'
import Progress from '../Progress'

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
  const { transaction: apmTransaction } = useContext(TracingContext)
  const stepSpan = useMemo(
    () =>
      apmTransaction?.startSpan('multi-step-form-step-2', 'app', {
        blocking: false,
      }),
    [apmTransaction]
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
    async function submitSendToken() {
      if (
        receivingSubnet &&
        recipientAddress &&
        token &&
        amount &&
        observeExecutorServiceJob &&
        sendToExecutorService &&
        apmTransaction
      ) {
        const submitSendTokenSpan = apmTransaction?.startSpan(
          'submit-send-token',
          'app'
        )
        let allowanceSpan

        const parsedAmount = ethers.utils.parseUnits(amount.toString())

        try {
          const currentAllowance = await getCurrentAllowance(token)

          if (currentAllowance.lt(parsedAmount)) {
            allowanceSpan = apmTransaction?.startSpan(
              'approve-allowance',
              'app'
            )
            await approveAllowance(token, parsedAmount)
          }
        } catch (error) {
          if (typeof error === 'string') {
            setErrors((e) => [...e, error as string])
          }
          apm.captureError(error as string)
          allowanceSpan?.end()
          return
        }
        allowanceSpan?.end()

        setActiveProgressStep((s) => s + 1)

        const sendTokenSpan = apmTransaction?.startSpan('send-token', 'app')

        let sendTokenTx
        let sendTokenReceipt
        try {
          const data = await sendToken(
            receivingSubnet?.id,
            token?.addr,
            recipientAddress,
            parsedAmount
          )

          sendTokenTx = data.sendTokenTx
          sendTokenReceipt = data.sendTokenReceipt
        } catch (error) {
          if (typeof error === 'string') {
            setErrors((e) => [...e, error as string])
          }
          apm.captureError(error as string)
          sendTokenSpan?.end()
          return
        }
        sendTokenSpan?.end()

        setActiveProgressStep((s) => s + 1)

        if (sendTokenReceipt) {
          const block = await provider.getBlockWithTransactions(
            sendTokenReceipt.blockHash
          )

          const { proof, trie } = await createMerkleProof(block, sendTokenTx)
          const trieRoot = ethers.utils.hexlify(trie.root())

          if (proof && trie) {
            const sendExecutorServiceSpan = apmTransaction?.startSpan(
              'send-request-to-executor-service',
              'app',
              { sync: true }
            )

            const traceparent = sendExecutorServiceSpan
              ? `00-${(sendExecutorServiceSpan as any).traceId}-${
                  (sendExecutorServiceSpan as any).id
                }-01`
              : ''

            const iface = new ethers.utils.Interface(ERC20MessagingJSON.abi)
            let tokenSentLogIndex: number | undefined = undefined

            for (let log of sendTokenReceipt.logs) {
              try {
                const logDescription = iface.parseLog(log)

                if (logDescription.name === 'TokenSent') {
                  tokenSentLogIndex = log.logIndex
                  break
                }
              } catch {}
            }

            if (tokenSentLogIndex == undefined) {
              setErrors((e) => [
                ...e,
                `TokenSent event was not found in receipt logs!`,
              ])
              return
            }

            await sendToExecutorService(
              {
                logIndexes: [tokenSentLogIndex],
                messagingContractAddress: import.meta.env
                  .VITE_ERC20_MESSAGING_CONTRACT_ADDRESS,
                receiptTrieMerkleProof: proof,
                receiptTrieRoot: trieRoot,
                subnetId: receivingSubnet?.id,
              },
              { traceparent }
            )
              .then((job) => {
                sendExecutorServiceSpan?.end()
                const observeExecutorJobSpan = apmTransaction?.startSpan(
                  'wait-for-executor-service-job-execution',
                  'app',
                  { sync: true }
                )

                const traceparent = observeExecutorJobSpan
                  ? `00-${(observeExecutorJobSpan as any).traceId}-${
                      (observeExecutorJobSpan as any).id
                    }-01`
                  : ''

                observeExecutorServiceJob(job.id, { traceparent }).subscribe({
                  next: (progress: number) => {
                    setProgress(progress)
                    observeExecutorJobSpan?.addLabels({
                      progress,
                    })
                  },
                  error: (error: string) => {
                    setErrors((e) => [
                      ...e,
                      `Error when watching the Executor Service's job: ${
                        error.length < 300 ? error : '(details in console)'
                      }`,
                    ])
                    apm.captureError(error as string)
                    observeExecutorJobSpan?.end()
                    submitSendTokenSpan?.end()
                  },
                  complete: () => {
                    setActiveProgressStep((s) => s + 1)
                    observeExecutorJobSpan?.end()
                    submitSendTokenSpan?.end()
                  },
                })
              })
              .catch((error: any) => {
                setErrors((e) => [
                  ...e,
                  `Error when calling the Executor Service`,
                ])
                apm.captureError(error as string)
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
    apmTransaction,
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
