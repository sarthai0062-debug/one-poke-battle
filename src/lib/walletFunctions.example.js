/**
 * Example usage of wallet interaction functions for getPoints and redeemPoints
 * 
 * This file demonstrates how to use the wallet interaction functions in your game components.
 * Copy and adapt these examples to your needs.
 */

import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction, useWallets } from '@mysten/dapp-kit'
import { getPointsForGame, redeemPointsForGame } from './blockchain'

/**
 * Example: Get Points Function
 * This function adds points to the user's balance on the blockchain
 */
export const ExampleGetPoints = () => {
  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const signAndExecuteTransaction = useSignAndExecuteTransaction()
  const wallets = useWallets()

  const handleGetPoints = async (amount = 2000) => {
    // Check if wallet is connected
    if (!account) {
      alert('Please connect your wallet first!')
      return
    }

    try {
      // Show loading state
      console.log('Requesting points from blockchain...')
      
      // Call the getPoints function
      const result = await getPointsForGame({
        account,
        suiClient,
        signAndExecute: signAndExecuteTransaction.mutate,
        wallet: wallets,
        amount: amount // Amount of points to get (default: 2000)
      })

      if (result.success) {
        console.log('✅ Points added successfully!')
        console.log('Transaction digest:', result.digest)
        // Update your UI here - refresh points display, show success message, etc.
        alert(`Successfully added ${amount} points!`)
      } else {
        console.error('❌ Failed to get points:', result.error)
        alert(`Failed to get points: ${result.error}`)
      }
    } catch (error) {
      console.error('Error getting points:', error)
      alert(`Error: ${error.message}`)
    }
  }

  return {
    handleGetPoints
  }
}

/**
 * Example: Redeem Points Function
 * This function redeems points and may give power-ups based on the amount
 * 
 * Power-up rewards:
 * - 280 points → "Aquifer Petal"
 * - 320 points → "Ember Flare Charm"
 * - 360 points → "Lunar Bloom Crest"
 * - 450 points → "Starlit Core Relic"
 * - 500 points → "Aegis Prism"
 */
export const ExampleRedeemPoints = () => {
  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const signAndExecuteTransaction = useSignAndExecuteTransaction()
  const wallets = useWallets()

  const handleRedeemPoints = async (amount) => {
    // Check if wallet is connected
    if (!account) {
      alert('Please connect your wallet first!')
      return
    }

    // Validate amount
    if (!amount || amount <= 0) {
      alert('Invalid amount. Please enter a valid amount.')
      return
    }

    try {
      // Show loading state
      console.log(`Redeeming ${amount} points...`)
      
      // Call the redeemPoints function
      const result = await redeemPointsForGame({
        account,
        suiClient,
        signAndExecute: signAndExecuteTransaction.mutate,
        wallet: wallets,
        amount: amount
      })

      if (result.success) {
        console.log('✅ Points redeemed successfully!')
        console.log('Transaction digest:', result.digest)
        
        // Check if a power-up was received
        if (result.powerUp) {
          console.log(`🎁 You received: ${result.powerUp}!`)
          alert(`Successfully redeemed ${amount} points!\n\n🎁 You received: ${result.powerUp}!`)
        } else {
          alert(`Successfully redeemed ${amount} points!`)
        }
        
        // Update your UI here - refresh points display, update inventory, etc.
      } else {
        console.error('❌ Failed to redeem points:', result.error)
        alert(`Failed to redeem points: ${result.error}`)
      }
    } catch (error) {
      console.error('Error redeeming points:', error)
      alert(`Error: ${error.message}`)
    }
  }

  return {
    handleRedeemPoints
  }
}

/**
 * Example: Complete usage in a React component
 */
export const ExampleGameComponent = () => {
  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const signAndExecuteTransaction = useSignAndExecuteTransaction()
  const wallets = useWallets()

  // Get points handler
  const handleGetPoints = async () => {
    if (!account) {
      alert('Please connect your wallet first!')
      return
    }

    try {
      const result = await getPointsForGame({
        account,
        suiClient,
        signAndExecute: signAndExecuteTransaction.mutate,
        wallet: wallets,
        amount: 2000
      })

      if (result.success) {
        console.log('Points added!', result.digest)
        // Refresh your points display here
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Redeem points handler
  const handleRedeemPoints = async (amount) => {
    if (!account) {
      alert('Please connect your wallet first!')
      return
    }

    try {
      const result = await redeemPointsForGame({
        account,
        suiClient,
        signAndExecute: signAndExecuteTransaction.mutate,
        wallet: wallets,
        amount: amount
      })

      if (result.success) {
        if (result.powerUp) {
          alert(`You received: ${result.powerUp}!`)
        }
        // Update UI here
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div>
      <button onClick={handleGetPoints}>
        Get 2000 Points
      </button>
      <button onClick={() => handleRedeemPoints(280)}>
        Redeem 280 Points (Aquifer Petal)
      </button>
      <button onClick={() => handleRedeemPoints(500)}>
        Redeem 500 Points (Aegis Prism)
      </button>
    </div>
  )
}

