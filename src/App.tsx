import styled from '@emotion/styled'
import { Layout } from 'antd'
import React from 'react'

import Header from './components/Header'
import MultiStepForm from './components/MultiStepForm'
import { MOCKED_SUBNETS, SubnetsContext } from './contexts'
import { Subnet } from './types'
import usePolkadotApi from './hooks/usePolkadotApi'

import 'antd/dist/antd.dark.css'

const { Content: _Content } = Layout

const Content = styled(_Content)`
  padding: 3rem 0;
`

export default () => {
  const api = usePolkadotApi('wss://wss.topos-subnet.demo.toposware.com')
  const [subnets, setSubnets] = React.useState<Subnet[]>([])

  React.useEffect(function getSubnets() {
    api?.query.subnets.subnets.entries().then((subnets) => {
      setSubnets(
        subnets.map(([, subnet]) => subnet.toHuman() as unknown as Subnet)
      )
    })
  }, [])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SubnetsContext.Provider
        value={{
          subnets: MOCKED_SUBNETS,
        }}
      >
        <Header />
        <Content>
          <MultiStepForm />
        </Content>
      </SubnetsContext.Provider>
    </Layout>
  )
}
