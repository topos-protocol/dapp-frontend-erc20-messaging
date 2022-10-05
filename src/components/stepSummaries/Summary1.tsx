import { Avatar, Space, Tag } from 'antd'
import React from 'react'

import { SubnetsContext } from '../../contexts'
import {
  FormsContext,
  TransactionType,
  TransactionTypeContext,
} from '../MultiStepForm'

export default () => {
  const { form1 } = React.useContext(FormsContext)
  const { transactionType } = React.useContext(TransactionTypeContext)
  const { subnets } = React.useContext(SubnetsContext)
  const subnet = React.useMemo(
    () =>
      subnets.find((s) => s.name === form1.getFieldValue('receivingSubnet')),
    [form1, subnets]
  )

  return (
    <Space direction="vertical" size={12}>
      <Space direction="vertical" size={4}>
        <b>Transaction type</b>
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
        <b>Receiving subnet</b>
        <Space>
          <Avatar size="small" src={subnet?.logoUrl} />
          <>{subnet?.name}</>
        </Space>
      </Space>
      {transactionType === TransactionType.ASSET_TRANSFER ? (
        <>
          <Space direction="vertical" size={4}>
            <b>Token Contract Address</b>
            <>{form1.getFieldValue('tokenContractAddress')}</>
          </Space>
          <Space direction="vertical" size={4}>
            <b>Recipient Address</b>
            <>{form1.getFieldValue('recipientAddress')}</>
          </Space>
          <Space direction="vertical" size={4}>
            <b>Amount</b>
            <>{form1.getFieldValue('amount')}</>
          </Space>
        </>
      ) : (
        <>
          <Space direction="vertical" size={4}>
            <b>Contract Address</b>
            <>{form1.getFieldValue('contractAddress')}</>
          </Space>
          <Space direction="vertical" size={4}>
            <b>Function</b>
            <>{form1.getFieldValue('function')}</>
          </Space>
          <Space direction="vertical" size={4}>
            <b>Arguments</b>
            {form1
              .getFieldValue('arguments')
              .map((argument: string, index: number) => (
                <Space direction="vertical" size={2} key={index}>
                  {argument}
                </Space>
              ))}
          </Space>
        </>
      )}
    </Space>
  )
}
