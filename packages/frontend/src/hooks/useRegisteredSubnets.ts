import { SubnetRegistrator__factory } from '@topos-protocol/topos-smart-contracts/typechain-types'
import {} from 'ethers'
import { useContext, useEffect, useState } from 'react'

import { ErrorsContext } from '../contexts/errors'
import { SubnetWithId } from '../types'
import useEthers from './useEthers'

export default function useRegisteredSubnets() {
  const { setErrors } = useContext(ErrorsContext)
  console.log('useEthers from useRegisteredSubnets')
  const { provider } = useEthers()
  const [loading, setLoading] = useState(false)
  const [registeredSubnets, setRegisteredSubnets] = useState<SubnetWithId[]>()

  useEffect(
    function getRegisteredSubnets() {
      async function _() {
        setLoading(true)

        const subnetRegistrator = SubnetRegistrator__factory.connect(
          import.meta.env.VITE_SUBNET_REGISTRATOR_CONTRACT_ADDRESS,
          provider
        )

        const registeredSubnetsCount = await subnetRegistrator
          .getSubnetCount()
          .then((count) => Number(count))
          .catch((error: any) => {
            console.error(error)
            setErrors((e) => [
              ...e,
              {
                message: `Error when fetching the count of registered subnets.`,
              },
            ])
          })

        if (registeredSubnetsCount !== undefined) {
          const promises = []
          let i = 0
          while (i < registeredSubnetsCount) {
            const subnetId = await subnetRegistrator
              .getSubnetIdAtIndex(i)
              .catch((error: any) => {
                console.error(error)
                setErrors((e) => [
                  ...e,
                  {
                    message: `Error fetching the id of the registered subnet at index ${i}.`,
                  },
                ])
              })

            if (subnetId !== undefined) {
              promises.push(
                subnetRegistrator
                  .subnets(subnetId)
                  .then((subnet) => ({
                    ...(subnet as any).toObject(), // toObject method of ES6 Proxy
                    id: subnetId,
                  }))
                  .catch((error: Error) => {
                    console.error(error)
                    setErrors((e) => [
                      ...e,
                      {
                        message: `Error fetching registered subnet with id ${subnetId}.`,
                      },
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
              .filter((v) => v && v.name === 'Incal')
          )
          setRegisteredSubnets(subnets as SubnetWithId[])
        }

        setLoading(false)
      }

      _()
    },
    [provider]
  )

  return { loading, registeredSubnets }
}
