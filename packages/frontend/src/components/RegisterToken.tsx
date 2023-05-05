import { PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, Modal } from 'antd'
import React from 'react'

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
              message.success('The token has been successfully registered!')
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
        <Form.Item
          name="supply"
          initialValue={1_000}
          label="Supply"
          rules={[
            {
              required: true,
              message: 'Please input the supply of the token!',
            },
          ]}
        >
          <Input disabled={loading} type="number" />
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
