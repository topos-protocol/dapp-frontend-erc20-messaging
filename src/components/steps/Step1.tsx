import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import styled from '@emotion/styled'
import { Avatar, Button, Form, Input, Segmented, Select, Space } from 'antd'
import { SegmentedValue } from 'antd/lib/segmented'
import React from 'react'

import { SubnetsContext } from '../../contexts'
import {
  FormsContext,
  StepProps,
  TransactionType,
  TransactionTypeContext,
} from '../MultiStepForm'

const TransactionTypeSelector = styled(Segmented)`
  margin-bottom: 1rem;
`

const { Option } = Select

export default ({ onFinish, onPrev }: StepProps) => {
  const { subnets } = React.useContext(SubnetsContext)
  const { form0, form1 } = React.useContext(FormsContext)
  const sendingSubnet = React.useMemo(
    () => form0.getFieldValue('sendingSubnet'),
    [form0]
  )
  const subnetsWithoutSendingOne = React.useMemo(
    () => subnets.filter((s) => s.name !== sendingSubnet),
    [subnets, sendingSubnet]
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

  return (
    <Form form={form1} layout="vertical" onFinish={onFinish}>
      <TransactionTypeSelector
        onChange={onTransactionTypeChange}
        options={Object.values(TransactionType)}
        value={transactionType}
      />
      <>
        {transactionType === TransactionType.ASSET_TRANSFER ? (
          <>
            <Form.Item
              label="Token Contract Address"
              name="tokenContractAddress"
              rules={[
                {
                  required: true,
                  message: 'Please input the address of the token contract!',
                },
              ]}
            >
              <Input />
            </Form.Item>
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
              <Select placeholder="Select a subnet">
                {subnetsWithoutSendingOne.map((subnet) => (
                  <Option key={subnet.name} value={subnet.name}>
                    <Avatar size="small" src={subnet.logoUrl} /> {subnet.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Recipient address"
              name="recipientAddress"
              rules={[
                {
                  required: true,
                  message: 'Please input the address of the recipient!',
                },
              ]}
            >
              <Input />
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
              <Input />
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
              <Select placeholder="Select a subnet">
                {subnetsWithoutSendingOne.map((subnet) => (
                  <Option key={subnet.name} value={subnet.name}>
                    <Avatar size="small" src={subnet.logoUrl} /> {subnet.name}
                  </Option>
                ))}
              </Select>
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
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Space>
          <Button onClick={onPrev}>Prev</Button>
          <Button type="primary" htmlType="submit">
            Next
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
