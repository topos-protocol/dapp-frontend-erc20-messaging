import { PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, Modal } from 'antd'
import React from 'react'

import {
  DEFAULT_TOKEN_CAP,
  DEFAULT_TOKEN_DAILY_MINT_LIMIT,
  DEFAULT_TOKEN_SUPPLY,
} from '../constants/defaults'
import { ERROR, SUCCESS } from '../constants/wordings'
import { MultiStepFormContext } from '../contexts/multiStepForm'
import useRegisterToken from '../hooks/useRegisterToken'

export interface Values {
  cap: number
  dailyMintLimit: number
  name: string
  supply: number
  symbol: string
}

interface RegisterTokenFormProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const RegisterTokenForm = ({ open, setOpen }: RegisterTokenFormProps) => {
  const [loading, setLoading] = React.useState(false)
  const { registeredTokens } = React.useContext(MultiStepFormContext)
  const [form] = Form.useForm()
  const { registerToken } = useRegisterToken()

  const onCancel = React.useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return (
    <Modal
      open={open}
      title="Register a token"
      okText="Register"
      okButtonProps={{ id: 'registerButton' }}
      cancelButtonProps={{ id: 'cancelButton' }}
      confirmLoading={loading}
      zIndex={9999}
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            setLoading(true)

            registerToken(values).then(() => {
              message.success(SUCCESS.REGISTERED_TOKEN)
              setLoading(false)
              form.resetFields()
              setOpen(false)
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
              message: ERROR.MISSING_TOKEN_NAME_FOR_REGISTER,
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
              message: ERROR.MISSING_TOKEN_SYMBOL_FOR_REGISTER,
            },
            {
              validator: (_, value) => {
                const alreadyExistingTokenWithSymbol = registeredTokens?.find(
                  (t) => t.symbol === value
                )
                return alreadyExistingTokenWithSymbol
                  ? Promise.reject(ERROR.TOKEN_WITH_SYMBOL_ALREADY_EXIST)
                  : Promise.resolve()
              },
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="supply"
          initialValue={DEFAULT_TOKEN_SUPPLY}
          label="Supply"
          rules={[
            {
              required: true,
              message: ERROR.MISSING_TOKEN_SUPPLY_FOR_REGISTER,
            },
          ]}
        >
          <Input disabled={loading} type="number" />
        </Form.Item>
        <Form.Item
          name="cap"
          initialValue={DEFAULT_TOKEN_CAP}
          label="Cap"
          rules={[
            {
              required: true,
              message: ERROR.MISSING_TOKEN_CAP_FOR_REGISTER,
            },
          ]}
        >
          <Input disabled={loading} type="number" />
        </Form.Item>
        <Form.Item
          name="dailyMintLimit"
          label="Daily mint limit"
          initialValue={DEFAULT_TOKEN_DAILY_MINT_LIMIT}
          rules={[
            {
              required: true,
              message: ERROR.MISSING_TOKEN_DAILY_MINT_FOR_REGISTER,
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
        id="registerTokenButton"
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
