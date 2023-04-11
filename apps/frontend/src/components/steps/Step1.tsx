import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import styled from '@emotion/styled'
import * as BurnableMintableCappedERC20JSON from '@toposware/topos-smart-contracts/brownie/build/contracts/BurnableMintableCappedERC20.json'
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

import { ErrorsContext, SubnetsContext } from '../../contexts'
import { toposCoreContract } from '../../contracts'
import useEthers from '../../hooks/useEthers'
import useRegisteredTokens from '../../hooks/useRegisteredTokens'
import {
  ExtraDataContext,
  FormsContext,
  StepProps,
  TransactionType,
  TransactionTypeContext,
} from '../MultiStepForm'
import RegisterToken from '../RegisterToken'
import SubnetSelect from '../SubnetSelect'

const TransactionTypeSelector = styled(Segmented)`
  margin-bottom: 1rem;
`

const { Option } = Select

const Step1 = ({ onFinish, onPrev }: StepProps) => {
  const { setErrors } = React.useContext(ErrorsContext)
  const { registeredSubnets } = React.useContext(SubnetsContext)
  const { registeredTokens, setRegisteredTokens } =
    React.useContext(ExtraDataContext)
  const { form0, form1 } = React.useContext(FormsContext)
  const [loadingReceivingSubnet, setLoadingReceivingSubnet] =
    React.useState(false)
  const [balance, setBalance] = React.useState<string>()
  const sendingSubnet = React.useMemo(
    () =>
      registeredSubnets.find(
        (s) => s.chainId.toHexString() === form0.getFieldValue('sendingSubnet')
      ),
    [registeredSubnets, form0]
  )
  const {
    errors: getRegisteredTokensErrors,
    getRegisteredTokens,
    loading: getRegisteredTokensLoading,
    tokens,
  } = useRegisteredTokens(sendingSubnet)

  const subnetsWithoutSendingOne = React.useMemo(
    () => registeredSubnets.filter((s) => s.name !== sendingSubnet?.name),
    [registeredSubnets, sendingSubnet]
  )

  const { provider } = useEthers({
    subnet: sendingSubnet,
    viaMetaMask: true,
  })

  const { transactionType, setTransactionType } = React.useContext(
    TransactionTypeContext
  )

  const onTransactionTypeChange = React.useCallback(
    (value: SegmentedValue) => {
      setTransactionType(value.toString() as TransactionType)
    },
    [setTransactionType]
  )

  const selectedTokenSymbol = Form.useWatch('token', form1)

  const receivingSubnetId = Form.useWatch('receivingSubnet', form1)

  const selectedToken = React.useMemo(
    () => registeredTokens.find((t) => t.symbol === selectedTokenSymbol),
    [registeredTokens, selectedTokenSymbol]
  )

  const signerAddress = React.useMemo(async () => {
    const signer = provider.getSigner()
    return await signer.getAddress()
  }, [provider])

  const tokenContract = React.useMemo(
    () =>
      selectedToken
        ? new ethers.Contract(
            selectedToken.tokenAddress,
            BurnableMintableCappedERC20JSON.abi,
            provider
          )
        : null,
    [selectedToken, provider]
  )

  const getTokenBalance = React.useCallback(async () => {
    if (tokenContract) {
      const balance = await tokenContract.balanceOf(signerAddress)
      setBalance(ethers.utils.formatUnits(balance))
    }
  }, [tokenContract, signerAddress])

  React.useEffect(() => {
    getTokenBalance()
  }, [getTokenBalance])

  React.useEffect(
    function getTokens() {
      getRegisteredTokens()
    },
    [getRegisteredTokens]
  )

  React.useEffect(
    function setTokensInContext() {
      if (tokens) {
        setRegisteredTokens(tokens)
      }
    },
    [tokens]
  )

  React.useEffect(() => {
    if (receivingSubnetId) {
      form1.validateFields(['receivingSubnet'])
    }
  }, [form1, selectedTokenSymbol])

  const checkTokenOnReceivingSubnet = React.useCallback(
    async (receivingSubnetChainId: string) => {
      setLoadingReceivingSubnet(true)

      const receivingSubnet = registeredSubnets.find(
        (s) => s.chainId.toHexString() == receivingSubnetChainId
      )

      const receivingSubnetProvider = new ethers.providers.JsonRpcProvider(
        receivingSubnet?.endpoint
      )

      if (receivingSubnet && selectedTokenSymbol) {
        if (
          (await receivingSubnetProvider.getCode(toposCoreContract.address)) ===
          '0x'
        ) {
          setLoadingReceivingSubnet(false)
          return Promise.reject(
            `ToposCore contract could not be found on ${receivingSubnet.name}!`
          )
        } else {
          const contract = toposCoreContract.connect(receivingSubnetProvider)

          const token = await contract
            .getTokenBySymbol(selectedTokenSymbol)
            .finally(() => {
              setLoadingReceivingSubnet(false)
            })

          if (!token.symbol) {
            setLoadingReceivingSubnet(false)
            return Promise.reject(
              `${selectedTokenSymbol} is not registered on ${receivingSubnet.name}!`
            )
          }
        }
      }

      setLoadingReceivingSubnet(false)
    },
    [selectedTokenSymbol, registeredSubnets]
  )

  React.useEffect(() => {
    setErrors((e) => [...e, ...getRegisteredTokensErrors])
  }, [getRegisteredTokensErrors])

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
              label="Token"
              name="token"
              extra={
                balance !== undefined
                  ? `${balance} ${selectedToken?.symbol}`
                  : null
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
                loading={getRegisteredTokensLoading}
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
                {registeredTokens.map((token) => (
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
                  validator: (_, value) => checkTokenOnReceivingSubnet(value),
                },
              ]}
            >
              <SubnetSelect
                placeholder="Select a subnet"
                loading={loadingReceivingSubnet}
                disabled={!selectedToken || loadingReceivingSubnet}
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
              <Input disabled={!selectedToken || loadingReceivingSubnet} />
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
                disabled={!selectedToken || loadingReceivingSubnet}
                addonAfter={selectedTokenSymbol}
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
            disabled={!selectedToken || loadingReceivingSubnet}
          >
            Next
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default Step1
