import initTcxWasm, {
  create_keystore,
  derive_accounts,
  export_mnemonic,
  sign_tx,
} from '@consenlabs/tcx-wasm/tcx_wasm.js'

type TcxChain = 'ETHEREUM' | 'BITCOIN' | 'TRON'

interface TcxAccount {
  address: string
  chain: string
  derivationPath: string
  publicKey: string
}

interface SaferProWallet {
  address: string
  accounts: Record<string, TcxAccount>
  derivationPath: string
  keystoreJson: string
  mnemonic: string
  unlockKey: string
}

interface SignedTransfer {
  broadcastHash?: string
  signature: string
  txHash: string
}

const evmChains = new Set(['Ethereum', 'Polygon', 'Arbitrum', 'BNB Chain'])
let wasmReady: Promise<void> | null = null

function ensureTcxWasm() {
  wasmReady ??= initTcxWasm().then(() => undefined)
  return wasmReady
}

function randomHex(bytes: number) {
  const values = new Uint8Array(bytes)
  crypto.getRandomValues(values)
  return Array.from(values, (value) => value.toString(16).padStart(2, '0')).join('')
}

function chainToTcx(chain: string): TcxChain {
  if (chain === 'Bitcoin') {
    return 'BITCOIN'
  }

  if (chain === 'TRON') {
    return 'TRON'
  }

  return 'ETHEREUM'
}

function chainIdFor(chain: string) {
  switch (chain) {
    case 'Polygon':
      return '137'
    case 'Arbitrum':
      return '42161'
    case 'BNB Chain':
      return '56'
    default:
      return '11155111'
  }
}

function derivationFor(chain: string, index: number) {
  const account = Math.max(index, 0)

  switch (chainToTcx(chain)) {
    case 'BITCOIN':
      return {
        chain: 'BITCOIN',
        derivationPath: `m/84'/1'/${account}'/0/0`,
        network: 'TESTNET',
        segWit: 'VERSION_0',
      }
    case 'TRON':
      return {
        chain: 'TRON',
        derivationPath: `m/44'/195'/${account}'/0/0`,
        network: 'TESTNET',
      }
    default:
      return {
        chain: 'ETHEREUM',
        derivationPath: `m/44'/60'/${account}'/0/0`,
        chainId: chainIdFor(chain),
        network: 'TESTNET',
      }
  }
}

function parseJson<T>(value: string) {
  return JSON.parse(value) as T
}

async function createSaferProWallet(index: number): Promise<SaferProWallet> {
  await ensureTcxWasm()

  const unlockKey = `saferpro-demo-${randomHex(16)}`
  const entropy = randomHex(16)
  const keystoreJson = create_keystore(
    JSON.stringify({
      password: unlockKey,
      entropy,
      network: 'TESTNET',
    }),
  )
  const { mnemonic } = parseJson<{ mnemonic: string }>(
    export_mnemonic(
      JSON.stringify({
        keystoreJson,
        key: unlockKey,
      }),
    ),
  )
  const accounts = await deriveSaferProAccounts(keystoreJson, unlockKey, index, [
    'Ethereum',
    'Bitcoin',
    'Polygon',
    'Arbitrum',
    'BNB Chain',
  ])
  const primary = accounts.Ethereum

  return {
    address: primary?.address ?? '',
    accounts,
    derivationPath: primary?.derivationPath ?? derivationFor('Ethereum', index).derivationPath,
    keystoreJson,
    mnemonic,
    unlockKey,
  }
}

async function deriveSaferProAccounts(
  keystoreJson: string,
  unlockKey: string,
  index: number,
  chains: string[],
) {
  await ensureTcxWasm()

  const derivations = chains.map((chain) => derivationFor(chain, index))
  const accounts = parseJson<TcxAccount[]>(
    derive_accounts(
      JSON.stringify({
        keystoreJson,
        key: unlockKey,
        derivations,
      }),
    ),
  )

  return chains.reduce<Record<string, TcxAccount>>((result, chain, index) => {
    const account = accounts[index]
    if (account) {
      result[chain] = account
    }
    return result
  }, {})
}

async function deriveSaferProAddress({
  chain,
  index,
  keystoreJson,
  unlockKey,
}: {
  chain: string
  index: number
  keystoreJson: string
  unlockKey: string
}) {
  const accounts = await deriveSaferProAccounts(keystoreJson, unlockKey, index, [chain])
  return accounts[chain]
}

async function signSaferProTransfer({
  amount,
  chain,
  data,
  derivationPath,
  gasLimit,
  gasPrice,
  keystoreJson,
  nonce,
  token,
  toAddress,
  unlockKey,
  value,
}: {
  amount: string
  chain: string
  data?: string
  derivationPath: string
  gasLimit?: string
  gasPrice?: string
  keystoreJson: string
  nonce?: string
  token: string
  toAddress: string
  unlockKey: string
  value?: string
}): Promise<SignedTransfer> {
  await ensureTcxWasm()

  if (!evmChains.has(chain)) {
    throw new Error('当前原型已接入 EVM 签名；BTC/TRON 需要补充 UTXO 或 rawData 后再签名。')
  }

  const txValue =
    value ??
    (token === 'ETH' || token === 'BNB' || token === '岛币'
      ? String(Math.floor(Number(amount || 0) * 1e9))
      : '0')
  const signed = parseJson<SignedTransfer>(
    sign_tx(
      JSON.stringify({
        keystoreJson,
        key: unlockKey,
        chain: 'ETHEREUM',
        derivationPath,
        network: 'TESTNET',
        input: {
          nonce: nonce ?? '0',
          gasPrice: gasPrice ?? '20000000000',
          gasLimit: gasLimit ?? '21000',
          to: toAddress,
          value: txValue,
          chainId: chainIdFor(chain),
          ...(data ? { data } : {}),
        },
      }),
    ),
  )

  return signed
}

export {
  createSaferProWallet,
  deriveSaferProAddress,
  deriveSaferProAccounts,
  signSaferProTransfer,
  type SaferProWallet,
}


