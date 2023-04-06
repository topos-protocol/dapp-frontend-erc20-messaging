import { Button, Form } from 'antd'
import React from 'react'

import { SubnetsContext } from '../../contexts'
import { FormsContext, StepProps } from '../MultiStepForm'
import SubnetSelector from '../SubnetSelect'
import useEthers from '../../hooks/useEthers'
import useRegisteredSubnets from '../../hooks/useRegisteredSubnets'

const Step0 = ({ onFinish }: StepProps) => {
  const { getRegisteredSubnets, loading, subnets } = useRegisteredSubnets()
  const { registeredSubnets, setRegisteredSubnets } =
    React.useContext(SubnetsContext)
  const { form0 } = React.useContext(FormsContext)

  const sendingSubnetChainId = Form.useWatch('sendingSubnet', form0)
  const sendingSubnet = React.useMemo(
    () =>
      registeredSubnets.find(
        (s) => s.chainId.toHexString() === sendingSubnetChainId
      ),
    [sendingSubnetChainId, registeredSubnets]
  )

  useEthers({
    subnet: sendingSubnet,
    viaMetaMask: sendingSubnet !== undefined,
  })

  React.useEffect(
    function getSubnets() {
      getRegisteredSubnets()
    },
    [getRegisteredSubnets]
  )

  React.useEffect(
    function setSubnetsInContext() {
      if (subnets) {
        setRegisteredSubnets(subnets)
      }
    },
    [subnets]
  )

  return (
    <Form form={form0} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Sending subnet"
        name="sendingSubnet"
        rules={[
          {
            required: true,
            message: 'Please select a sending subnet!',
          },
        ]}
      >
        <SubnetSelector
          loading={loading}
          size="large"
          subnets={registeredSubnets}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Nextt
        </Button>
      </Form.Item>
    </Form>
  )
}

export default Step0
