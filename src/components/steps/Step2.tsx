import { CheckCircleFilled } from '@ant-design/icons'
import { Avatar, List, Spin } from 'antd'
import React from 'react'

import { SubnetsContext } from '../../contexts'
import { FormsContext, StepProps } from '../MultiStepForm'
import logo from '../../logo.svg'

export default ({ onFinish }: StepProps) => {
  const { subnets } = React.useContext(SubnetsContext)
  const { form0, form1 } = React.useContext(FormsContext)
  const sendingSubnet = React.useMemo(
    () => subnets.find((s) => s.name === form0.getFieldValue('sendingSubnet')),
    [form0]
  )
  const receivingSubnet = React.useMemo(
    () =>
      subnets.find((s) => s.name === form1.getFieldValue('receivingSubnet')),
    [form1]
  )

  const progressSteps = React.useMemo(
    () => [
      {
        description: '',
        logo: sendingSubnet?.logoUrl,
        title: `${sendingSubnet?.name}: Waiting for block inclusion`,
      },
      {
        description: '',
        logo: sendingSubnet?.logoUrl,
        title: `${sendingSubnet?.name}: Waiting for certificate creation`,
      },
      {
        description: '',
        logo,
        title: 'TCE: Waiting for certificate delivery',
      },
      {
        description: '',
        logo: receivingSubnet?.logoUrl,
        title: `${receivingSubnet?.name}: Waiting for certificate validation`,
      },
      {
        description: '',
        logo: receivingSubnet?.logoUrl,
        title: `${receivingSubnet?.name}: Waiting for transaction execution`,
      },
    ],
    []
  )

  const [activeProgressState, setActiveProgressState] = React.useState(0)

  React.useEffect(function fakeProgress() {
    setInterval(() => {
      setActiveProgressState((prev) =>
        Math.min(progressSteps.length - 1, prev + 1)
      )
    }, 1500)
  }, [])

  React.useEffect(
    function fakeCompletion() {
      if (onFinish && activeProgressState === progressSteps.length - 1) {
        setTimeout(() => {
          onFinish()
        }, 1500)
      }
    },
    [activeProgressState]
  )

  return (
    <List
      itemLayout="horizontal"
      dataSource={progressSteps}
      renderItem={({ description, logo, title }, index) => (
        <List.Item style={{ opacity: index > activeProgressState ? 0.5 : 1 }}>
          <List.Item.Meta
            avatar={<Avatar src={logo} />}
            title={title}
            description={description}
          />
          {index === activeProgressState ? <Spin /> : null}
          {index < activeProgressState ? (
            <CheckCircleFilled style={{ fontSize: '1.4rem' }} />
          ) : null}
        </List.Item>
      )}
    />
  )
}
