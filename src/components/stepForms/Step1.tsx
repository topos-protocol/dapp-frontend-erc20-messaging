import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, Segmented, Select } from 'antd'
import React from 'react'

import { SubnetsContext } from '../../contexts'
import { StepProps, SubnetLogo } from '../MultiStepForm'

const { Option } = Select

export default ({ form, onFinish, onPrev }: StepProps) => {
  const { subnets } = React.useContext(SubnetsContext)

  const transactionTypeOptions = React.useMemo(
    () => ['Asset Transfer', 'Smart Contract Call'],
    []
  )
  const [transactionType, setTransactionType] = React.useState<string | number>(
    transactionTypeOptions[0]
  )

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Segmented
        onChange={setTransactionType}
        options={transactionTypeOptions}
        value={transactionType}
      />
      <>
        {transactionType === transactionTypeOptions[0] ? (
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
                {subnets.map((subnet) => (
                  <Option key={subnet.name} value={subnet.name}>
                    {subnet.name}
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
                {subnets.map((subnet) => (
                  <Option key={subnet.name} value={subnet.name}>
                    {subnet.name}
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
        <Button onClick={onPrev}>Prev</Button>
        <Button type="primary" htmlType="submit">
          Next
        </Button>
      </Form.Item>
    </Form>
  )
}
