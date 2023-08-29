import { CheckCircleFilled } from '@ant-design/icons'
import * as ERC20MessagingJSON from '@topos-protocol/topos-smart-contracts/artifacts/contracts/examples/ERC20Messaging.sol/ERC20Messaging.json'
import { Avatar, List, Spin } from 'antd'
import { ethers, providers } from 'ethers'
import React from 'react'

import { ErrorsContext } from '../../contexts/errors'
import { TracingContext } from '../../contexts/tracing'
import { MultiStepFormContext } from '../../contexts/multiStepForm'
import useEthers from '../../hooks/useEthers'
import useApproveAllowance from '../../hooks/useAllowance'
import useCreateTracingSpan from '../../hooks/useCreateTracingSpan'
import useExecutorService from '../../hooks/useExecutorService'
import useReceiptTrie from '../../hooks/useReceiptTrie'
import useSendToken from '../../hooks/useSendToken'
import { StepProps } from '../MultiStepForm'
import Progress from '../Progress'

const Step2 = ({ onFinish }: StepProps) => {
  const { setErrors } = React.useContext(ErrorsContext)
  const { approveAllowance, getCurrentAllowance } = useApproveAllowance()
  const { observeExecutorServiceJob, sendToExecutorService } =
    useExecutorService()
  const { sendToken } = useSendToken()
  const { createMerkleProof } = useReceiptTrie()
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

        try {
          const currentAllowance = await getCurrentAllowance(token)

          if (currentAllowance.lt(parsedAmount)) {
            await approveAllowance(token, parsedAmount)
          }
        } catch (error) {
          if (typeof error === 'string') {
            setErrors((e) => [...e, error as string])
          }
          allowanceSpan.recordException(error as string)
          allowanceSpan.end()
          return
        }
        allowanceSpan.end()

        setActiveProgressStep((s) => s + 1)

        const sendTokenSpan = useCreateTracingSpan(
          'send-token',
          submitSendTokenSpan
        )

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
          sendTokenSpan.recordException(error as string)
          sendTokenSpan.end()
          return
        }
        sendTokenSpan.end()

        setActiveProgressStep((s) => s + 1)

        if (sendTokenReceipt) {
          const block = await provider.getBlockWithTransactions(
            sendTokenReceipt.blockHash
          )

          const { proof, trie } = await createMerkleProof(block, sendTokenTx)
          const trieRoot = ethers.utils.hexlify(trie.root())

          if (proof && trie) {
            const sendExecutorServiceSpan = useCreateTracingSpan(
              'send-request-to-executor-service',
              submitSendTokenSpan
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
              } catch {}
            }

            if (tokenSentLogIndex == undefined) {
              setErrors((e) => [
                ...e,
                `TokenSent event was not found in receipt logs!`,
              ])
              return
            }

            await sendToExecutorService({
              logIndexes: [tokenSentLogIndex],
              messagingContractAddress: import.meta.env
                .VITE_ERC20_MESSAGING_CONTRACT_ADDRESS,
              receiptTrieMerkleProof: proof,
              receiptTrieRoot: trieRoot,
              subnetId: receivingSubnet?.id,
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
                  error: (error: string) => {
                    setErrors((e) => [
                      ...e,
                      `Error when watching the Executor Service's job: ${
                        error.length < 300 ? error : '(details in console)'
                      }`,
                    ])
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
