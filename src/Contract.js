import React, { useEffect, useState, useCallback } from 'react'
import { Grid, Button, Card } from 'semantic-ui-react'
import { ContractPromise as Contract } from '@polkadot/api-contract'

import { useSubstrate } from './substrate-lib'

import contractABI from './contract.json'
const CONTRACT_ADDRESS = '5HXaG7Zefi4xAqvvEyPxrrcHwmiRvmH2MNyMnoZEaX41nDEu'
const BOB_ADDRESS = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty' // Bob Address

function Main(props) {
  const { accountPair } = props
  const signer = accountPair
  const from = accountPair.address
  const target = from

  const { api } = useSubstrate()

  const [queryResult, setQueryResult] = useState('')
  const [txResult, setTxResult] = useState(null)

  const contract = new Contract(api, contractABI, CONTRACT_ADDRESS)
  const contractName = contract.abi.json.contract.name

  // console.log('contract: ', contract)

  useEffect(() => {
    _onContractQuery()
  }, [accountPair])

  const _onContractQuery = async () => {
    const balanceOfQuery = await contract.query.balanceOf(from, { value: 0, gasLimit: -1 }, target)
    const balanceOf = balanceOfQuery.output.toHuman()
    setQueryResult(balanceOf)
  }

  const _onContractTx = async () => {
    const value = 0
    const gasLimit = -1
    const receiver = BOB_ADDRESS
    const amount = 10000

    await contract.tx.transfer({ value, gasLimit }, receiver, amount).signAndSend(signer, (result) => {
      if (result.status.isInBlock) {
        console.log('in a block')
        // console.log('events', result.contractEvents)

        const e = result.contractEvents[0]

        const txResult = {
          id: e.event.identifier,
          from: e.args[0].toHuman(),
          to: e.args[1].toHuman(),
          value: e.args[2].toHuman(),
        }

        setTxResult(txResult)
        _onContractQuery()
      } else if (result.status.isFinalized) {
        console.log('finalized')
      }
    })
  }

  return (
    <Grid.Column>
      <Card>
        <Card.Content>
          <Card.Header>Contracts</Card.Header>
          <Card.Meta>{contractName}</Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <Button onClick={_onContractQuery}>Call</Button>
          <h3>BalanceOf: {queryResult}</h3>
        </Card.Content>
        <Card.Content extra>
          <Button onClick={_onContractTx}>TX transfer</Button>
          <h3>Event:</h3>
          {txResult && (
            <>
              <p>
                <b>id: </b>
                {txResult.id}
              </p>
              <p>
                <b>from: </b>
                {txResult.from}
              </p>
              <p>
                <b>to: </b>
                {txResult.to}
              </p>
              <p>
                <b>value: </b>
                {txResult.value}
              </p>
            </>
          )}
        </Card.Content>
      </Card>
    </Grid.Column>
  )
}

export default function ContractModule(props) {
  return props.accountPair && props.accountPair.address ? <Main {...props} /> : null
}
