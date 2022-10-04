import { Button, Card, Form, Input, message, Modal, Space } from 'antd'
import { useMetaMask } from 'metamask-react'
import React from 'react'
import { Observable } from 'rxjs'

import TestId from '../util/testid'

interface Values {
  amount: number
  destinationAddress: string
}

interface TransferFormProps {
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  onSend: (values: Values) => Observable<string>
  onCancel: () => void
}

const TransferForm: React.FC<TransferFormProps> = ({
  visible,
  setVisible,
  onSend,
  onCancel,
}) => {
  const [disabled, setDisabled] = React.useState(false)
  const [form] = Form.useForm()

  return (
    <Modal
      visible={visible}
      title="Transfer an amount to an account"
      okText="Send"
      okButtonProps={{ disabled }}
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            message.loading({
              content: 'Sending the transfer',
              duration: 0,
              key: 'loader',
            })
            setDisabled(true)

            onSend(values).subscribe({
              next: () => {
                message.destroy('loader')
                message.success('The transfer was successfully processed')
                setVisible(false)
                setDisabled(false)
                form.resetFields()
              },
              error: (error) => {
                message.destroy('loader')
                message.error(error.message)
                setDisabled(false)
              },
            })
          })
          .catch((info) => {
            console.log('Validate Failed:', info)
          })
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{
          modifier: 'public',
        }}
      >
        <Form.Item
          name="destinationAddress"
          label="Destination address"
          rules={[
            {
              required: true,
              message: 'Please input the destination address',
            },
          ]}
        >
          <Input data-testid={TestId.TRANSFER_ADDRESS_INPUT} />
        </Form.Item>
        <Form.Item
          name="amount"
          label="Amount"
          help="Unit"
          rules={[
            {
              required: true,
              message: 'Please input the amount to transfer',
            },
          ]}
        >
          <Input data-testid={TestId.TRANSFER_AMOUNT_INPUT} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default () => {
  const { account } = useMetaMask()
  const [visible, setVisible] = React.useState(false)

  const onSend = React.useCallback(
    ({ amount, destinationAddress }: Values) => {
      return new Observable<string>()
    },
    [account]
  )

  return (
    <Card title="Transfer">
      <Space direction="vertical">
        <Button
          type="primary"
          data-testid={TestId.TRANSFER_BUTTON}
          onClick={() => {
            setVisible(true)
          }}
        >
          Make a transfer
        </Button>
        <TransferForm
          visible={visible}
          setVisible={setVisible}
          onSend={onSend}
          onCancel={() => {
            setVisible(false)
          }}
        />
      </Space>
    </Card>
  )
}
