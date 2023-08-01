import { Button, Spin } from 'antd'
import { useMetaMask } from 'metamask-react'
import React from 'react'

import TestId from '../util/testId'

const MetaMask = () => {
  const { status, connect, account } = useMetaMask()
  const [loading, setLoading] = React.useState(true)
  const [savedAccount, setSavedAccount] = React.useState<string>()

  React.useEffect(() => {
    if (account) {
      if (!savedAccount) {
        setSavedAccount(account)
      } else if (savedAccount !== account) {
        window.location.reload()
      }
    }
  }, [account, savedAccount])

  React.useEffect(function initLoad() {
    const id = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => {
      window.clearTimeout(id)
    }
  }, [])

  const renderedStatus = React.useMemo(() => {
    switch (status) {
      case 'initializing':
        return <div>Synchronisation with MetaMask ongoing...</div>

      case 'unavailable':
        return <div>Please install MetaMask</div>

      case 'notConnected':
        return (
          <Button
            onClick={connect}
            id="connectButton"
            data-testid={TestId.METAMASK_CONNECT_BUTTON}
          >
            Connect to MetaMask
          </Button>
        )

      case 'connecting':
        return <div>Connecting...</div>

      case 'connected':
        return (
          <div id="account" data-testid={TestId.METAMASK_CONNECTED}>
            {account}
          </div>
        )

      default:
        return null
    }
  }, [status, account, connect])

  return <>{loading ? <Spin /> : <>{renderedStatus}</>}</>
}

export default MetaMask
