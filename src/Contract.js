import React, { useEffect, useState, useCallback } from 'react'
import { Grid, Button, Card } from 'semantic-ui-react'
import { ContractPromise as Contract } from '@polkadot/api-contract'

import { useSubstrate } from './substrate-lib'

import contractABI from './contract.json'
const ABI_ADDRESS = '5G5P2p1RaETBNDgo3TZ74nSi8SBZByrYZxYMxLMEqLY4Ev8Z'

function Main(props) {
  const { accountPair } = props
  const from = accountPair.address
  const target = from

  const { api } = useSubstrate()
  const [outcome, setOutcome] = useState("")

  const contract = new Contract(api, contractABI, ABI_ADDRESS)
  const contractName = contract.abi.json.contract.name

  // console.log('contract: ', contract)

  const _onContractCall = useCallback(async () => {
    const balanceOfQuery = await contract.query.balanceOf(from, { value: 0, gasLimit: -1 }, target)
    const balanceOf = balanceOfQuery.output.toHuman()
    setOutcome(balanceOf)
  }, [contract])

  return (
    <Grid.Column width={8}>
      <Card>
        <Card.Content>
          <Card.Header>Contracts</Card.Header>
          <Card.Meta>{contractName}</Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <Button onClick={_onContractCall}>Call</Button>
          <h3>BalanceOf: {outcome}</h3>
        </Card.Content>
      </Card>
    </Grid.Column>
  )
}

export default function ContractModule(props) {
  return props.accountPair && props.accountPair.address ? <Main {...props} /> : null
}
