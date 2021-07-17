import { useMemo } from 'react'
import keyring from '@polkadot/ui-keyring'
import { ContractPromise as Contract } from '@polkadot/api-contract'

import { useSubstrate } from './substrate-lib'

export default function useContract(address) {
  const { api } = useSubstrate()

  return useMemo(() => {
    if (!address) {
      return null
    }

    try {
      const pair = keyring.getAddress(address, 'contract')

      if (!pair) {
        throw new Error()
      }

      const data = pair?.meta.contract?.abi

      return data ? new Contract(api, data, address) : null
    } catch (error) {
      return null
    }
  }, [address, api])
}
