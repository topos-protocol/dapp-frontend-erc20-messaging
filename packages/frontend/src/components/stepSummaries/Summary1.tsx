import { Avatar, Space, Tag, Typography } from 'antd'
import React from 'react'

import { MultiStepFormContext } from '../../contexts/multiStepForm'
import { shortenAddress } from '../../utils'
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
          <Text id="summary1ReceivingSubnet">{receivingSubnet?.name}</Text>
        </Space>
      </Space>
      <Space direction="vertical" size={4}>
        <Text strong>Token</Text>
        <Tag id="summary1Token" color="green">
          {token!.symbol}
        </Tag>
      </Space>
      <Space direction="vertical" size={4}>
        <Text strong>Recipient Address</Text>
        <Text id="summary1RecipientAddress">
          {shortenAddress(recipientAddress || '')}
        </Text>
      </Space>
      <Space direction="vertical" size={4}>
        <Text strong>Amount</Text>
        <Text id="summary1Amount">{amount}</Text>
      </Space>
    </Space>
  )
}

export default Summary1
