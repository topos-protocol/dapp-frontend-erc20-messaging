import { Divider, Layout, Space } from 'antd'
import React from 'react'

import Header from './components/Header'
import Subnets from './components/Subnets'
import Transfer from './components/Transfer'
import { SubnetsContext } from './contexts'
import { Subnet } from './types'
import usePolkadotApi from './hooks/usePolkadotApi'

import './App.css'

const { Content } = Layout

export default () => {
  const api = usePolkadotApi('wss://wss.topos-subnet.demo.toposware.com')
  const [subnets, setSubnets] = React.useState<Subnet[]>([])
  const [receivingSubnet, setReceivingSubnet] = React.useState<Subnet>()
  const [sendingSubnet, setSendingSubnet] = React.useState<Subnet>()

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
          subnets,
          receivingSubnet,
          sendingSubnet,
          setReceivingSubnet,
          setSendingSubnet,
        }}
      >
        <Header />
        <Content
          style={{
            padding: '0 50px',
          }}
        >
          <Space align="start" wrap>
            <Transfer />
            <Subnets />
          </Space>
          <Divider />
        </Content>
      </SubnetsContext.Provider>
    </Layout>
  )
}
