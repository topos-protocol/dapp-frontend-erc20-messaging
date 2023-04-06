import { Avatar, Space, Tag, Typography } from 'antd'
import React from 'react'

import { SubnetsContext } from '../../contexts'
import { shortenAddress } from '../../util'
import {
  ExtraDataContext,
  FormsContext,
  TransactionType,
  TransactionTypeContext,
} from '../MultiStepForm'

const { Text } = Typography

const Summary1 = () => {
  const { form1 } = React.useContext(FormsContext)
  const { registeredTokens } = React.useContext(ExtraDataContext)
  const { transactionType } = React.useContext(TransactionTypeContext)
  const { registeredSubnets } = React.useContext(SubnetsContext)
  const subnet = React.useMemo(
    () =>
      registeredSubnets.find(
        (s) =>
          s.chainId.toHexString() === form1.getFieldValue('receivingSubnet')
      ),
    [form1, registeredSubnets]
  )

  const tokenSymbol = React.useMemo(() => form1.getFieldValue('token'), [form1])

  const token = React.useMemo(
    () => registeredTokens.find((t) => t.symbol === tokenSymbol),
    [tokenSymbol, registeredTokens]
  )

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
          <Avatar size="small" src={subnet?.logoURL} />
          <Text>{subnet?.name}</Text>
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
            <Text>
              {shortenAddress(form1.getFieldValue('recipientAddress'))}
            </Text>
          </Space>
          <Space direction="vertical" size={4}>
            <Text strong>Amount</Text>
            <Text>{form1.getFieldValue('amount')}</Text>
          </Space>
        </>
      ) : (
        <>
          <Space direction="vertical" size={4}>
            <Text strong>Contract Address</Text>
            <Text>
              {shortenAddress(form1.getFieldValue('contractAddress'))}
            </Text>
          </Space>
          <Space direction="vertical" size={4}>
            <Text strong>Function</Text>
            <Text>{form1.getFieldValue('function')}</Text>
          </Space>
          <Space direction="vertical" size={4}>
            <Text strong>Arguments</Text>
            {form1
              .getFieldValue('arguments')
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
