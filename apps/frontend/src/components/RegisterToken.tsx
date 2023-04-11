import { PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, Modal } from 'antd'
import { BigNumber, ethers } from 'ethers'
import React from 'react'
import { SubnetsContext } from '../contexts'

import { toposCoreContract } from '../contracts'
import useEthers from '../hooks/useEthers'
import { FormsContext } from './MultiStepForm'

export interface Values {
  address: string
  cap: number
  dailyMintLimit: number
  name: string
  symbol: string
}

interface RegisterTokenFormProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const RegisterTokenForm = ({ open, setOpen }: RegisterTokenFormProps) => {
  const { registeredSubnets } = React.useContext(SubnetsContext)
  const { form0 } = React.useContext(FormsContext)
  const sendingSubnet = React.useMemo(
    () =>
      registeredSubnets.find(
        (s) => s.chainId.toHexString() === form0.getFieldValue('sendingSubnet')
      ),
    [registeredSubnets, form0]
  )
  const [loading, setLoading] = React.useState(false)
  const { provider } = useEthers({ subnet: sendingSubnet, viaMetaMask: true })
  const [form] = Form.useForm()

  const contract = toposCoreContract.connect(provider.getSigner())

  const mint = React.useCallback(
    async (symbol: string, amount: BigNumber) => {
      const tx = await contract.giveToken(
        symbol,
        await provider.getSigner().getAddress(),
        amount,
        { gasLimit: 4_000_000 }
      )

      return tx
        .wait()
        .then(() => {
          message.success('The token has been successfully minted!')
        })
        .catch((error: Error) => {
          message.error('Something wrong happened!')
          console.error(error)
        })
    },
    [contract, provider]
  )

  const onRegister = React.useCallback(
    async ({
      address = '0x0000000000000000000000000000000000000000',
      cap,
      dailyMintLimit,
      name,
      symbol,
    }: Values) => {
      setLoading(true)

      const params = ethers.utils.defaultAbiCoder.encode(
        ['string', 'string', 'uint256', 'address', 'uint256'],
        [
          name,
          symbol,
          ethers.utils.parseUnits(cap.toString()),
          address,
          ethers.utils.parseUnits(dailyMintLimit.toString()),
        ]
      )

      const tx = await contract.deployToken(params)

      return tx
        .wait()
        .then(async () => {
          message.success('The token has been successfully registered!')
          await mint(symbol, ethers.utils.parseUnits('1000'))
          setOpen(false)
        })
        .catch((error: Error) => {
          message.error('Something wrong happened!')
          console.error(error)
        })
        .finally(() => {
          setLoading(false)
        })
    },
    [contract, mint, setOpen]
  )

  const onCancel = React.useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return (
    <Modal
      open={open}
      title="Register a token"
      okText="Register"
      confirmLoading={loading}
      zIndex={9999}
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            setLoading(true)

            onRegister(values).then(() => {
              setLoading(false)
              form.resetFields()
            })
          })
          .catch((info) => {
            console.log('Validate Failed:', info)
          })
      }}
    >
      <Form form={form} layout="vertical" name="form_in_modal">
        <Form.Item
          name="name"
          label="Name"
          rules={[
            {
              required: true,
              message: 'Please input the name of the token!',
            },
          ]}
        >
          <Input disabled={loading} />
        </Form.Item>
        <Form.Item
          name="symbol"
          label="Symbol"
          rules={[
            {
              required: true,
              message: 'Please input the symbol of the token!',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input disabled={loading} />
        </Form.Item>
        <Form.Item
          name="cap"
          initialValue={100_000}
          label="Cap"
          rules={[
            {
              required: true,
              message: 'Please input the cap of the token!',
            },
          ]}
        >
          <Input disabled={loading} type="number" />
        </Form.Item>
        <Form.Item
          name="dailyMintLimit"
          label="Daily mint limit"
          initialValue={10_000}
          rules={[
            {
              required: true,
              message: 'Please input the daily mint limit of the token!',
            },
          ]}
        >
          <Input disabled={loading} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

const RegisterToken = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <div>
      <Button
        icon={<PlusOutlined />}
        type="text"
        onClick={() => {
          setOpen(true)
        }}
      >
        Register your token
      </Button>
      {open && <RegisterTokenForm open={open} setOpen={setOpen} />}
    </div>
  )
}

export default RegisterToken
