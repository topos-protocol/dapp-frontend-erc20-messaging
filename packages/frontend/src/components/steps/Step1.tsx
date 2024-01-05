import styled from '@emotion/styled'
import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Segmented,
  Select,
  Space,
  Tag,
  Tooltip,
  message,
} from 'antd'
import { SegmentedValue } from 'antd/lib/segmented'
import { isAddress } from 'ethers'
import { useCallback, useContext, useEffect, useMemo } from 'react'

import { MultiStepFormContext } from '../../contexts/multiStepForm'
import { SubnetsContext } from '../../contexts/subnets'
import { TracingContext } from '../../contexts/tracing'
import {
  StepProps,
  TransactionType,
  TransactionTypeContext,
} from '../MultiStepForm'
import RegisterToken from '../RegisterToken'
import SubnetSelect from '../SubnetSelect'
import useCheckTokenOnSubnet from '../../hooks/useCheckTokenOnReceivingSubnet'
import useTokenBalance from '../../hooks/useTokenBalance'
import { ERROR } from '../../constants/wordings'
import { CopyOutlined } from '@ant-design/icons'
import { shortenAddress } from '../../utils'
import useTracingCreateSpan from '../../hooks/useTracingCreateSpan'

const TransactionTypeSelector = styled(Segmented)`
  margin-bottom: 1rem;
`

const Step1 = ({ onFinish, onPrev }: StepProps) => {
  const { data: registeredSubnets } = useContext(SubnetsContext)
  const {
    amount,
    form1,
    receivingSubnet,
    recipientAddress,
    registeredTokens,
    registeredTokensLoading,
    sendingSubnet,
    token,
  } = useContext(MultiStepFormContext)
  const { checkTokenOnSubnet, loading: receivingSubnetLoading } =
    useCheckTokenOnSubnet()
  const { rootSpan } = useContext(TracingContext)
  const stepSpan = useMemo(
    () => useTracingCreateSpan('Step1', 'step-1', rootSpan),
    [rootSpan]
  )

  const subnetsWithoutSendingOne = useMemo(
    () => registeredSubnets?.filter((s) => s.name !== sendingSubnet?.name),
    [registeredSubnets, sendingSubnet]
  )

  const { transactionType, setTransactionType } = useContext(
    TransactionTypeContext
  )

  const onTransactionTypeChange = useCallback(
    (value: SegmentedValue) => {
      setTransactionType(value.toString() as TransactionType)
    },
    [setTransactionType]
  )

  const copyTokenAddress = useCallback(() => {
    navigator.clipboard.writeText(token?.addr || '')
    message.info(`${token?.symbol} token address copied to clipboard!`)
  }, [token])

  const { balance } = useTokenBalance(sendingSubnet, token)

  useEffect(() => {
    if (receivingSubnet) {
      form1?.validateFields(['receivingSubnet'])
    }
  }, [form1, token])

  useEffect(
    function traceSelectToken() {
      stepSpan?.addEvent('selected token', {
        token: JSON.stringify(token),
      })
    },
    [token]
  )

  useEffect(
    function traceSelectReceivingSubnet() {
      stepSpan?.addEvent('selected receiving subnet', {
        receivingSubnet: JSON.stringify(receivingSubnet),
      })
    },
    [receivingSubnet]
  )

  useEffect(
    function traceSelectRecipientAddress() {
      stepSpan?.addEvent('selected recipient address', {
        recipientAddress: JSON.stringify(recipientAddress),
      })
    },
    [recipientAddress]
  )

  useEffect(
    function traceSelectAmount() {
      stepSpan?.addEvent('selected amount', {
        amount: JSON.stringify(amount),
      })
    },
    [amount]
  )

  const nextStep = useCallback(() => {
    stepSpan?.end()
    onFinish()
  }, [stepSpan])

  return (
    <Form form={form1} layout="vertical" onFinish={nextStep}>
      <TransactionTypeSelector
        onChange={onTransactionTypeChange}
        options={Object.values(TransactionType)}
        value={transactionType}
      />
      <>
        <Form.Item
          label="Token"
          name="token"
          extra={
            balance !== undefined ? (
              <div style={{ marginTop: '0.4rem' }}>
                <Tag color="gold">
                  {balance} {token?.symbol}
                </Tag>
                (<Tag>{token?.symbol}</Tag>:{' '}
                <Tooltip title={token?.addr}>
                  {shortenAddress(token?.addr || '')}
                </Tooltip>{' '}
                <Button
                  type="text"
                  size="small"
                  shape="circle"
                  icon={<CopyOutlined />}
                  onClick={copyTokenAddress}
                />
                )
              </div>
            ) : null
          }
          rules={[
            {
              required: true,
              message: ERROR.MISSING_TOKEN,
            },
          ]}
        >
          <Select
            size="middle"
            disabled={registeredTokensLoading}
            loading={registeredTokensLoading}
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Space style={{ padding: '0 8px 4px' }}>
                  <RegisterToken />
                </Space>
              </>
            )}
            options={registeredTokens?.map(({ addr, symbol }) => ({
              label: symbol,
              value: addr,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="receivingSubnet"
          label="Receiving Subnet"
          rules={[
            {
              required: true,
              message: ERROR.MISSING_RECEIVING_SUBNET,
            },
            {
              validator: (_, value) => checkTokenOnSubnet(token, value),
            },
          ]}
        >
          <SubnetSelect
            placeholder="Select a subnet"
            loading={receivingSubnetLoading}
            disabled={!token || receivingSubnetLoading || balance === '0.0'}
            subnets={subnetsWithoutSendingOne}
          />
        </Form.Item>
        <Form.Item
          label="Recipient address"
          name="recipientAddress"
          rules={[
            {
              required: true,
              message: ERROR.MISSING_RECIPIENT_ADDRESS,
            },
            {
              validator: (_, value) =>
                new Promise<void>((resolve, reject) => {
                  if ((isAddress(value) && value.startsWith('0x')) || !value) {
                    resolve()
                  }

                  reject(new Error(ERROR.INVALID_ADDRESS))
                }),
            },
          ]}
        >
          <Input
            disabled={!token || receivingSubnetLoading || balance === '0.0'}
          />
        </Form.Item>
        <Form.Item
          label="Amount"
          name="amount"
          rules={[
            {
              required: true,
              message: ERROR.MISSING_AMOUNT,
            },
          ]}
        >
          <InputNumber
            disabled={!token || receivingSubnetLoading || balance === '0.0'}
            addonAfter={token?.symbol}
            max={balance}
          />
        </Form.Item>
      </>
      <Form.Item>
        <Space>
          <Button id="prevButton" onClick={onPrev}>
            Prev
          </Button>
          <Button
            id="nextButton"
            type="primary"
            htmlType="submit"
            disabled={!token || receivingSubnetLoading || balance === '0.0'}
          >
            Next
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default Step1
