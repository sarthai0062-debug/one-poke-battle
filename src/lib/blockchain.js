import { Transaction } from '@mysten/sui/transactions'
import { getFullnodeUrl } from '@mysten/sui/client'

// Contract configuration
const PACKAGE_ID = '0x7f1212e08fcfe293b7299f1e5c0ccc2c6dafd9552d9e9c3bbd407934133748a3'
const SHARED_OBJECT_ID = '0x80137994fcd221d2497df286dec9f7d316b19ea6a709c7f7aeeaafcd8d36fd53'
const INITIAL_SHARED_VERSION = 3304

/**
 * Prepare transaction with gas payment for wallets (especially Enoki/zkLogin)
 * This ensures the transaction has gas payment set up correctly
 * Based on working implementation from onechain-anime-vault-update
 */
export const prepareTransactionForEnoki = async (tx, suiClient, senderAddress, wallet) => {
  try {
    // Set gas budget (required for transaction to be signable)
    // Based on working transactions, use a reasonable budget
    tx.setGasBudget(25000000) // 25M MIST - similar to working transactions
    
    // Get gas coins for the sender - try OCT first (OneChain native token)
    // Get all coins and use the one with highest balance
    const coins = await suiClient.getCoins({
      owner: senderAddress,
      coinType: '0x2::oct::OCT' // OCT coin type for OneChain
    })

    if (coins.data && coins.data.length > 0) {
      // Sort by balance and use the coin with highest balance
      const sortedCoins = coins.data.sort((a, b) => {
        const balanceA = BigInt(a.balance || '0')
        const balanceB = BigInt(b.balance || '0')
        return balanceB > balanceA ? 1 : -1
      })
      
      const gasCoin = sortedCoins[0]
      
      // Get the latest version of the coin object
      const coinObject = await suiClient.getObject({
        id: gasCoin.coinObjectId,
        options: { showContent: true }
      })
      
      if (coinObject.data) {
        // Use the latest version from the object
        tx.setGasPayment([{
          objectId: gasCoin.coinObjectId,
          version: coinObject.data.version,
          digest: coinObject.data.digest
        }])
        console.log('Gas payment set with OCT coin:', gasCoin.coinObjectId, 'Version:', coinObject.data.version)
        return true
      } else {
        // Fallback to coin version
        tx.setGasPayment([{
          objectId: gasCoin.coinObjectId,
          version: gasCoin.version,
          digest: gasCoin.digest
        }])
        console.log('Gas payment set with OCT coin (fallback):', gasCoin.coinObjectId)
        return true
      }
    } else {
      // Try with SUI if OCT not available (fallback)
      const suiCoins = await suiClient.getCoins({
        owner: senderAddress,
        coinType: '0x2::sui::SUI'
      })
      
      if (suiCoins.data && suiCoins.data.length > 0) {
        const sortedCoins = suiCoins.data.sort((a, b) => {
          const balanceA = BigInt(a.balance || '0')
          const balanceB = BigInt(b.balance || '0')
          return balanceB > balanceA ? 1 : -1
        })
        
        const gasCoin = sortedCoins[0]
        const coinObject = await suiClient.getObject({
          id: gasCoin.coinObjectId,
          options: { showContent: true }
        })
        
        if (coinObject.data) {
          tx.setGasPayment([{
            objectId: gasCoin.coinObjectId,
            version: coinObject.data.version,
            digest: coinObject.data.digest
          }])
          console.log('Gas payment set with SUI coin:', gasCoin.coinObjectId, 'Version:', coinObject.data.version)
          return true
        } else {
          tx.setGasPayment([{
            objectId: gasCoin.coinObjectId,
            version: gasCoin.version,
            digest: gasCoin.digest
          }])
          console.log('Gas payment set with SUI coin (fallback):', gasCoin.coinObjectId)
          return true
        }
      } else {
        console.warn('No gas coins found. Wallet will need to select gas payment manually.')
        return false
      }
    }
  } catch (error) {
    console.warn('Could not set gas payment automatically:', error)
    // Still set budget - wallet will handle gas selection
    try {
      tx.setGasBudget(25000000)
    } catch (e) {
      console.warn('Could not set gas budget:', e)
    }
    return false
  }
}

/**
 * Check if wallet is Enoki wallet
 */
export const isEnokiWallet = (wallet) => {
  return wallet?.name?.toLowerCase().includes('enoki') || wallet?.name?.toLowerCase().includes('zklogin')
}

/**
 * Check if error is epoch expiration error for Enoki wallets
 */
export const isEpochExpirationError = (error) => {
  const errorMessage = error?.message || error?.toString() || ''
  return errorMessage.includes('epoch') || errorMessage.includes('expired') || errorMessage.includes('session')
}

/**
 * Get epoch expiration error message
 */
export const getEpochExpirationMessage = (error) => {
  return 'Your zkLogin session has expired. Please disconnect and reconnect your wallet.'
}

/**
 * Get points from the blockchain
 * @param {Object} params - Transaction parameters
 * @param {Object} params.account - Current account from useCurrentAccount()
 * @param {Object} params.suiClient - Sui client from useSuiClient()
 * @param {Function} params.signAndExecute - Sign and execute function from useSignAndExecuteTransaction()
 * @param {Object} params.wallet - Wallet object from useWallets()
 * @param {number} amount - Amount of points to get (default: 2000)
 */
