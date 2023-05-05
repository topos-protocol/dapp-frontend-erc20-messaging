import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
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
} from 'antd'
import { SegmentedValue } from 'antd/lib/segmented'
import { ethers } from 'ethers'
import React from 'react'

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
import useCreateTracingSpan from '../../hooks/useCreateTracingSpan'
import useCheckTokenOnSubnet from '../../hooks/useCheckTokenOnReceivingSubnet'
import useTokenBalance from '../../hooks/useTokenBalance'

const TransactionTypeSelector = styled(Segmented)`
  margin-bottom: 1rem;
`

const { Option } = Select

const Step1 = ({ onFinish, onPrev }: StepProps) => {
  const { data: registeredSubnets } = React.useContext(SubnetsContext)
  const {
    amount,
    form1,
    receivingSubnet,
    recipientAddress,
    registeredTokens,
    sendingSubnet,
    token,
  } = React.useContext(MultiStepFormContext)
  const { checkTokenOnSubnet, loading: receivingSubnetLoading } =
    useCheckTokenOnSubnet()
  const { rootSpan } = React.useContext(TracingContext)
  const stepSpan = React.useMemo(
    () => useCreateTracingSpan('step-1', rootSpan),
    [rootSpan]
  )

  const subnetsWithoutSendingOne = React.useMemo(
    () => registeredSubnets?.filter((s) => s.name !== sendingSubnet?.name),
    [registeredSubnets, sendingSubnet]
  )

  const { transactionType, setTransactionType } = React.useContext(
    TransactionTypeContext
  )

  const onTransactionTypeChange = React.useCallback(
    (value: SegmentedValue) => {
      setTransactionType(value.toString() as TransactionType)
    },
    [setTransactionType]
  )

  const { balance } = useTokenBalance(sendingSubnet, token)

  React.useEffect(() => {
    if (receivingSubnet) {
      form1?.validateFields(['receivingSubnet'])
    }
  }, [form1, token])

  React.useEffect(
    function traceSelectToken() {
      stepSpan?.addEvent('select token', {
        token: JSON.stringify(token),
      })
    },
    [token]
  )

  React.useEffect(
    function traceSelectReceivingSubnet() {
      stepSpan?.addEvent('select receiving subnet', {
        receivingSubnet: JSON.stringify(receivingSubnet),
      })
    },
    [receivingSubnet]
  )

  React.useEffect(
    function traceSelectRecipientAddress() {
      stepSpan?.addEvent('select recipient address', {
        recipientAddress: JSON.stringify(recipientAddress),
      })
    },
    [recipientAddress]
  )

  React.useEffect(
    function traceSelectAmount() {
      stepSpan?.addEvent('select amount', {
        amount: JSON.stringify(amount),
      })
    },
    [amount]
  )

  const nextStep = React.useCallback(() => {
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
        {transactionType === TransactionType.ASSET_TRANSFER ? (
          <>
            <Form.Item
              label="Token"
              name="token"
              extra={
                balance !== undefined ? `${balance} ${token?.symbol}` : null
              }
              rules={[
                {
                  required: true,
                  message: 'Please select a token!',
                },
              ]}
            >
              <Select
                size="large"
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Space style={{ padding: '0 8px 4px' }}>
                      <RegisterToken />
                    </Space>
                  </>
                )}
              >
                {registeredTokens?.map((token) => (
                  <Option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="receivingSubnet"
              label="Receiving Subnet"
              rules={[
                {
                  required: true,
                  message: 'Please select the receiving subnet!',
                },
                {
                  validator: (_, value) => checkTokenOnSubnet(token, value),
                },
              ]}
            >
              <SubnetSelect
                placeholder="Select a subnet"
                loading={receivingSubnetLoading}
                disabled={!token || receivingSubnetLoading}
                subnets={subnetsWithoutSendingOne}
              />
            </Form.Item>
            <Form.Item
              label="Recipient address"
              name="recipientAddress"
              rules={[
                {
                  required: true,
                  message: 'Please input the address of the recipient!',
                },
                {
                  validator: async (_, value) => {
                    if (ethers.utils.isAddress(value)) {
                      return Promise.resolve()
                    }

                    return Promise.reject(
                      new Error('This address is not a valid address!')
                    )
                  },
                },
              ]}
            >
              <Input disabled={!token || receivingSubnetLoading} />
            </Form.Item>
            <Form.Item
              label="Amount"
              name="amount"
              rules={[
                {
                  required: true,
                  message: 'Please input an amount!',
                },
              ]}
            >
              <InputNumber
                disabled={!token || receivingSubnetLoading}
                addonAfter={token?.symbol}
                max={balance}
              />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item
              name="receivingSubnet"
              label="Receiving Subnet"
              rules={[
                {
                  required: true,
                  message: 'Please select the receiving subnet!',
                },
              ]}
            >
              <SubnetSelect
                placeholder="Select a subnet"
                subnets={subnetsWithoutSendingOne}
              />
            </Form.Item>
            <Form.Item
              label="Contract Address"
              name="contractAddress"
              rules={[
                {
                  required: true,
                  message: 'Please input the address of the contract!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Function"
              name="function"
              rules={[
                {
                  required: true,
                  message: 'Please input the function to be called!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.List name="arguments" initialValue={[null]}>
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      label={index === 0 ? 'Arguments' : ''}
                      key={field.key}
                    >
                      <Form.Item {...field} noStyle>
                        <Input />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          onClick={() => remove(field.name)}
                        />
                      ) : null}
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      style={{ width: '60%' }}
                      icon={<PlusOutlined />}
                    >
                      Add an argument
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
          </>
        )}
      </>
      <Form.Item>
        <Space>
          <Button onClick={onPrev}>Prev</Button>
          <Button
            type="primary"
            htmlType="submit"
            disabled={!token || receivingSubnetLoading}
          >
            Next
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default Step1
