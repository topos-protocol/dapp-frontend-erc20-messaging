import { Avatar, Space, Tag, Typography } from 'antd'
import React from 'react'

import { MultiStepFormContext } from '../../contexts/multiStepForm'
import { shortenAddress } from '../../util'
import { TransactionType, TransactionTypeContext } from '../MultiStepForm'

const { Text } = Typography

const Summary1 = () => {
  const { amount, form1, receivingSubnet, recipientAddress, token } =
    React.useContext(MultiStepFormContext)
  const { transactionType } = React.useContext(TransactionTypeContext)

  return (
    <Space direction="vertical" size={12}>
      <Space direction="vertical" size={4}>
        <Text strong>Transaction type</Text>
        <Tag
          color={
            transactionType === TransactionType.ASSET_TRANSFER
              ? 'gold'
              : 'geekblue'
          }
        >
          {transactionType}
        </Tag>
      </Space>
      <Space direction="vertical" size={4}>
        <Text strong>Receiving subnet</Text>
        <Space>
          <Avatar size="small" src={receivingSubnet?.logoURL} />
          <Text>{receivingSubnet?.name}</Text>
        </Space>
      </Space>
      {transactionType === TransactionType.ASSET_TRANSFER ? (
        <>
          <Space direction="vertical" size={4}>
            <Text strong>Token</Text>
            <Tag color="green">{token!.symbol}</Tag>
          </Space>
          <Space direction="vertical" size={4}>
            <Text strong>Recipient Address</Text>
            <Text>{shortenAddress(recipientAddress || '')}</Text>
          </Space>
          <Space direction="vertical" size={4}>
            <Text strong>Amount</Text>
            <Text>{amount}</Text>
          </Space>
        </>
      ) : (
        <>
          <Space direction="vertical" size={4}>
            <Text strong>Contract Address</Text>
            <Text>
              {shortenAddress(form1?.getFieldValue('contractAddress'))}
            </Text>
          </Space>
          <Space direction="vertical" size={4}>
            <Text strong>Function</Text>
            <Text>{form1?.getFieldValue('function')}</Text>
          </Space>
          <Space direction="vertical" size={4}>
            <Text strong>Arguments</Text>
            {form1
              ?.getFieldValue('arguments')
              .map((argument: string, index: number) => (
                <Space direction="vertical" size={2} key={index}>
                  <Text>{argument}</Text>
                </Space>
              ))}
          </Space>
        </>
      )}
    </Space>
  )
}

export default Summary1
