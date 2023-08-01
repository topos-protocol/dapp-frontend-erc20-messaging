import { ethers } from 'ethers'
import React from 'react'
import { ErrorsContext } from '../contexts/errors'

import { subnetRegistratorContract } from '../contracts'
import { Subnet, SubnetWithId } from '../types'
import useEthers from './useEthers'

export default function useRegisteredSubnets() {
  const { setErrors } = React.useContext(ErrorsContext)
  const { provider } = useEthers()
  const [loading, setLoading] = React.useState(false)
  const [registeredSubnets, setRegisteredSubnets] =
    React.useState<SubnetWithId[]>()

  const contract = subnetRegistratorContract.connect(provider)

  const getRegisteredSubnets = React.useCallback(async () => {
    setLoading(true)

    const registeredSubnetsCount = await contract
      .getSubnetCount()
      .then((count: ethers.BigNumber) => count.toNumber())
      .catch((error: any) => {
        console.error(error)
        setErrors((e) => [
          ...e,
          `Error when fetching the count of registered subnets.`,
        ])
      })

    if (registeredSubnetsCount !== undefined) {
      const promises = []
      let i = 0
      while (i < registeredSubnetsCount) {
        const subnetId = await contract
          .getSubnetIdAtIndex(i)
          .catch((error: any) => {
            console.error(error)
            setErrors((e) => [
              ...e,
              `Error fetching the id of the registered subnet at index ${i}.`,
            ])
          })

        if (subnetId !== undefined) {
          promises.push(
            contract
              .subnets(subnetId)
              .then((subnet: Subnet) => ({
                ...subnet,
                id: subnetId,
              }))
              .catch((error: Error) => {
                console.error(error)
                setErrors((e) => [
                  ...e,
                  `Error fetching registered subnet with id ${subnetId}.`,
                ])
              })
          )
        }
        i++
      }

      const subnets = await Promise.allSettled(promises).then((values) =>
        values
          .filter((v) => v.status === 'fulfilled')
          .map((v) => (v.status === 'fulfilled' ? v.value : undefined))
          .filter((v) => v)
      )
      setRegisteredSubnets(subnets as SubnetWithId[])
    }

    setLoading(false)
  }, [])

  React.useEffect(function init() {
    getRegisteredSubnets()
  }, [])

  return { loading, registeredSubnets }
}
