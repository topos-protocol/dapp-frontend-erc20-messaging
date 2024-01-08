import { ThemeProvider } from '@emotion/react'
import styled from '@emotion/styled'
import { ToposCore__factory } from '@topos-protocol/topos-smart-contracts/typechain-types'
import { Alert, Layout as _Layout } from 'antd'
import { JsonRpcProvider } from 'ethers'
import { useEffect, useState } from 'react'

import Footer from './components/Footer'
import Header from './components/Header'
import MultiStepForm from './components/MultiStepForm'
import { Error, ErrorsContext } from './contexts/errors'
import { SubnetsContext } from './contexts/subnets'
import useRegisteredSubnets from './hooks/useRegisteredSubnets'
import useTheme from './hooks/useTheme'
import { SubnetWithId } from './types'

const { Content: _Content } = _Layout

import 'antd/dist/reset.css'

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
  const theme = useTheme()
  const [errors, setErrors] = useState<Error[]>([])
  const [subnets, setSubnets] = useState<SubnetWithId[]>()
  const { registeredSubnets } = useRegisteredSubnets()

  useEffect(
    function onRegisteredSubnetsChange() {
      async function _() {
        if (registeredSubnets) {
          const toposSubnetEndpointHttp = import.meta.env
            .VITE_TOPOS_SUBNET_ENDPOINT_HTTP
          const toposSubnetEndpointWs = import.meta.env
            .VITE_TOPOS_SUBNET_ENDPOINT_WS
          let toposSubnet: SubnetWithId | undefined

          if (toposSubnetEndpointHttp && toposSubnetEndpointWs) {
            const provider = new JsonRpcProvider(toposSubnetEndpointHttp)
            const network = await provider.getNetwork()
            const chainId = network.chainId

            const contract = ToposCore__factory.connect(
              import.meta.env.VITE_TOPOS_CORE_PROXY_CONTRACT_ADDRESS,
              provider
            )
            const subnetId = await contract.networkSubnetId()

            toposSubnet = {
              chainId: chainId,
              endpointHttp: toposSubnetEndpointHttp,
              endpointWs: toposSubnetEndpointWs,
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
      }

      _()
    },
    [registeredSubnets]
  )

  return (
    <ThemeProvider theme={theme}>
      <ErrorsContext.Provider value={{ setErrors }}>
        <SubnetsContext.Provider
          value={{
            loading: !Boolean(subnets),
            data: subnets,
          }}
        >
          <Layout>
            <Header />
            <Errors>
              {errors.map((e, i) => (
                <Alert
                  type="error"
                  showIcon
                  closable
                  message={e.message}
                  description={e.description}
                  key={i}
                />
              ))}
            </Errors>
            <Content>
              <MultiStepForm />
            </Content>
            <Footer />
          </Layout>
        </SubnetsContext.Provider>
      </ErrorsContext.Provider>
    </ThemeProvider>
  )
}

export default App
