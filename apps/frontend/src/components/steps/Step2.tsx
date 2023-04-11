import { CheckCircleFilled } from '@ant-design/icons'
import { Avatar, List, Space, Spin } from 'antd'
import { ethers } from 'ethers'
import React from 'react'

import { ErrorsContext, SubnetsContext } from '../../contexts'
import useEthers from '../../hooks/useEthers'
import useApproveAllowance from '../../hooks/useApproveAllowance'
import useExecutorService from '../../hooks/useExecutorService'
import useTransactionTrie from '../../hooks/useTransactionTrie'
import useSendToken from '../../hooks/useSendToken'
import { getRawTransaction } from '../../util'
import { ExtraDataContext, FormsContext, StepProps } from '../MultiStepForm'
import Progress from '../Progress'

const Step2 = ({ onFinish }: StepProps) => {
  const { setErrors } = React.useContext(ErrorsContext)
  const { approveAllowance } = useApproveAllowance()
  const { observeExecutorServiceJob, sendToExecutorService } =
    useExecutorService()
  const { sendToken } = useSendToken()
  const { createMerkleProof } = useTransactionTrie()
  const { registeredSubnets } = React.useContext(SubnetsContext)
  const { registeredTokens } = React.useContext(ExtraDataContext)
  const { form0, form1 } = React.useContext(FormsContext)
  const [progress, setProgress] = React.useState(0)

  const sendingSubnet = React.useMemo(
    () =>
      registeredSubnets.find(
        (s) => s.chainId.toHexString() === form0.getFieldValue('sendingSubnet')
      ),
    [form0]
  )
  const receivingSubnet = React.useMemo(
    () =>
      registeredSubnets.find(
        (s) =>
          s.chainId.toHexString() === form1.getFieldValue('receivingSubnet')
      ),
    [form1]
  )

  const tokenSymbol = React.useMemo(() => form1.getFieldValue('token'), [form1])

  const token = React.useMemo(
    () => registeredTokens.find((t) => t.symbol === tokenSymbol),
    [registeredTokens, tokenSymbol]
  )

  const recipientAddress = React.useMemo(
    () => form1.getFieldValue('recipientAddress'),
    [form1]
  )

  const amount = React.useMemo<number>(
    () => form1.getFieldValue('amount'),
    [form1]
  )

  const { provider } = useEthers({
    subnet: sendingSubnet,
    viaMetaMask: true,
  })

  const progressSteps = React.useMemo(
    () => [
      {
        description: `Requesting ${tokenSymbol} allowance approval`,
        logo: sendingSubnet?.logoURL,
        title: sendingSubnet?.name,
      },
      {
        description: `Requesting ${tokenSymbol} transfer`,
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
        const parsedAmount = ethers.utils.parseUnits(amount.toString())
        await approveAllowance(token, parsedAmount)
        setActiveProgressStep((s) => s + 1)

        const { sendTokenTx, sendTokenReceipt } = await sendToken(
          receivingSubnet?.subnetId,
          recipientAddress,
          tokenSymbol,
          parsedAmount
        )
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
            await sendToExecutorService({
              txRaw: sendTokenTxRaw,
              indexOfDataInTxRaw,
              subnetId: receivingSubnet?.subnetId,
              txTrieMerkleProof: proof,
              txTrieRoot: trieRoot,
            })
              .then(async (job) => {
                observeExecutorServiceJob(job.id).subscribe({
                  next: (progress: number) => {
                    setProgress(progress)
                  },
                  error: (error) => {
                    setErrors((e) => [...e, error])
                  },
                  complete: () => {
                    setActiveProgressStep((s) => s + 1)
                  },
                })
              })
              .catch((error: any) => {
                setErrors((e) => [
                  ...e,
                  `Error when calling the Executor Service`,
                ])
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
    tokenSymbol,
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