export const getPoints = async ({ account, suiClient, signAndExecute, wallet, amount = 2000 }) => {
  if (!account) {
    console.log('No account connected')
    return
  }

  const tx = new Transaction()
  tx.setSender(account.address)
  const packageId = PACKAGE_ID

  tx.moveCall({
    package: packageId,
    module: 'pokemongame',
    function: 'get_points',
    arguments: [
      tx.sharedObjectRef({
        objectId: SHARED_OBJECT_ID,
        mutable: true,
        initialSharedVersion: INITIAL_SHARED_VERSION
      }),
      tx.pure.u256(amount)
    ]
  })

  // Prepare transaction for Enoki wallets (set OCT gas payment if needed)
  await prepareTransactionForEnoki(tx, suiClient, account.address, wallet?.currentWallet || null)

  console.log('Processing Transaction')

  signAndExecute(
    {
      transaction: tx
    },
    {
      onError: (e) => {
        console.log('Tx Failed! from here')
        console.log(e)

        // Check if it's an epoch expiration error for Enoki wallets
        if (isEpochExpirationError(e) && wallet?.currentWallet && isEnokiWallet(wallet.currentWallet)) {
          const errorMessage = getEpochExpirationMessage(e)
          console.error('Enoki Session Expired:', errorMessage)
          alert(
            '⚠️ Your zkLogin session has expired!\n\n' +
            errorMessage + '\n\n' +
            'Please disconnect and reconnect your wallet to continue.'
          )
        }
      },
      onSuccess: async ({ digest }) => {
        let p = await suiClient.waitForTransaction({
          digest,
          options: {
            showEffects: true
          }
        })
        console.log('Transaction Result:', p)
        console.log('tx digest:', digest)
        console.log('Tx Successful!')
      }
    }
  )
}

/**
 * Redeem points on the blockchain
 * @param {Object} params - Transaction parameters
 * @param {Object} params.account - Current account from useCurrentAccount()
 * @param {Object} params.suiClient - Sui client from useSuiClient()
 * @param {Function} params.signAndExecute - Sign and execute function from useSignAndExecuteTransaction()
 * @param {Object} params.wallet - Wallet object from useWallets()
 * @param {number} amount - Amount of points to redeem
 * 
 * Note: When redeeming points, the contract automatically creates UserPowerUps objects:
 * - 280 points → "Aquifer Petal"
 * - 320 points → "Ember Flare Charm"
 * - 360 points → "Lunar Bloom Crest"
 * - 450 points → "Starlit Core Relic"
 * - 500 points → "Aegis Prism"
 */
export const redeemPoints = async ({ account, suiClient, signAndExecute, wallet, amount }) => {
  if (!account) {
    console.log('No account connected')
    return
  }

  const tx = new Transaction()
  tx.setSender(account.address)
  const packageId = PACKAGE_ID

  // public fun reedem_points(userPts:&mut UserPoints, amount:u256, ctx: &mut TxContext) {
  tx.moveCall({
    package: packageId,
    module: 'pokemongame',
    function: 'reedem_points',
    arguments: [
      tx.sharedObjectRef({
        objectId: SHARED_OBJECT_ID,
        mutable: true,
        initialSharedVersion: INITIAL_SHARED_VERSION
      }),
      tx.pure.u256(amount)
    ]
  })

  // Prepare transaction for Enoki wallets (set OCT gas payment if needed)
  await prepareTransactionForEnoki(tx, suiClient, account.address, wallet?.currentWallet || null)

  console.log('Processing Transaction')

  signAndExecute(
    {
      transaction: tx
    },
    {
      onError: (e) => {
        console.log('Tx Failed! from here')
        console.log(e)

        // Check if it's an epoch expiration error for Enoki wallets
        if (isEpochExpirationError(e) && wallet?.currentWallet && isEnokiWallet(wallet.currentWallet)) {
          const errorMessage = getEpochExpirationMessage(e)
          console.error('Enoki Session Expired:', errorMessage)
          alert(
            '⚠️ Your zkLogin session has expired!\n\n' +
            errorMessage + '\n\n' +
            'Please disconnect and reconnect your wallet to continue.'
          )
        }
      },
      onSuccess: async ({ digest }) => {
        let p = await suiClient.waitForTransaction({
          digest,
          options: {
            showEffects: true
          }
        })
        console.log('Transaction Result:', p)
        console.log('tx digest:', digest)
        console.log('Tx Successful!')
      }
    }
  )
}

/**
 * Get user points from the blockchain (read-only)
 * @param {Object} params - Query parameters
 * @param {Object} params.suiClient - Sui client from useSuiClient()
 * @param {string} address - User address to query
 * @returns {Promise<number>} User's point balance
 */
export const getUserPoints = async ({ suiClient, address }) => {
  if (!suiClient || !address) {
    throw new Error('Sui client and address are required')
  }

  try {
    // Read the shared object to get user points
    const sharedObject = await suiClient.getObject({
      id: SHARED_OBJECT_ID,
      options: {
        showContent: true
      }
    })

    // Note: The actual implementation would need to call a view function
    // Since get_user_points is a view function, we'd need to use a different approach
    // For now, this is a placeholder - you may need to implement a view function call
    // or use a different method to read from the shared object
    
    console.log('Shared object data:', sharedObject)
    // TODO: Implement actual point reading logic based on the contract's get_user_points function
    return 0
  } catch (error) {
    console.error('Error getting user points:', error)
    throw error
  }
}


