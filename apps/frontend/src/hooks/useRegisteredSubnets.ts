import { ethers } from 'ethers'
import React from 'react'
import { ErrorsContext, SubnetsContext } from '../contexts'

import { subnetRegistratorContract } from '../contracts'
import { Subnet } from '../types'
import useEthers from './useEthers'

export default function useRegisteredSubnets() {
  const { setErrors } = React.useContext(ErrorsContext)
  const { provider } = useEthers()
  const [loading, setLoading] = React.useState(false)
  const [subnets, setSubnets] = React.useState<Subnet[]>()

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
      const promises: Promise<Subnet>[] = []
      let i = 0
      while (i < registeredSubnetsCount) {
        const subnetId: ethers.BytesLike = await contract
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
                subnetId,
              }))
              .catch((error: any) => {
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

      const subnets = await Promise.all(promises)
      setSubnets(subnets.filter((s) => s !== undefined))
    }

    setLoading(false)
  }, [])

  return { getRegisteredSubnets, loading, subnets }
}
