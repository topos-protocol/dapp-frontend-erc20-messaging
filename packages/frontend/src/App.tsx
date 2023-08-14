import styled from '@emotion/styled'
import { Alert, ConfigProvider, Layout as _Layout, theme } from 'antd'
import { BigNumber, ethers } from 'ethers'
import React, { useEffect, useState } from 'react'

import Header from './components/Header'
import MultiStepForm from './components/MultiStepForm'
import { ErrorsContext } from './contexts/errors'
import { SubnetsContext } from './contexts/subnets'

import 'antd/dist/reset.css'
import useRegisteredSubnets from './hooks/useRegisteredSubnets'
import { toposCoreContract } from './contracts'
import { SubnetWithId } from './types'
import { sanitizeURLProtocol } from './utils'

const { Content: _Content } = _Layout

const Errors = styled.div`
  margin: 1rem auto;
  width: 80%;
  max-width: 800px;
  z-index: 99999;
`

const Layout = styled(_Layout)`
  min-height: 100vh;
`

const Content = styled(_Content)`
  padding: 3rem 0;
`

const App = () => {
  const [errors, setErrors] = useState<string[]>([])
  const [subnets, setSubnets] = useState<SubnetWithId[]>()
  const { loading, registeredSubnets } = useRegisteredSubnets()

  useEffect(
    function onRegisteredSubnetsChange() {
      async function _() {
        const toposSubnetEndpoint = import.meta.env.VITE_TOPOS_SUBNET_ENDPOINT
        let toposSubnet: SubnetWithId | undefined

        if (toposSubnetEndpoint) {
          const provider = new ethers.providers.JsonRpcProvider(
            sanitizeURLProtocol('http', toposSubnetEndpoint)
          )
          const network = await provider.getNetwork()
          const chainId = network.chainId

          const contract = toposCoreContract.connect(provider)
          const subnetId = await contract.networkSubnetId()

          toposSubnet = {
            chainId: BigNumber.from(chainId.toString()),
            endpoint: toposSubnetEndpoint,
            currencySymbol: 'TOPOS',
            id: subnetId,
            logoURL: '/logo.svg',
            name: 'Topos',
          }
        }

        setSubnets(
          toposSubnet
            ? [toposSubnet, ...(registeredSubnets || [])]
            : registeredSubnets
        )
      }

      _()
    },
    [registeredSubnets]
  )

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        components: {
          Layout: {
            colorBgHeader: 'transparent',
          },
        },
      }}
    >
      <ErrorsContext.Provider value={{ setErrors }}>
        <SubnetsContext.Provider
          value={{
            loading,
            data: subnets,
          }}
        >
          <Layout>
            <Header />
            <Errors>
              {errors.map((e) => (
                <Alert type="error" showIcon closable message={e} key={e} />
              ))}
            </Errors>
            <Content>
              <MultiStepForm />
            </Content>
          </Layout>
        </SubnetsContext.Provider>
      </ErrorsContext.Provider>
    </ConfigProvider>
  )
}

export default App
