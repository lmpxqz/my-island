const bnbRpcEndpoints = [
  'https://bsc-dataseed.bnbchain.org',
  'https://bsc-dataseed-public.bnbchain.org',
  'https://bsc-rpc.publicnode.com',
]

const bnbTokens = {
  BNB: { decimals: 18, native: true, symbol: 'BNB' },
  USDC: {
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    decimals: 18,
    symbol: 'USDC',
  },
  USDT: {
    address: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    symbol: 'USDT',
  },
} as const

type BnbTokenSymbol = keyof typeof bnbTokens

interface RpcSuccess<T> {
  result: T
}

interface RpcError {
  error: {
    code: number
    message: string
  }
}

function assertBnbToken(token: string): BnbTokenSymbol {
  return token in bnbTokens ? (token as BnbTokenSymbol) : 'BNB'
}

async function bnbRpc<T>(method: string, params: unknown[] = []): Promise<T> {
  let lastError: unknown

  for (const endpoint of bnbRpcEndpoints) {
    try {
      const response = await fetch(endpoint, {
        body: JSON.stringify({
          id: Date.now(),
          jsonrpc: '2.0',
          method,
          params,
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      const payload = (await response.json()) as RpcSuccess<T> | RpcError

      if ('error' in payload) {
        throw new Error(payload.error.message)
      }

      return payload.result
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('BNB Chain RPC 请求失败')
}

function hexToBigInt(value: string) {
  return BigInt(value || '0x0')
}

function decimalToUnits(value: string, decimals: number) {
  const [whole = '0', fraction = ''] = value.trim().split('.')
  const normalizedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole || '0') * 10n ** BigInt(decimals) + BigInt(normalizedFraction || '0')
}

function formatUnits(value: bigint, decimals: number, precision = 4) {
  const divisor = 10n ** BigInt(decimals)
  const whole = value / divisor
  const fraction = value % divisor
  const fractionText = fraction.toString().padStart(decimals, '0').slice(0, precision)
  const trimmedFraction = fractionText.replace(/0+$/, '')
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole.toString()
}

function encodeBep20Transfer(toAddress: string, amount: string, decimals: number) {
  const selector = 'a9059cbb'
  const to = toAddress.toLowerCase().replace(/^0x/, '').padStart(64, '0')
  const value = decimalToUnits(amount, decimals).toString(16).padStart(64, '0')
  return `0x${selector}${to}${value}`
}

async function getBnbNativeBalance(address: string) {
  const balance = hexToBigInt(await bnbRpc<string>('eth_getBalance', [address, 'latest']))
  return {
    raw: balance.toString(),
    value: formatUnits(balance, 18, 8),
  }
}

async function getBep20Balance(address: string, token: Exclude<BnbTokenSymbol, 'BNB'>) {
  const contract = bnbTokens[token].address
  const callData = `0x70a08231${address.toLowerCase().replace(/^0x/, '').padStart(64, '0')}`
  const balance = hexToBigInt(
    await bnbRpc<string>('eth_call', [{ data: callData, to: contract }, 'latest']),
  )

  return {
    raw: balance.toString(),
    value: formatUnits(balance, bnbTokens[token].decimals),
  }
}

async function getBnbAccountSnapshot(address: string) {
  const [bnb, usdt, usdc] = await Promise.all([
    getBnbNativeBalance(address),
    getBep20Balance(address, 'USDT'),
    getBep20Balance(address, 'USDC'),
  ])

  return { bnb, usdc, usdt }
}

async function getBnbTxParams(address: string, token: string, toAddress: string, amount: string) {
  const selected = assertBnbToken(token)
  const nonce = hexToBigInt(await bnbRpc<string>('eth_getTransactionCount', [address, 'pending']))
  const gasPrice = hexToBigInt(await bnbRpc<string>('eth_gasPrice'))

  if (selected === 'BNB') {
    const value = decimalToUnits(amount, 18)
    return {
      data: '0x',
      gasLimit: '21000',
      gasPrice: gasPrice.toString(),
      nonce: nonce.toString(),
      to: toAddress,
      value: value.toString(),
    }
  }

  const tokenInfo = bnbTokens[selected]
  const data = encodeBep20Transfer(toAddress, amount, tokenInfo.decimals)
  let gasLimit = '65000'

  try {
    const estimated = hexToBigInt(
      await bnbRpc<string>('eth_estimateGas', [{ data, from: address, to: tokenInfo.address }]),
    )
    gasLimit = ((estimated * 12n) / 10n).toString()
  } catch {
    gasLimit = '65000'
  }

  return {
    data,
    gasLimit,
    gasPrice: gasPrice.toString(),
    nonce: nonce.toString(),
    to: tokenInfo.address,
    value: '0',
  }
}

async function broadcastBnbRawTransaction(rawTransaction: string) {
  const normalized = rawTransaction.startsWith('0x') ? rawTransaction : `0x${rawTransaction}`
  return bnbRpc<string>('eth_sendRawTransaction', [normalized])
}

export {
  bnbTokens,
  broadcastBnbRawTransaction,
  getBnbAccountSnapshot,
  getBnbTxParams,
  type BnbTokenSymbol,
}
