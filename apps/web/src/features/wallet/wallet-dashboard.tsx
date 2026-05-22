import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from 'react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import oceanPageBg from '../../assets/coin-islands/backgrounds/ocean-page-bg.png'
import oceanWorldMap from '../../assets/coin-islands/backgrounds/ocean-world-map.jpg'
import islandDetailCamp from '../../assets/coin-islands/details/island-detail-camp.jpg'
import islandDetailCitadel from '../../assets/coin-islands/details/island-detail-citadel.jpg'
import islandDetailVillage from '../../assets/coin-islands/details/island-detail-village.jpg'
import christmasSkin1 from '../../assets/coin-islands/skins/christmas-1.png'
import christmasSkin2 from '../../assets/coin-islands/skins/christmas-2.png'
import christmasSkin3 from '../../assets/coin-islands/skins/christmas-3.png'
import easterSkin1 from '../../assets/coin-islands/skins/easter-1.png'
import easterSkin2 from '../../assets/coin-islands/skins/easter-2.png'
import easterSkin3 from '../../assets/coin-islands/skins/easter-3.png'
import halloweenSkin1 from '../../assets/coin-islands/skins/halloween-1.png'
import halloweenSkin2 from '../../assets/coin-islands/skins/halloween-2.png'
import halloweenSkin3 from '../../assets/coin-islands/skins/halloween-3.png'
import lanternSkin1 from '../../assets/coin-islands/skins/lantern-1.png'
import lanternSkin2 from '../../assets/coin-islands/skins/lantern-2.png'
import lanternSkin3 from '../../assets/coin-islands/skins/lantern-3.png'
import midAutumnSkin1 from '../../assets/coin-islands/skins/mid-autumn-1.png'
import midAutumnSkin2 from '../../assets/coin-islands/skins/mid-autumn-2.png'
import midAutumnSkin3 from '../../assets/coin-islands/skins/mid-autumn-3.png'
import springSkin1 from '../../assets/coin-islands/skins/spring-1.png'
import springSkin2 from '../../assets/coin-islands/skins/spring-2.png'
import springSkin3 from '../../assets/coin-islands/skins/spring-3.png'
import valentineSkin1 from '../../assets/coin-islands/skins/valentine-1.png'
import valentineSkin2 from '../../assets/coin-islands/skins/valentine-2.png'
import valentineSkin3 from '../../assets/coin-islands/skins/valentine-3.png'
import avatarNav from '../../assets/coin-islands/sprites/avatar-nav.png'
import boatBlue from '../../assets/coin-islands/sprites/boat-blue-sail.png'
import boatGreen from '../../assets/coin-islands/sprites/boat-green-sail.png'
import boatOrange from '../../assets/coin-islands/sprites/boat-orange-sail.png'
import boatPurple from '../../assets/coin-islands/sprites/boat-purple-sail.png'
import compass from '../../assets/coin-islands/sprites/compass.png'
import dockIslandAction from '../../assets/coin-islands/sprites/dock-island-action.png'
import islandCamp from '../../assets/coin-islands/sprites/island-lv1-camp.png'
import islandCitadel from '../../assets/coin-islands/sprites/island-lv3-citadel.png'
import islandReef from '../../assets/coin-islands/sprites/island-lv0-reef.png'
import islandVillage from '../../assets/coin-islands/sprites/island-lv2-village.png'
import routeScrollNav from '../../assets/coin-islands/sprites/route-scroll-nav.png'
import sailboatAction from '../../assets/coin-islands/sprites/sailboat-action.png'
import scrollPanel from '../../assets/coin-islands/ui/scroll-panel-cutout.png'
import shieldNav from '../../assets/coin-islands/sprites/shield-nav.png'
import treasureChestNav from '../../assets/coin-islands/sprites/treasure-chest-nav.png'
import rainCloudsWeather from '../../assets/coin-islands/weather/rain-clouds.png'
import stormLightningWeather from '../../assets/coin-islands/weather/storm-lightning.png'
import sunCloudsWeather from '../../assets/coin-islands/weather/sun-clouds.png'
import {
  createSaferProWallet,
  deriveSaferProAddress,
  signSaferProTransfer,
  type SaferProWallet,
} from './services/saferpro-tcx'
import qrcode from './services/qrcode-generator.mjs'
import {
  broadcastBnbRawTransaction,
  getBnbAccountSnapshot,
  getBnbTxParams,
} from './services/bnb-rpc'

type IslandLevel = 'reef' | 'camp' | 'village' | 'citadel'
type RouteTone = 'internal' | 'external'
type TransactionStatus = 'completed' | 'pending' | 'risk'
type ViewId = 'assets' | 'routes' | 'islands' | 'explore' | 'profile'
type WalletModal = 'create' | 'send' | 'receive' | null
type WeatherKind = 'sunny' | 'rain' | 'storm'

interface WeatherEvent {
  id: number
  kind: WeatherKind
  x: number
  y: number
  size: number
  durationMs: number
}

interface IslandDetailSelection {
  island: Island
  origin: {
    x: number
    y: number
  }
}

interface TokenBalance {
  symbol: string
  value: string
}

interface Island {
  id: string
  name: string
  address: string
  balance: number
  balanceLabel: string
  level: IslandLevel
  status: string
  tokenBalances?: TokenBalance[]
  x: number
  y: number
  width: number
  sprite: string
  saferPro?: SaferProWallet
  walletIndex?: number
}

interface Route {
  id: string
  tone: RouteTone
  path: string
  boat: string
  boatStyle: CSSProperties
  label: string
}

interface HudStat {
  label: string
  value: string
  icon: ReactNode
  tone?: 'default' | 'success'
}

interface Transaction {
  id: string
  time: string
  islandId: string
  title: string
  counterparty: string
  amount: string
  direction: 'in' | 'out'
  status: TransactionStatus
}

type QuestDifficulty = 'easy' | 'hard'
type QuestTrigger = 'wallet' | 'transaction'

interface ExploreQuest {
  detail: string
  difficulty: QuestDifficulty
  id: string
  reward: number
  title: string
  trigger: QuestTrigger
}

interface Decoration {
  title: string
  cost: string
  detail: string
}

interface SkinItem {
  id: string
  level: Exclude<IslandLevel, 'reef'>
  name: string
  description: string
  price: number
  image: string
}

interface SkinSeries {
  id: string
  name: string
  description: string
  items: SkinItem[]
}

interface WalletDraft {
  error?: string
  name: string
  mnemonic: string[]
  saferPro?: SaferProWallet
  status: 'fallback' | 'loading' | 'ready' | 'error'
}

interface SendFormState {
  fromIslandId: string
  chain: string
  token: string
  toAddress: string
  amount: string
}

interface SigningState {
  error?: string
  result?: {
    broadcastHash?: string
    signature: string
    txHash: string
  }
  status: 'idle' | 'signing' | 'signed' | 'error'
}

interface PersistedWalletState {
  islands: Island[]
  transactions: Transaction[]
  version: 1
}

interface SkinMarketState {
  coins: number
  equipped: Partial<Record<IslandLevel, string>>
  unlocked: string[]
}

interface DailyQuestState {
  activeIds: string[]
  claimed: string[]
  cycleId: string
  progress: Record<string, number>
}

const chains = ['BNB Chain', 'Ethereum', 'Bitcoin', 'Polygon', 'Arbitrum']
const tokens = ['BNB', 'ETH', 'BTC', 'USDT', 'USDC', '岛币']
const transferTokensByChain: Record<string, string[]> = {
  Arbitrum: ['ETH', 'USDT', 'USDC'],
  Bitcoin: ['BTC'],
  'BNB Chain': ['BNB', 'USDT', 'USDC'],
  Ethereum: ['ETH', 'USDC', 'USDT'],
  Polygon: ['MATIC', 'USDT', 'USDC'],
}
const defaultChain = chains[0] ?? 'Ethereum'
const defaultToken = transferTokensByChain[defaultChain]?.[0] ?? tokens[0] ?? 'BNB'

const receiveTokenOptions: Record<string, string[]> = {
  Arbitrum: ['USDT', 'USDC', 'ETH'],
  Bitcoin: ['BTC'],
  'BNB Chain': ['USDT', 'USDC', 'BNB'],
  Ethereum: ['USDC', 'USDT', 'ETH'],
  Polygon: ['USDT', 'USDC', 'MATIC'],
}

const gameplayIntroStorageKey = 'my-island.gameplay-intro-dismissed.v1'

function receiveTokensFor(chain: string) {
  return receiveTokenOptions[chain] ?? [defaultToken]
}

function transferTokensFor(chain: string) {
  return transferTokensByChain[chain] ?? [defaultToken]
}

function receivePayload(address: string) {
  const trimmed = address.trim()
  return /^0x[a-fA-F0-9]{40}$/.test(trimmed) ? trimmed : ''
}

const routes: Route[] = []

const initialTransactions: Transaction[] = []

const islandPlacements = [
  { width: 36, x: 8, y: 58 },
  { width: 28, x: 58, y: 48 },
  { width: 28, x: 8, y: 20 },
  { width: 20, x: 70, y: 18 },
  { width: 20, x: 42, y: 34 },
  { width: 20, x: 72, y: 70 },
  { width: 24, x: 38, y: 70 },
  { width: 22, x: 12, y: 74 },
  { width: 24, x: 42, y: 12 },
]

const islandLayoutBounds = {
  height: 720,
  minGap: 42,
  width: 520,
}
const islandVisualScale = 1.72

const initialIslands: Island[] = []

const exploreQuestPool: ExploreQuest[] = [
  {
    id: 'wallet-create',
    title: '建造一座新岛',
    detail: '创建一个新的钱包岛屿，让群岛增加一座营地。',
    difficulty: 'easy',
    reward: 50,
    trigger: 'wallet',
  },
  {
    id: 'wallet-open-receive',
    title: '打开收款码头',
    detail: '进入收款码头并查看任意岛屿的钱包收款信息。',
    difficulty: 'easy',
    reward: 50,
    trigger: 'wallet',
  },
  {
    id: 'wallet-switch-island',
    title: '切换收款岛屿',
    detail: '在收款码头里切换一次不同的钱包岛屿。',
    difficulty: 'easy',
    reward: 50,
    trigger: 'wallet',
  },
  {
    id: 'wallet-switch-chain',
    title: '校准一条航线',
    detail: '在收款码头里切换一次收款链，重新生成地址。',
    difficulty: 'easy',
    reward: 50,
    trigger: 'wallet',
  },
  {
    id: 'wallet-open-send',
    title: '检查转账船坞',
    detail: '打开转账船坞，准备一次钱包之间的航行。',
    difficulty: 'easy',
    reward: 50,
    trigger: 'wallet',
  },
  {
    id: 'tx-bnb-sign',
    title: '完成 BNB 航行',
    detail: '使用 BNB Chain 完成一次真实签名或广播。',
    difficulty: 'hard',
    reward: 100,
    trigger: 'transaction',
  },
  {
    id: 'tx-eth-sign',
    title: '完成 ETH 航行',
    detail: '选择 Ethereum 并完成一次钱包转账签名。',
    difficulty: 'hard',
    reward: 100,
    trigger: 'transaction',
  },
  {
    id: 'tx-usdt-sign',
    title: '运送 USDT 货箱',
    detail: '选择 USDT 并完成一次转账签名。',
    difficulty: 'hard',
    reward: 100,
    trigger: 'transaction',
  },
  {
    id: 'tx-cross-address',
    title: '驶向外部港口',
    detail: '向非 im 开头的钱包地址完成一次转账签名。',
    difficulty: 'hard',
    reward: 100,
    trigger: 'transaction',
  },
  {
    id: 'tx-any-sign',
    title: '记录一条新航线',
    detail: '完成任意链的一次转账签名，生成航海记录。',
    difficulty: 'hard',
    reward: 100,
    trigger: 'transaction',
  },
]

const decorations: Decoration[] = [
  {
    title: '蓝旗小码头',
    cost: '120 岛币',
    detail: '给任意岛屿增加一座码头和旗帜。',
  },
  {
    title: '金色灯塔',
    cost: '360 岛币',
    detail: '让 imKey 保护中的岛屿夜间发光。',
  },
  {
    title: '丰收棕榈树',
    cost: '80 岛币',
    detail: '适合新建岛屿的轻量装饰。',
  },
]

const skinSeries: SkinSeries[] = [
  {
    id: 'mid-autumn',
    name: '中秋节',
    description: '月桂、玉兔和灯盏装点的团圆海岛。',
    items: [
      {
        id: 'mid-autumn-cove',
        level: 'camp',
        name: '月桂小岛',
        description: '桂花、满月和玉兔围绕的温柔月夜。',
        price: 160,
        image: midAutumnSkin1,
      },
      {
        id: 'mid-autumn-village',
        level: 'village',
        name: '月宴村岛',
        description: '灯笼亭台与团圆宴席铺满的中秋村落。',
        price: 220,
        image: midAutumnSkin2,
      },
      {
        id: 'mid-autumn-citadel',
        level: 'citadel',
        name: '月宫城岛',
        description: '宫阙、花灯和月兔庆典组成的华丽城邦。',
        price: 320,
        image: midAutumnSkin3,
      },
    ],
  },
  {
    id: 'spring',
    name: '春节',
    description: '红灯、舞狮和桃花铺满的新春岛屿。',
    items: [
      {
        id: 'spring-cove',
        level: 'camp',
        name: '迎春小岛',
        description: '桃花、红灯和舞狮点亮的新年海岸。',
        price: 180,
        image: springSkin1,
      },
      {
        id: 'spring-village',
        level: 'village',
        name: '灯会村岛',
        description: '灯串、花市和舞狮广场构成的热闹村镇。',
        price: 260,
        image: springSkin2,
      },
      {
        id: 'spring-citadel',
        level: 'citadel',
        name: '新春城岛',
        description: '龙舟、宫殿和烟火庆典汇成的新春主城。',
        price: 380,
        image: springSkin3,
      },
    ],
  },
  {
    id: 'lantern',
    name: '元宵节',
    description: '灯会、莲灯和夜色烟火围绕的元宵群岛。',
    items: [
      {
        id: 'lantern-cove',
        level: 'camp',
        name: '莲灯小岛',
        description: '莲灯与小屋映亮夜色的元宵海湾。',
        price: 170,
        image: lanternSkin1,
      },
      {
        id: 'lantern-village',
        level: 'village',
        name: '灯谜村岛',
        description: '长街灯谜、龙灯和夜市组成的元宵村落。',
        price: 250,
        image: lanternSkin2,
      },
      {
        id: 'lantern-citadel',
        level: 'citadel',
        name: '万灯城岛',
        description: '万盏宫灯、花街和灯火水城的节庆盛景。',
        price: 360,
        image: lanternSkin3,
      },
    ],
  },
  {
    id: 'halloween',
    name: '万圣节',
    description: '南瓜灯、蝙蝠和紫色夜光铺开的幽夜岛屿。',
    items: [
      {
        id: 'halloween-cove',
        level: 'camp',
        name: '南瓜小岛',
        description: '棕榈、鬼屋和南瓜灯点亮的幽夜海湾。',
        price: 190,
        image: halloweenSkin1,
      },
      {
        id: 'halloween-village',
        level: 'village',
        name: '幽灯村岛',
        description: '紫灯、木屋和篝火组成的万圣村镇。',
        price: 280,
        image: halloweenSkin2,
      },
      {
        id: 'halloween-citadel',
        level: 'citadel',
        name: '夜堡城岛',
        description: '古堡、飞蝠和紫色海潮包围的幽夜主城。',
        price: 410,
        image: halloweenSkin3,
      },
    ],
  },
  {
    id: 'valentine',
    name: '情人节',
    description: '爱心、花环和粉色灯光装饰的浪漫群岛。',
    items: [
      {
        id: 'valentine-cove',
        level: 'camp',
        name: '心花小岛',
        description: '花丛、爱心和小屋围成的甜蜜海岸。',
        price: 180,
        image: valentineSkin1,
      },
      {
        id: 'valentine-village',
        level: 'village',
        name: '花誓村岛',
        description: '粉色花园、瀑布和木屋构成的浪漫村落。',
        price: 270,
        image: valentineSkin2,
      },
      {
        id: 'valentine-citadel',
        level: 'citadel',
        name: '心晶城岛',
        description: '心形水晶、白塔和花海组成的情人节城邦。',
        price: 400,
        image: valentineSkin3,
      },
    ],
  },
  {
    id: 'christmas',
    name: '圣诞节',
    description: '雪屋、礼物和圣诞灯串铺满的冬日海岛。',
    items: [
      {
        id: 'christmas-cove',
        level: 'camp',
        name: '雪礼小岛',
        description: '圣诞树、礼盒和雪顶小屋坐落在热带海岸。',
        price: 200,
        image: christmasSkin1,
      },
      {
        id: 'christmas-village',
        level: 'village',
        name: '雪灯村岛',
        description: '雪顶木屋、篝火和灯串围出的节日村镇。',
        price: 290,
        image: christmasSkin2,
      },
      {
        id: 'christmas-citadel',
        level: 'citadel',
        name: '圣诞港城',
        description: '灯塔、雪城和礼物船队组成的圣诞主港。',
        price: 430,
        image: christmasSkin3,
      },
    ],
  },
  {
    id: 'easter',
    name: '复活节',
    description: '彩蛋、兔子和春日花园环绕的明亮群岛。',
    items: [
      {
        id: 'easter-cove',
        level: 'camp',
        name: '彩蛋小岛',
        description: '兔子、彩蛋和粉色缎带点缀的春日海湾。',
        price: 170,
        image: easterSkin1,
      },
      {
        id: 'easter-village',
        level: 'village',
        name: '兔园村岛',
        description: '草屋、兔子雕像和彩蛋篮组成的复活节村庄。',
        price: 260,
        image: easterSkin2,
      },
      {
        id: 'easter-citadel',
        level: 'citadel',
        name: '彩蛋圣城',
        description: '巨型彩蛋、白石宫殿和粉帆船汇成的春日城邦。',
        price: 390,
        image: easterSkin3,
      },
    ],
  },
]

const coinIslandImageAssets = [
  oceanWorldMap,
  oceanPageBg,
  islandDetailCamp,
  islandDetailCitadel,
  islandDetailVillage,
  christmasSkin1,
  christmasSkin2,
  christmasSkin3,
  easterSkin1,
  easterSkin2,
  easterSkin3,
  halloweenSkin1,
  halloweenSkin2,
  halloweenSkin3,
  avatarNav,
  boatOrange,
  compass,
  dockIslandAction,
  islandCamp,
  islandCitadel,
  islandReef,
  islandVillage,
  routeScrollNav,
  sailboatAction,
  scrollPanel,
  shieldNav,
  treasureChestNav,
  rainCloudsWeather,
  stormLightningWeather,
  sunCloudsWeather,
  lanternSkin1,
  lanternSkin2,
  lanternSkin3,
  midAutumnSkin1,
  midAutumnSkin2,
  midAutumnSkin3,
  springSkin1,
  springSkin2,
  springSkin3,
  valentineSkin1,
  valentineSkin2,
  valentineSkin3,
]

const levelLabels: Record<IslandLevel, string> = {
  reef: 'Lv.0 礁石',
  camp: 'Lv.1 营地',
  village: 'Lv.2 村庄',
  citadel: 'Lv.3 城邦',
}

const islandDetailBackgrounds: Record<IslandLevel, string> = {
  reef: islandDetailCamp,
  camp: islandDetailCamp,
  village: islandDetailVillage,
  citadel: islandDetailCitadel,
}

const walletStorageKey = 'coin-islands.wallet-state.v2'
const skinMarketStorageKey = 'coin-islands.skin-market.v2'
const dailyQuestStorageKey = 'coin-islands.daily-quests.v2'
const initialSkinCoins = 860

const skinItemsById = new Map(skinSeries.flatMap((series) => series.items.map((item) => [item.id, item])))
const exploreQuestById = new Map(exploreQuestPool.map((quest) => [quest.id, quest]))

function applyEquippedSkins(
  islands: Island[],
  equipped: Partial<Record<IslandLevel, string>>,
) {
  return islands.map((island) => {
    const skin = equipped[island.level] ? skinItemsById.get(equipped[island.level] ?? '') : undefined
    return skin ? { ...island, sprite: skin.image } : island
  })
}

function dailyQuestCycleId(date = new Date()) {
  const cycleStart = new Date(date)
  cycleStart.setHours(12, 0, 0, 0)

  if (date.getTime() < cycleStart.getTime()) {
    cycleStart.setDate(cycleStart.getDate() - 1)
  }

  return cycleStart.toISOString().slice(0, 10)
}

function seededRandom(seed: string) {
  let hash = 2166136261
  for (const char of seed) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }

  return () => {
    hash += 0x6d2b79f5
    let value = hash
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function pickDailyQuestIds(cycleId: string) {
  const random = seededRandom(cycleId)
  return [...exploreQuestPool]
    .sort(() => random() - 0.5)
    .slice(0, 4)
    .map((quest) => quest.id)
}

function makeDailyQuestState(cycleId = dailyQuestCycleId()): DailyQuestState {
  return {
    activeIds: pickDailyQuestIds(cycleId),
    claimed: [],
    cycleId,
    progress: {},
  }
}

function hasDismissedGameplayIntro() {
  if (typeof window === 'undefined') {
    return true
  }

  try {
    return window.localStorage?.getItem(gameplayIntroStorageKey) === '1'
  } catch {
    return false
  }
}

function writeGameplayIntroDismissed() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage?.setItem(gameplayIntroStorageKey, '1')
  } catch {
    // If storage is blocked, the banner simply returns on refresh.
  }
}

function readWalletStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const localValue = window.localStorage?.getItem(walletStorageKey)
    if (localValue) {
      return localValue
    }
  } catch {
    // Fall back below when browser storage is unavailable.
  }

  try {
    const windowNameState = JSON.parse(window.name || '{}') as Record<string, string>
    return windowNameState[walletStorageKey] ?? null
  } catch {
    return null
  }
}

function readSkinMarketStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const value = window.localStorage?.getItem(skinMarketStorageKey)
    return value
      ? (JSON.parse(value) as Partial<SkinMarketState>)
      : null
  } catch {
    return null
  }
}

function readDailyQuestStorage() {
  const currentCycleId = dailyQuestCycleId()

  if (typeof window === 'undefined') {
    return makeDailyQuestState(currentCycleId)
  }

  try {
    const value = window.localStorage?.getItem(dailyQuestStorageKey)
    if (!value) {
      return makeDailyQuestState(currentCycleId)
    }

    const parsed = JSON.parse(value) as Partial<DailyQuestState>
    if (parsed.cycleId !== currentCycleId || !Array.isArray(parsed.activeIds)) {
      return makeDailyQuestState(currentCycleId)
    }

    const activeIds = parsed.activeIds.filter((id) => exploreQuestById.has(id)).slice(0, 4)
    const fallbackIds = pickDailyQuestIds(currentCycleId).filter((id) => !activeIds.includes(id))

    return {
      activeIds: [...activeIds, ...fallbackIds].slice(0, 4),
      claimed: Array.isArray(parsed.claimed) ? parsed.claimed : [],
      cycleId: currentCycleId,
      progress: parsed.progress ?? {},
    }
  } catch {
    return makeDailyQuestState(currentCycleId)
  }
}

function writeDailyQuestStorage(value: DailyQuestState) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage?.setItem(dailyQuestStorageKey, JSON.stringify(value))
  } catch {
    // Keep the current session usable even if storage is blocked.
  }
}

function writeSkinMarketStorage(value: SkinMarketState) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage?.setItem(skinMarketStorageKey, JSON.stringify(value))
  } catch {
    // Ignore persistence failures; the market remains usable for the current session.
  }
}

function writeWalletStorage(value: string) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage?.setItem(walletStorageKey, value)
    return
  } catch {
    // Fall back below when browser storage is unavailable.
  }

  try {
    const windowNameState = JSON.parse(window.name || '{}') as Record<string, string>
    windowNameState[walletStorageKey] = value
    window.name = JSON.stringify(windowNameState)
  } catch {
    // Storage can fail in constrained browsers; the wallet remains usable in memory.
  }
}

function sanitizePersistedWalletState(state: PersistedWalletState): PersistedWalletState {
  const islands = state.islands.filter((island) => {
    const isGeneratedEmptyDemo =
      /^新营地岛\s+\d+$/.test(island.name) &&
      island.balance === 0 &&
      (island.tokenBalances ?? []).every((balance) => Number(balance.value) === 0)
    return !island.id.startsWith('test-') && !isGeneratedEmptyDemo
  })
  const islandIds = new Set(islands.map((island) => island.id))

  return {
    islands,
    transactions: state.transactions.filter((transaction) => islandIds.has(transaction.islandId)),
    version: 1,
  }
}

function loadPersistedWalletState(): PersistedWalletState | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = readWalletStorage()
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<PersistedWalletState>
    if (parsed.version !== 1 || !Array.isArray(parsed.islands) || !Array.isArray(parsed.transactions)) {
      return null
    }

    return sanitizePersistedWalletState({
      islands: parsed.islands,
      transactions: parsed.transactions,
      version: 1,
    })
  } catch {
    return null
  }
}

function savePersistedWalletState(state: PersistedWalletState) {
  try {
    writeWalletStorage(JSON.stringify(state))
  } catch {
    // Storage can fail in private mode or when quota is exhausted; the wallet remains usable in memory.
  }
}

function formatIslandCoin(value: number) {
  return `${value.toLocaleString('en-US')} 岛币`
}

const tokenUsdRates: Record<string, number> = {
  BNB: 600,
  BTC: 65000,
  ETH: 3200,
  MATIC: 0.75,
  USDC: 1,
  USDT: 1,
}

function islandUsdValue(island: Island) {
  return (island.tokenBalances ?? []).reduce((sum, balance) => {
    const amount = Number(balance.value.replace(/,/g, ''))
    const rate = tokenUsdRates[balance.symbol] ?? 0
    return Number.isFinite(amount) ? sum + amount * rate : sum
  }, 0)
}

function transactionUsdValue(transaction: Transaction) {
  const [, rawAmount, symbol] = transaction.amount.match(/([-+]?\d[\d,.]*)\s*([A-Z]+|岛币)/) ?? []
  if (!rawAmount || !symbol || symbol === '岛币') {
    return 0
  }

  const amount = Number(rawAmount.replace(/,/g, ''))
  const rate = tokenUsdRates[symbol] ?? 0
  return Number.isFinite(amount) ? Math.abs(amount * rate) : 0
}

function formatUsdValue(value: number) {
  return `${value.toLocaleString('en-US', {
    maximumFractionDigits: value >= 100 ? 0 : 2,
    minimumFractionDigits: 2,
  })} U`
}

function tokenBalanceLabel(island: Island | undefined, token: string) {
  if (!island) {
    return `0 ${token}`
  }

  const balance = island.tokenBalances?.find((item) => item.symbol === token)
  return `${balance?.value ?? '0'} ${token}`
}

function nextRefreshDelay() {
  return 2000 + Math.floor(Math.random() * 3000)
}

function makeAddress(index: number, chain = 'imKey') {
  return `${chain.slice(0, 3).toLowerCase()}1q${String(index + 17).padStart(2, '0')}sea${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

function islandSpriteFor(level: IslandLevel) {
  switch (level) {
    case 'citadel':
      return islandCitadel
    case 'village':
      return islandVillage
    case 'camp':
      return islandCamp
    default:
      return islandReef
  }
}

function islandLevelForUsd(totalUsd: number): Exclude<IslandLevel, 'reef'> {
  if (totalUsd > 1000) {
    return 'citadel'
  }

  if (totalUsd > 10) {
    return 'village'
  }

  return 'camp'
}

const islandWidthByLevel: Record<Exclude<IslandLevel, 'reef'>, number> = {
  camp: 20,
  citadel: 36,
  village: 28,
}

function evolveIslandByUsd(island: Island) {
  const level = islandLevelForUsd(islandUsdValue(island))
  return {
    ...island,
    level,
    sprite: islandSpriteFor(level),
    width: islandWidthByLevel[level],
  }
}

function evolveIslandsByUsd(islands: Island[]) {
  return islands.map(evolveIslandByUsd)
}

function islandRect(island: Island) {
  const width = (island.width / 100) * islandLayoutBounds.width
  const height = width * 0.92 + 54

  return {
    bottom: (island.y / 100) * islandLayoutBounds.height + height,
    left: (island.x / 100) * islandLayoutBounds.width,
    right: (island.x / 100) * islandLayoutBounds.width + width,
    top: (island.y / 100) * islandLayoutBounds.height,
  }
}

function mapWorldScale(count: number) {
  if (count <= 1) {
    return 1.04
  }

  if (count <= 3) {
    return 1.14 + (count - 1) * 0.1
  }

  return Math.min(2.9, 1.34 + (count - 3) * 0.16)
}

function mapCameraScale(count: number) {
  if (count <= 1) {
    return 1.2
  }

  if (count <= 3) {
    return 1.13 - (count - 1) * 0.055
  }

  return Math.max(0.62, 1.02 - (count - 3) * 0.045)
}

function islandRenderWidth(island: Island, worldScale: number, cameraScale: number) {
  return (island.width * islandVisualScale) / worldScale / cameraScale
}

function islandCircle(island: Island, worldScale: number, cameraScale: number) {
  const width = (islandRenderWidth(island, worldScale, cameraScale) / 100) *
    islandLayoutBounds.width *
    worldScale
  const visualHeight = width * 0.92

  return {
    radius: Math.max(width, visualHeight) / 2,
    x: (island.x / 100) * islandLayoutBounds.width + width / 2,
    y: (island.y / 100) * islandLayoutBounds.height + visualHeight / 2,
  }
}

function circleDistance(a: ReturnType<typeof islandCircle>, b: ReturnType<typeof islandCircle>) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function seededLayoutRandom(seed: number) {
  let value = seed >>> 0
  return () => {
    value += 0x6d2b79f5
    let next = value
    next = Math.imul(next ^ (next >>> 15), next | 1)
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61)
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

function islandSeed(island: Island, index: number) {
  const source = `${island.id}:${island.name}:${index}`
  return Array.from(source).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 2166136261)
}

function hasMinimumIslandGap(
  candidate: Island,
  placed: Island[],
  worldScale: number,
  cameraScale: number,
) {
  const candidateCircle = islandCircle(candidate, worldScale, cameraScale)
  return placed.every((island) => {
    const circle = islandCircle(island, worldScale, cameraScale)
    const requiredGap =
      candidateCircle.radius + circle.radius + islandLayoutBounds.minGap / cameraScale
    return circleDistance(candidateCircle, circle) >= requiredGap
  })
}

function layoutIslandsWithGap(islands: Island[], worldScale: number, cameraScale: number) {
  const placed: Island[] = []

  for (const [index, island] of islands.entries()) {
    const random = seededLayoutRandom(islandSeed(island, index))
    const renderWidth = islandRenderWidth(island, worldScale, cameraScale)
    let nextIsland = island
    let bestIsland = nextIsland
    let bestGap = -Infinity

    for (let attempt = 0; attempt < 180; attempt += 1) {
      const candidate = {
        ...nextIsland,
        x: random() * Math.max(1, 96 - renderWidth),
        y: 4 + random() * 62,
      }

      if (hasMinimumIslandGap(candidate, placed, worldScale, cameraScale)) {
        nextIsland = candidate
        break
      }

      const candidateCircle = islandCircle(candidate, worldScale, cameraScale)
      const nearestGap =
        placed.length === 0
          ? Infinity
          : Math.min(
              ...placed.map((placedIsland) => {
                const placedCircle = islandCircle(placedIsland, worldScale, cameraScale)
                return (
                  circleDistance(candidateCircle, placedCircle) -
                  candidateCircle.radius -
                  placedCircle.radius
                )
              }),
            )

      if (nearestGap > bestGap) {
        bestGap = nearestGap
        bestIsland = candidate
      }

      if (attempt === 179) {
        nextIsland = bestIsland
      }
    }

    placed.push(nextIsland)
  }

  return placed
}

function makeNewIsland(index: number, name: string, saferPro?: SaferProWallet): Island {
  const placement = islandPlacements[index % islandPlacements.length] ?? { width: 32, x: 36, y: 36 }
  const drift = Math.floor(index / islandPlacements.length)
  const level: IslandLevel = 'camp'

  return {
    id: `wallet-${Date.now()}`,
    name: name.trim() || `新营地岛 ${index + 1}`,
    address: saferPro?.address ?? makeAddress(index),
    balance: 100,
    balanceLabel: '100 岛币',
    level,
    status: saferPro ? 'SaferPro wasm 钱包已创建' : '新建钱包账本已开启',
    tokenBalances: [
      { symbol: 'BNB', value: '0' },
      { symbol: 'USDT', value: '0' },
      { symbol: 'USDC', value: '0' },
    ],
    x: Math.min(78, placement.x + drift * 4),
    y: Math.min(72, placement.y + drift * 5),
    width: placement.width,
    sprite: islandSpriteFor(level),
    saferPro,
    walletIndex: index,
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error(message)), timeoutMs)
    promise
      .then((value) => {
        window.clearTimeout(timeout)
        resolve(value)
      })
      .catch((error: unknown) => {
        window.clearTimeout(timeout)
        reject(error)
      })
  })
}

function currentTimeLabel() {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

function selectionFromElement(island: Island, element: HTMLElement): IslandDetailSelection {
  const phoneRect = element.closest('.coin-islands-phone')?.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()

  if (!phoneRect) {
    return {
      island,
      origin: {
        x: island.x + island.width / 2,
        y: island.y + island.width / 2,
      },
    }
  }

  return {
    island,
    origin: {
      x: ((elementRect.left + elementRect.width / 2 - phoneRect.left) / phoneRect.width) * 100,
      y: ((elementRect.top + elementRect.height / 2 - phoneRect.top) / phoneRect.height) * 100,
    },
  }
}

function WalletDashboard() {
  usePreloadCoinIslandImages()

  const persistedState = useRef<PersistedWalletState | null | undefined>(undefined)
  if (persistedState.current === undefined) {
    persistedState.current = loadPersistedWalletState()
  }
  const [activeView, setActiveView] = useState<ViewId>('islands')
  const [walletIslands, setWalletIslands] = useState<Island[]>(
    () => evolveIslandsByUsd(persistedState.current?.islands ?? initialIslands),
  )
  const [walletTransactions, setWalletTransactions] = useState<Transaction[]>(
    () => persistedState.current?.transactions ?? initialTransactions,
  )
  const walletIslandsRef = useRef(walletIslands)
  const walletTransactionsRef = useRef(walletTransactions)
  const refreshCycleRef = useRef(0)
  const [activeModal, setActiveModal] = useState<WalletModal>(null)
  const [walletDraft, setWalletDraft] = useState<WalletDraft | null>(null)
  const [selectedReceiveIslandId, setSelectedReceiveIslandId] = useState(
    () => persistedState.current?.islands[0]?.id ?? initialIslands[0]?.id ?? '',
  )
  const [selectedReceiveChain, setSelectedReceiveChain] = useState(defaultChain)
  const [selectedReceiveToken, setSelectedReceiveToken] = useState(receiveTokensFor(defaultChain)[0] ?? defaultToken)
  const [receiveAddress, setReceiveAddress] = useState('')
  const [receiveError, setReceiveError] = useState('')
  const [selectedIslandDetail, setSelectedIslandDetail] = useState<IslandDetailSelection | null>(null)
  const [signingState, setSigningState] = useState<SigningState>({ status: 'idle' })
  const [showGameplayIntro, setShowGameplayIntro] = useState(() => !hasDismissedGameplayIntro())
  const [sendForm, setSendForm] = useState<SendFormState>({
    fromIslandId: persistedState.current?.islands[0]?.id ?? initialIslands[0]?.id ?? '',
    chain: defaultChain,
    token: defaultToken,
    toAddress: '',
    amount: '',
  })
  const storedMarket = useMemo(() => readSkinMarketStorage(), [])
  const [skinCoins, setSkinCoins] = useState(storedMarket?.coins ?? initialSkinCoins)
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(storedMarket?.unlocked ?? [])
  const [equippedSkins, setEquippedSkins] = useState<Partial<Record<IslandLevel, string>>>(
    storedMarket?.equipped ?? {},
  )
  const [dailyQuests, setDailyQuests] = useState<DailyQuestState>(() => readDailyQuestStorage())
  const skinnedWalletIslands = useMemo(
    () => applyEquippedSkins(walletIslands, equippedSkins),
    [walletIslands, equippedSkins],
  )

  useEffect(() => {
    walletIslandsRef.current = walletIslands
  }, [walletIslands])

  useEffect(() => {
    walletTransactionsRef.current = walletTransactions
  }, [walletTransactions])

  useEffect(() => {
    savePersistedWalletState({
      islands: walletIslands,
      transactions: walletTransactions,
      version: 1,
    })
  }, [walletIslands, walletTransactions])

  useEffect(() => {
    writeSkinMarketStorage({
      coins: skinCoins,
      equipped: equippedSkins,
      unlocked: unlockedSkins,
    })
  }, [skinCoins, equippedSkins, unlockedSkins])

  useEffect(() => {
    writeDailyQuestStorage(dailyQuests)
  }, [dailyQuests])

  useEffect(() => {
    const refreshDailyQuests = () => {
      setDailyQuests((current) => {
        const nextCycleId = dailyQuestCycleId()
        return current.cycleId === nextCycleId ? current : makeDailyQuestState(nextCycleId)
      })
    }

    refreshDailyQuests()
    const interval = window.setInterval(refreshDailyQuests, 60_000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    let timeout = 0
    let stopped = false

    const schedule = () => {
      timeout = window.setTimeout(refresh, nextRefreshDelay())
    }

    const refresh = async () => {
      if (stopped) {
        return
      }

      refreshCycleRef.current += 1
      const snapshot = walletIslandsRef.current
      const bnbSnapshots = await Promise.all(
        snapshot.map(async (island) => {
          const address = island.saferPro?.accounts['BNB Chain']?.address
          if (!address) {
            return null
          }

          try {
            return {
              id: island.id,
              snapshot: await getBnbAccountSnapshot(address),
            }
          } catch {
            return null
          }
        }),
      )
      const bnbByIsland = new Map(
        bnbSnapshots
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
          .map((item) => [item.id, item]),
      )

      setWalletIslands((current) =>
        current.map((island, index) => {
          const bnb = bnbByIsland.get(island.id)
          const updatedIsland = {
            ...island,
            status:
              index === refreshCycleRef.current % Math.max(current.length, 1)
                ? `余额已刷新 ${currentTimeLabel()}`
                : island.status,
            ...(bnb
              ? {
                  status: `BNB ${bnb.snapshot.bnb.value} · USDT ${bnb.snapshot.usdt.value} · USDC ${bnb.snapshot.usdc.value}`,
                  tokenBalances: [
                    { symbol: 'BNB', value: bnb.snapshot.bnb.value },
                    { symbol: 'USDT', value: bnb.snapshot.usdt.value },
                    { symbol: 'USDC', value: bnb.snapshot.usdc.value },
                  ],
                }
              : {}),
          }
          return evolveIslandByUsd(updatedIsland)
        }),
      )

      schedule()
    }

    schedule()
    return () => {
      stopped = true
      window.clearTimeout(timeout)
    }
  }, [])

  const hudStats: HudStat[] = [
    {
      label: '群岛总值',
      value: formatUsdValue(walletIslands.reduce((sum, island) => sum + islandUsdValue(island), 0)),
      icon: <span className="coin-symbol">岛</span>,
    },
    {
      label: '今日航行',
      value: formatUsdValue(
        walletTransactions.reduce((sum, transaction) => sum + transactionUsdValue(transaction), 0),
      ),
      icon: <img src={boatOrange} alt="" className="h-9 w-9 object-contain" />,
    },
    {
      label: '岛屿数量',
      value: `${walletIslands.length} 座岛`,
      icon: <img src={islandReef} alt="" className="h-10 w-10 object-contain" />,
    },
    {
      label: '群岛钥匙',
      value: '已连接',
      icon: <img src={shieldNav} alt="" className="h-10 w-10 object-contain" />,
      tone: 'success',
    },
  ]

  const navItems: Array<{ id: ViewId; label: string; icon: string }> = [
    { id: 'assets', label: '资产', icon: treasureChestNav },
    { id: 'routes', label: '航线', icon: routeScrollNav },
    { id: 'islands', label: '海岛', icon: islandReef },
    { id: 'explore', label: '探索', icon: shieldNav },
    { id: 'profile', label: '我的', icon: avatarNav },
  ]

  const handleSkinAction = (item: SkinItem) => {
    if (!unlockedSkins.includes(item.id)) {
      if (skinCoins < item.price) {
        return
      }

      setSkinCoins((coins) => coins - item.price)
      setUnlockedSkins((current) => [...current, item.id])
    }

    setEquippedSkins((current) => ({
      ...current,
      [item.level]: item.id,
    }))
  }

  const advanceDailyQuest = (questId: string) => {
    setDailyQuests((current) => {
      if (!current.activeIds.includes(questId) || current.claimed.includes(questId)) {
        return current
      }

      return {
        ...current,
        progress: {
          ...current.progress,
          [questId]: 1,
        },
      }
    })
  }

  const completeTransactionQuests = (payload: {
    chain: string
    token: string
    toAddress: string
  }) => {
    const questIds = [
      'tx-any-sign',
      payload.chain === 'BNB Chain' ? 'tx-bnb-sign' : '',
      payload.chain === 'Ethereum' ? 'tx-eth-sign' : '',
      payload.token === 'USDT' ? 'tx-usdt-sign' : '',
      !payload.toAddress.startsWith('im') ? 'tx-cross-address' : '',
    ].filter(Boolean)

    setDailyQuests((current) => {
      const nextProgress = { ...current.progress }
      let changed = false

      for (const questId of questIds) {
        if (current.activeIds.includes(questId) && !current.claimed.includes(questId)) {
          nextProgress[questId] = 1
          changed = true
        }
      }

      return changed ? { ...current, progress: nextProgress } : current
    })
  }

  const claimDailyQuest = (questId: string) => {
    const quest = exploreQuestById.get(questId)
    const canClaim =
      quest &&
      dailyQuests.activeIds.includes(questId) &&
      !dailyQuests.claimed.includes(questId) &&
      (dailyQuests.progress[questId] ?? 0) >= 1

    if (!canClaim) {
      return
    }

    setDailyQuests((current) => ({
      ...current,
      claimed: current.claimed.includes(questId) ? current.claimed : [...current.claimed, questId],
    }))
    setSkinCoins((coins) => coins + quest.reward)
  }

  const renameIsland = (islandId: string, name: string) => {
    const nextName = name.trim()
    if (!nextName) {
      return
    }

    setWalletIslands((current) =>
      current.map((island) => (island.id === islandId ? { ...island, name: nextName } : island)),
    )
    setSelectedIslandDetail((current) =>
      current?.island.id === islandId
        ? {
            ...current,
            island: {
              ...current.island,
              name: nextName,
            },
          }
        : current,
    )
  }

  const dismissGameplayIntro = () => {
    setShowGameplayIntro(false)
    writeGameplayIntroDismissed()
  }

  const openCreateWallet = async () => {
    const name = `新营地岛 ${walletIslands.length + 1}`
    setWalletDraft({
      name,
      mnemonic: [],
      status: 'loading',
    })
    setActiveModal('create')

    try {
      const saferPro = await createSaferProWallet(walletIslands.length)
      setWalletDraft({
        name,
        mnemonic: saferPro.mnemonic.split(/\s+/),
        saferPro,
        status: 'ready',
      })
    } catch (error) {
      setWalletDraft({
        error: error instanceof Error ? error.message : 'tcx-wasm 创建钱包失败',
        name,
        mnemonic: [],
        status: 'error',
      })
    }
  }

  const confirmCreateWallet = () => {
    if (!walletDraft?.saferPro) {
      return
    }

    const island = makeNewIsland(walletIslands.length, walletDraft.name, walletDraft.saferPro)
    setWalletIslands((current) => [...current, island])
    setWalletTransactions((current) => [
      {
        id: `tx-create-${Date.now()}`,
        time: currentTimeLabel(),
        islandId: island.id,
        title: `${island.name}账本创建`,
        counterparty: 'tcx-wasm keystore 已生成',
        amount: '+100 岛币',
        direction: 'in',
        status: 'completed',
      },
      ...current,
    ])
    setSelectedReceiveIslandId(island.id)
    setSendForm((form) => ({ ...form, fromIslandId: island.id }))
    advanceDailyQuest('wallet-create')
    setActiveView('assets')
    setActiveModal(null)
  }

  const updateReceiveAddress = async (islandId = selectedReceiveIslandId, chain = selectedReceiveChain) => {
    const island = walletIslands.find((item) => item.id === islandId)
    setReceiveError('')

    if (!island?.saferPro) {
      setReceiveAddress(island?.address ?? '')
      setReceiveError(island ? '' : '请先创建一个岛屿钱包。')
      return
    }

    try {
      const account = await deriveSaferProAddress({
        chain,
        index: island.walletIndex ?? 0,
        keystoreJson: island.saferPro.keystoreJson,
        unlockKey: island.saferPro.unlockKey,
      })
      setReceiveAddress(account?.address ?? island.saferPro.address)
    } catch (error) {
      setReceiveAddress(island.saferPro.address)
      setReceiveError(error instanceof Error ? error.message : '派生收款地址失败')
    }
  }

  const openReceiveModal = () => {
    if (walletIslands.length === 0) {
      void openCreateWallet()
      return
    }

    advanceDailyQuest('wallet-open-receive')
    setActiveModal('receive')
    void updateReceiveAddress()
  }

  const openSendModal = () => {
    if (walletIslands.length === 0) {
      void openCreateWallet()
      return
    }

    setSigningState({ status: 'idle' })
    setSendForm((form) => {
      const chainTokens = transferTokensFor(form.chain)
      return {
        ...form,
        token: chainTokens.includes(form.token) ? form.token : (chainTokens[0] ?? defaultToken),
      }
    })
    advanceDailyQuest('wallet-open-send')
    setActiveModal('send')
  }

  const updateReceiveIsland = (islandId: string) => {
    setSelectedReceiveIslandId(islandId)
    advanceDailyQuest('wallet-switch-island')
    void updateReceiveAddress(islandId, selectedReceiveChain)
  }

  const updateReceiveChain = (chain: string) => {
    const nextToken = receiveTokensFor(chain)[0] ?? defaultToken
    setSelectedReceiveChain(chain)
    setSelectedReceiveToken(nextToken)
    advanceDailyQuest('wallet-switch-chain')
    void updateReceiveAddress(selectedReceiveIslandId, chain)
  }

  const submitTransfer = async () => {
    const source = walletIslands.find((island) => island.id === sendForm.fromIslandId)
    if (!source || !sendForm.amount.trim() || !sendForm.toAddress.trim()) {
      if (!source) {
        setSigningState({
          error: '请先在资产页创建一个岛屿钱包。',
          status: 'error',
        })
      }
      return
    }

    if (!source.saferPro) {
      setSigningState({
        error: '这个岛屿没有可用 keystore，请重新创建钱包。',
        status: 'error',
      })
      return
    }

    setSigningState({ status: 'signing' })

    try {
      const bnbAccount = source.saferPro.accounts['BNB Chain']
      const bnbParams =
        sendForm.chain === 'BNB Chain' && bnbAccount
          ? await getBnbTxParams(bnbAccount.address, sendForm.token, sendForm.toAddress, sendForm.amount)
          : null
      const signed = await signSaferProTransfer({
        amount: sendForm.amount,
        chain: sendForm.chain,
        data: bnbParams?.data,
        derivationPath: bnbParams && bnbAccount ? bnbAccount.derivationPath : source.saferPro.derivationPath,
        gasLimit: bnbParams?.gasLimit,
        gasPrice: bnbParams?.gasPrice,
        keystoreJson: source.saferPro.keystoreJson,
        nonce: bnbParams?.nonce,
        token: sendForm.token,
        toAddress: bnbParams?.to ?? sendForm.toAddress,
        unlockKey: source.saferPro.unlockKey,
        value: bnbParams?.value,
      })
      let broadcastHash: string | undefined
      let broadcastError = ''

      if (sendForm.chain === 'BNB Chain') {
        try {
          broadcastHash = await broadcastBnbRawTransaction(signed.signature)
        } catch (error) {
          broadcastError = error instanceof Error ? error.message : '广播失败，已保留本地签名记录。'
        }
      }

      const result = broadcastHash ? { ...signed, broadcastHash } : signed
      completeTransactionQuests({
        chain: sendForm.chain,
        toAddress: sendForm.toAddress,
        token: sendForm.token,
      })

      setWalletTransactions((current) => [
        {
          id: `tx-send-${Date.now()}`,
          time: currentTimeLabel(),
          islandId: source.id,
          title: `${source.name}完成${sendForm.chain}签名`,
          counterparty: broadcastHash ?? signed.txHash,
          amount: `-${sendForm.amount} ${sendForm.token}`,
          direction: 'out',
          status: broadcastError ? 'pending' : sendForm.toAddress.startsWith('im') ? 'completed' : 'risk',
        },
        ...current,
      ])
      setSigningState(
        broadcastError
          ? { error: broadcastError, result, status: 'signed' }
          : { result, status: 'signed' },
      )
      setActiveView('routes')
      setActiveModal(null)
    } catch (error) {
      setSigningState({
        error: error instanceof Error ? error.message : 'tcx-wasm 签名失败',
        status: 'error',
      })
    }
  }

  return (
    <section className="coin-islands-app flex h-full w-full items-center justify-center">
      <div className="coin-islands-phone relative overflow-hidden rounded-3xl border border-border bg-surface-blue shadow-[var(--shadow-card-lg)]">
        <div className="coin-islands-stage relative h-full overflow-hidden">
          <div className="relative h-full overflow-hidden">
            <ViewPane active={activeView === 'assets'}>
              <AssetsView
                islands={skinnedWalletIslands}
                onCreateWallet={openCreateWallet}
                onOpenSend={openSendModal}
                onSelectIsland={setSelectedIslandDetail}
              />
            </ViewPane>
            <ViewPane active={activeView === 'routes'}>
              <RoutesView islands={skinnedWalletIslands} transactions={walletTransactions} />
            </ViewPane>
            <ViewPane active={activeView === 'islands'}>
              <IslandMapView
                islands={skinnedWalletIslands}
                onOpenReceive={openReceiveModal}
                onOpenSend={openSendModal}
                onSelectIsland={setSelectedIslandDetail}
              />
            </ViewPane>
            <ViewPane active={activeView === 'explore'}>
              <ExploreView
                coins={skinCoins}
                dailyQuests={dailyQuests}
                equipped={equippedSkins}
                onClaimQuest={claimDailyQuest}
                unlocked={unlockedSkins}
                onSkinAction={handleSkinAction}
              />
            </ViewPane>
            <ViewPane active={activeView === 'profile'}>
              <ProfileView hudStats={hudStats} />
            </ViewPane>
          </div>

          <BottomNav items={navItems} activeView={activeView} onChange={setActiveView} />
          <WalletModalLayer
            activeModal={activeModal}
            draft={walletDraft}
            islands={skinnedWalletIslands}
            receiveChain={selectedReceiveChain}
            receiveAddress={receiveAddress}
            receiveError={receiveError}
            receiveIslandId={selectedReceiveIslandId}
            receiveToken={selectedReceiveToken}
            sendForm={sendForm}
            signingState={signingState}
            onClose={() => setActiveModal(null)}
            onConfirmCreate={confirmCreateWallet}
            onDraftNameChange={(name) =>
              setWalletDraft((draft) => (draft ? { ...draft, name } : draft))
            }
            onReceiveChainChange={updateReceiveChain}
            onReceiveIslandChange={updateReceiveIsland}
            onReceiveTokenChange={setSelectedReceiveToken}
            onSendFormChange={setSendForm}
            onSubmitTransfer={submitTransfer}
          />
          <IslandDetailLayer
            selection={selectedIslandDetail}
            onClose={() => setSelectedIslandDetail(null)}
            onRename={renameIsland}
          />
          {showGameplayIntro ? <GameplayIntroBanner onClose={dismissGameplayIntro} /> : null}
        </div>
      </div>

    </section>
  )
}

function usePreloadCoinIslandImages() {
  useEffect(() => {
    const images = coinIslandImageAssets.map((src) => {
      const image = new Image()
      image.decoding = 'async'
      image.src = src
      void image.decode?.().catch(() => undefined)
      return image
    })

    return () => {
      images.length = 0
    }
  }, [])
}

function ViewPane({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div
      aria-hidden={!active}
      className={
        active
          ? 'absolute inset-0 h-full opacity-100 transition-opacity duration-200 ease-[var(--ease-emphasis)]'
          : 'pointer-events-none absolute inset-0 h-full opacity-0 transition-opacity duration-200 ease-[var(--ease-emphasis)]'
      }
    >
      {children}
    </div>
  )
}

function GameplayIntroBanner({ onClose }: { onClose: () => void }) {
  const evolutionSteps = [
    { image: islandCamp, label: '小型初始岛屿' },
    { image: islandVillage, label: '中型村落岛屿' },
    { image: islandCitadel, label: '大型城邦岛屿' },
  ]

  return (
    <div className="absolute inset-x-3 top-4 z-[95] rounded-2xl border border-[#b8e7ff]/70 bg-[#0b65c8]/88 p-3 text-[#effaff] shadow-[0_18px_34px_rgba(2,24,77,0.34),inset_0_1px_0_rgba(255,255,255,0.42)] backdrop-blur-xl sm:inset-x-4 sm:top-5 sm:p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 pr-1">
          <div className="text-title-sm font-black">My Island 核心玩法</div>
          <p className="mt-2 text-body-sm font-bold leading-6 text-[#dcf6ff]">
            创建钱包生成岛屿；账户总价值以 U 计算，并推动岛屿成长为小型、中型、大型。转账和收款会形成本地航线记录。每日任务产出岛币，岛币只用于购买和使用节日岛屿皮肤。
          </p>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1.5 rounded-xl border border-[#b8e7ff]/45 bg-white/14 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
            {evolutionSteps.map((step, index) => (
              <Fragment key={step.label}>
                <div className="min-w-0 rounded-lg border border-white/35 bg-[#063f92]/45 px-1.5 py-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
                  <img
                    src={step.image}
                    alt=""
                    className="mx-auto h-14 w-full object-contain drop-shadow-[0_6px_8px_rgba(0,0,0,0.3)]"
                    draggable={false}
                  />
                  <div className="mt-1 truncate text-[10px] font-black leading-4 text-[#effaff] sm:text-caption">
                    {step.label}
                  </div>
                </div>
                {index < evolutionSteps.length - 1 ? (
                  <div className="text-body-lg font-black text-[#ffe9a8]">
                    →
                  </div>
                ) : null}
              </Fragment>
            ))}
          </div>
        </div>
        <button
          aria-label="关闭玩法说明"
          className="shrink-0 rounded-lg border border-white/45 bg-white/18 px-2.5 py-2 text-caption font-black text-[#effaff] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-md sm:px-3"
          onClick={onClose}
          type="button"
        >
          知道
        </button>
      </div>
    </div>
  )
}

function HudCard({ stat }: { stat: HudStat }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/24 p-3 shadow-[0_10px_28px_rgba(93,62,28,0.14),inset_0_1px_0_rgba(255,255,255,0.44)] backdrop-blur-md">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/45 bg-white/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.54)] backdrop-blur-md">
        {stat.icon}
      </div>
      <div>
        <div className="text-caption font-semibold text-[#d7f6ff]">{stat.label}</div>
        <div
          className={
            stat.tone === 'success'
              ? 'text-body-lg font-bold text-[#128a4f]'
              : 'text-body-lg font-bold text-[#f2fcff]'
          }
        >
          {stat.value}
        </div>
      </div>
    </div>
  )
}

function OceanPage({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className="coin-ocean-page h-full"
      style={{ backgroundImage: `url(${oceanPageBg})` }}
    >
      <div className="coin-ocean-page-shade" />
      <div className={`relative z-10 h-full min-h-0 ${className}`}>{children}</div>
    </div>
  )
}

function AssetsView({
  islands,
  onCreateWallet,
  onOpenSend,
  onSelectIsland,
}: {
  islands: Island[]
  onCreateWallet: () => void
  onOpenSend: () => void
  onSelectIsland: (selection: IslandDetailSelection) => void
}) {
  return (
    <OceanPage className="no-scrollbar h-full overflow-y-auto p-4 pb-28 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <PanelHeader
          eyebrow="账户展示"
          title="资产岛屿"
          description="每个账户对应一座岛礁，创建钱包会生成助记词并新增一座 Lv.1 营地岛。"
        />
        <div className="grid shrink-0 gap-2">
          <Button className="h-11 rounded-xl px-4 text-body-md font-black shadow-[0_8px_18px_rgba(10,84,180,0.26)]" onClick={onCreateWallet}>
            创建钱包
          </Button>
          <Button
            className="h-10 rounded-xl border-white/45 bg-white/26 px-4 text-body-sm font-black text-[#effaff] shadow-[0_8px_18px_rgba(10,84,180,0.18)] backdrop-blur-md hover:bg-white/34"
            onClick={onOpenSend}
            variant="secondary"
          >
            转账
          </Button>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {islands.length === 0 ? (
          <div className="rounded-2xl border border-white/45 bg-white/24 p-5 text-body-sm leading-6 text-[#e9fbff] shadow-[0_8px_24px_rgba(76,50,25,0.12)] backdrop-blur-md">
            当前还没有岛屿钱包。点击右上角“创建钱包”，生成第一个本地钱包后会自动新增岛屿。
          </div>
        ) : null}
        {islands.map((island) => {
          const totalUsd = formatUsdValue(islandUsdValue(island))

          return (
          <button
            aria-label={`${island.name}账户，总资产 ${totalUsd}`}
            className="flex min-h-[120px] w-full items-center gap-3 rounded-2xl border border-white/50 bg-white/24 p-3 text-left shadow-[0_10px_28px_rgba(93,62,28,0.14),inset_0_1px_0_rgba(255,255,255,0.44)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            key={island.id}
            onClick={(event) => {
              const originElement =
                event.currentTarget.querySelector<HTMLElement>('[data-island-origin]') ??
                event.currentTarget
              onSelectIsland(selectionFromElement(island, originElement))
            }}
            type="button"
          >
            <div className="flex w-28 shrink-0 justify-center" data-island-origin>
              <img src={island.sprite} alt="" className="max-h-24 object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-title-sm font-bold text-foreground">{island.name}</h2>
                <Badge variant={island.level === 'citadel' ? 'success' : 'neutral'}>
                  {levelLabels[island.level]}
                </Badge>
              </div>
              <div className="mt-2 text-title-md font-bold text-primary">{totalUsd}</div>
              <div className="mt-1 text-caption font-semibold text-muted-foreground">
                账户总余额折合
              </div>
              <p className="mt-2 text-body-sm text-muted-foreground">{island.status}</p>
              <div className="mt-2 truncate rounded-xl border border-white/45 bg-white/18 px-3 py-2 text-caption font-semibold text-[#d7f6ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.48)] backdrop-blur-md">
                {island.address}
              </div>
            </div>
          </button>
          )
        })}
      </div>
    </OceanPage>
  )
}

function RoutesView({
  islands,
  transactions,
}: {
  islands: Island[]
  transactions: Transaction[]
}) {
  const grouped = islands
    .map((island) => ({
      island,
      items: transactions.filter((transaction) => transaction.islandId === island.id),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <OceanPage className="no-scrollbar h-full overflow-y-auto p-4 pb-28 sm:p-6">
      <PanelHeader
        eyebrow="航海记录"
        title="今日流入流出"
        description="按照时间排序，并按每座岛礁账户归类。"
      />
      <div className="mt-4">
        <div className="rounded-2xl border border-white/50 bg-white/24 p-3 shadow-[0_10px_28px_rgba(93,62,28,0.14),inset_0_1px_0_rgba(255,255,255,0.44)] backdrop-blur-md">
          <div className="text-body-md font-bold text-foreground">时间线</div>
          <div className="mt-3 space-y-2">
            {transactions.length === 0 ? (
              <div className="rounded-xl border border-white/45 bg-white/22 p-4 text-body-sm text-[#e9fbff] backdrop-blur-md">
                暂无航线记录。创建钱包或完成转账后会在这里生成日志。
              </div>
            ) : null}
            {transactions.map((transaction) => (
              <TransactionRow
                compact
                islands={islands}
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 space-y-3">
          {grouped.map((group) => (
            <div className="rounded-2xl border border-white/50 bg-white/24 p-3 shadow-[0_10px_28px_rgba(93,62,28,0.14)] backdrop-blur-md" key={group.island.id}>
              <div className="flex items-center gap-3">
                <img src={group.island.sprite} alt="" className="h-14 w-16 object-contain" />
                <div>
                  <div className="text-body-md font-bold text-foreground">{group.island.name}</div>
                  <div className="text-caption text-muted-foreground">
                    {formatUsdValue(islandUsdValue(group.island))}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {group.items.map((transaction) => (
                  <TransactionRow islands={islands} key={transaction.id} transaction={transaction} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </OceanPage>
  )
}

function IslandMapView({
  islands,
  onOpenReceive,
  onOpenSend,
  onSelectIsland,
}: {
  islands: Island[]
  onOpenReceive: () => void
  onOpenSend: () => void
  onSelectIsland: (selection: IslandDetailSelection) => void
}) {
  const worldScale = mapWorldScale(islands.length)
  const cameraScale = mapCameraScale(islands.length) / Math.sqrt(worldScale)
  const laidOutIslands = useMemo(
    () => layoutIslandsWithGap(islands, worldScale, cameraScale),
    [cameraScale, islands, worldScale],
  )
  const sailboatRef = useSailboatMotion(laidOutIslands)
  const weather = useWeatherCycle()
  const [zoomDelta, setZoomDelta] = useState(0)
  const mapScale = cameraScale + zoomDelta
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 })
  const mapViewportRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; x: number; y: number } | null>(null)
  const canMoveMap = laidOutIslands.length > 4 || worldScale > 1

  const clampOffset = (offset: { x: number; y: number }, scale = mapScale) => {
    const viewport = mapViewportRef.current
    if (!viewport) {
      return worldScale <= 1 && scale >= 1 ? { x: 0, y: 0 } : offset
    }

    const mapWidth = viewport.clientWidth * worldScale * scale
    const mapHeight = viewport.clientHeight * worldScale * scale
    const maxX = Math.max(0, (mapWidth - viewport.clientWidth) / 2)
    const maxY = Math.max(0, (mapHeight - viewport.clientHeight) / 2)

    return {
      x: Math.min(Math.max(offset.x, -maxX), maxX),
      y: Math.min(Math.max(offset.y, -maxY), maxY),
    }
  }

  const setZoom = (nextScale: number) => {
    const scale = Math.min(Math.max(nextScale, Math.max(0.62, cameraScale - 0.14)), 1.65)
    setZoomDelta(scale - cameraScale)
    setMapOffset((current) => clampOffset(current, scale))
  }

  useEffect(() => {
    setZoomDelta(0)
    setMapOffset((current) => clampOffset(current, cameraScale))
  }, [cameraScale, worldScale])

  useEffect(() => {
    const viewport = mapViewportRef.current
    if (!viewport) {
      return undefined
    }

    const observer = new ResizeObserver(() => {
      setMapOffset((current) => clampOffset(current))
    })
    observer.observe(viewport)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={mapViewportRef}
      className="coin-islands-map relative h-full overflow-hidden bg-primary"
      onWheel={(event) => {
        event.preventDefault()
        setZoom(mapScale + (event.deltaY > 0 ? -0.08 : 0.08))
      }}
    >
      <div
        className={canMoveMap ? 'absolute inset-0 cursor-grab active:cursor-grabbing' : 'absolute inset-0'}
        onDragStart={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          if (!canMoveMap) {
            return
          }
          event.preventDefault()
          if ((event.target as HTMLElement).closest('button, input, select, textarea, a')) {
            return
          }
          dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            x: mapOffset.x,
            y: mapOffset.y,
          }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current
          if (!drag || drag.pointerId !== event.pointerId) {
            return
          }
          setMapOffset(
            clampOffset({
              x: drag.x + event.clientX - drag.startX,
              y: drag.y + event.clientY - drag.startY,
            }),
          )
        }}
        onPointerUp={(event) => {
          if (dragRef.current?.pointerId === event.pointerId) {
            dragRef.current = null
          }
        }}
        style={{
          transform: `translate3d(${mapOffset.x}px, ${mapOffset.y}px, 0) scale(${mapScale})`,
          transformOrigin: '50% 50%',
          height: `${worldScale * 100}%`,
          left: `${(1 - worldScale) * 50}%`,
          top: `${(1 - worldScale) * 50}%`,
          width: `${worldScale * 100}%`,
        }}
      >
        <img
          src={oceanWorldMap}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          decoding="sync"
          draggable={false}
          loading="eager"
        />
      <div className="absolute inset-0 bg-gradient-to-b from-dark-surface/10 via-transparent to-dark-surface/30" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background/70 to-transparent" />
      <div className="absolute -left-16 top-16 h-32 w-52 rounded-full bg-background/55 blur-xl" />
      <div className="absolute -right-20 top-12 h-36 w-60 rounded-full bg-background/55 blur-xl" />
      <div className="absolute bottom-24 left-6 h-28 w-44 rounded-full bg-background/45 blur-xl" />
      <svg
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        viewBox="0 0 864 1393"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {routes.map((route) => (
          <path
            d={route.path}
            fill="none"
            key={route.id}
            stroke={
              route.tone === 'external' ? 'var(--warning)' : 'var(--primary-foreground)'
            }
            strokeDasharray={route.tone === 'external' ? '10 14' : '12 12'}
            strokeLinecap="round"
            strokeWidth="6"
          />
        ))}
      </svg>

      {routes.map((route) => (
        <img
          alt={route.label}
          className="absolute z-30 object-contain drop-shadow"
          decoding="sync"
          draggable={false}
          key={route.id}
          loading="eager"
          src={route.boat}
          style={route.boatStyle}
        />
      ))}

      {laidOutIslands.map((island) => (
        <button
          aria-label={island.name}
          className="group absolute z-40 flex flex-col items-center text-left transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          key={island.id}
          onClick={(event) => onSelectIsland(selectionFromElement(island, event.currentTarget))}
          style={{
            left: `${island.x}%`,
            top: `${island.y}%`,
            width: `${islandRenderWidth(island, worldScale, cameraScale)}%`,
          }}
          type="button"
        >
          <span className="mb-1.5 max-w-[150%] rounded-lg border border-primary/30 bg-dark-surface/84 px-2.5 py-1.5 text-primary-foreground shadow-[var(--shadow-card)] backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
            <span className="block max-w-32 truncate text-caption font-black leading-5 sm:max-w-36 sm:text-body-sm">
              {island.name}
            </span>
          </span>
          <img
            src={island.sprite}
            alt=""
            className="w-full object-contain drop-shadow-lg"
            decoding="sync"
            draggable={false}
            loading="eager"
          />
        </button>
      ))}

      {laidOutIslands.length === 0 ? (
        <div className="absolute left-1/2 top-[34%] z-40 w-[76%] -translate-x-1/2 rounded-2xl border border-[#f7d48c]/50 bg-[#2b1608]/78 px-4 py-4 text-center text-[#ffe9a8] shadow-[0_8px_0_rgba(55,28,8,0.45)] backdrop-blur-sm">
          <div className="text-body-md font-bold">还没有岛屿钱包</div>
          <div className="mt-2 text-caption leading-5 opacity-90">
            点击码头或帆船会先创建你的第一座岛屿。
          </div>
        </div>
      ) : null}
      <button
        aria-label="收款码头"
        className="coin-dock-action group absolute right-[3%] top-[8%] z-50 w-[22%] border-0 bg-transparent p-0 text-primary-foreground drop-shadow-[0_16px_22px_rgba(0,0,0,0.48)] transition-transform hover:-translate-y-1 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onOpenReceive}
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >
        <img
          src={dockIslandAction}
          alt=""
          className="w-full object-contain"
          decoding="sync"
          draggable={false}
          loading="eager"
        />
        <span className="absolute left-1/2 top-[78%] -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-[#f7d48c]/75 bg-[#2b1608]/88 px-3 py-1.5 text-body-sm font-black text-[#ffe9a8] shadow-[0_4px_0_rgba(55,28,8,0.65),0_10px_18px_rgba(0,0,0,0.35)] opacity-100 transition-opacity group-hover:opacity-100">
          收款码头
        </span>
      </button>
      <button
        aria-label="转账船坞"
        className="coin-sail-action group absolute z-50 w-[15%] border-0 bg-transparent p-0 text-primary-foreground drop-shadow-[0_14px_18px_rgba(0,0,0,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onOpenSend}
        onPointerDown={(event) => event.stopPropagation()}
        ref={sailboatRef}
        type="button"
      >
        <img
          src={sailboatAction}
          alt=""
          className="w-full object-contain"
          decoding="sync"
          draggable={false}
          loading="eager"
        />
        <span className="absolute left-1/2 top-[77%] -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-[#f7d48c]/75 bg-[#2b1608]/88 px-3 py-1.5 text-body-sm font-black text-[#ffe9a8] shadow-[0_4px_0_rgba(55,28,8,0.65),0_10px_18px_rgba(0,0,0,0.35)] opacity-100 transition-opacity group-hover:opacity-100">
          转账船坞
        </span>
      </button>
      <WeatherLayer weather={weather} />
      </div>
      <img
        src={compass}
        alt="航海罗盘"
        className="pointer-events-none absolute left-4 top-16 z-[70] w-[14%] opacity-95 drop-shadow"
        decoding="sync"
        draggable={false}
        loading="eager"
      />
      <div className="absolute bottom-28 right-4 z-[70] grid gap-2">
        <button
          className="grid size-9 place-items-center rounded-md border border-[#f7d48c]/50 bg-[#2b1608]/78 text-body-md font-bold text-[#ffe9a8]"
          onClick={() => setZoom(mapScale + 0.12)}
          type="button"
        >
          +
        </button>
        <button
          className="grid size-9 place-items-center rounded-md border border-[#f7d48c]/50 bg-[#2b1608]/78 text-body-md font-bold text-[#ffe9a8]"
          onClick={() => setZoom(mapScale - 0.12)}
          type="button"
        >
          -
        </button>
      </div>
    </div>
  )
}

const weatherWeights: WeatherKind[] = ['sunny', 'sunny', 'rain', 'storm']

function nextWeatherKind(current?: WeatherKind): WeatherKind {
  const pick = weatherWeights[Math.floor(Math.random() * weatherWeights.length)] ?? 'sunny'
  if (pick === current && Math.random() > 0.35) {
    return nextWeatherKind(current)
  }
  return pick
}

function nextWeatherEvent(id: number, kind: WeatherKind): WeatherEvent {
  return {
    id,
    kind,
    x: 13 + Math.random() * 74,
    y: 12 + Math.random() * 66,
    size: 18 + Math.random() * 4,
    durationMs: 5200 + Math.floor(Math.random() * 2400),
  }
}

function useWeatherCycle() {
  const [weather, setWeather] = useState<WeatherEvent | null>(null)

  useEffect(() => {
    let stopped = false
    let timeout = 0
    let id = 0
    let activeKind = nextWeatherKind()
    let nextKindAt = Date.now() + 30 * 60 * 1000 + Math.floor(Math.random() * 30 * 60 * 1000)

    const schedule = () => {
      timeout = window.setTimeout(
        () => {
          if (stopped) {
            return
          }
          if (Date.now() >= nextKindAt) {
            activeKind = nextWeatherKind(activeKind)
            nextKindAt = Date.now() + 30 * 60 * 1000 + Math.floor(Math.random() * 30 * 60 * 1000)
          }
          const event = nextWeatherEvent(id, activeKind)
          id += 1
          setWeather(event)
          window.setTimeout(() => {
            if (!stopped) {
              setWeather((current) => (current?.id === event.id ? null : current))
            }
          }, event.durationMs)
          schedule()
        },
        4500 + Math.floor(Math.random() * 8500),
      )
    }

    schedule()
    return () => {
      stopped = true
      window.clearTimeout(timeout)
    }
  }, [])

  return weather
}

function WeatherLayer({ weather }: { weather: WeatherEvent | null }) {
  if (!weather) {
    return null
  }

  const weatherSprites: Record<WeatherKind, string> = {
    sunny: sunCloudsWeather,
    rain: rainCloudsWeather,
    storm: stormLightningWeather,
  }

  return (
    <img
      alt=""
      className="coin-weather-event pointer-events-none absolute z-[60] object-contain drop-shadow-[0_10px_16px_rgba(8,33,70,0.25)]"
      decoding="async"
      draggable={false}
      key={weather.id}
      src={weatherSprites[weather.kind]}
      style={{
        animationDuration: `${weather.durationMs}ms`,
        left: `${weather.x}%`,
        top: `${weather.y}%`,
        width: `${weather.size}%`,
      }}
    />
  )
}

function useSailboatMotion(islands: Island[]) {
  const [element, setElement] = useState<HTMLButtonElement | null>(null)
  const motionRef = useRef({
    facing: 1,
    lastTime: 0,
    vx: 0.15,
    vy: 0.09,
    x: 34,
    y: 40,
  })
  const islandsRef = useRef(islands)

  useEffect(() => {
    islandsRef.current = islands
  }, [islands])

  useEffect(() => {
    if (!element) {
      return undefined
    }

    const bounds = {
      maxX: 79,
      maxY: 73,
      minX: 4,
      minY: 15,
    }

    const tick = () => {
      const time = performance.now()
      const current = motionRef.current
      const elapsed = current.lastTime ? Math.min((time - current.lastTime) / 1000, 0.12) : 0
      current.lastTime = time

      let nextX = current.x + current.vx * elapsed
      let nextY = current.y + current.vy * elapsed
      let nextVx = current.vx
      let nextVy = current.vy
      let bounced = false

      if (nextX < bounds.minX || nextX > bounds.maxX) {
        nextVx *= -1
        nextX = Math.min(Math.max(nextX, bounds.minX), bounds.maxX)
        bounced = true
      }

      if (nextY < bounds.minY || nextY > bounds.maxY) {
        nextVy *= -1
        nextY = Math.min(Math.max(nextY, bounds.minY), bounds.maxY)
        bounced = true
      }

      const boatCenter = { x: nextX + 7.5, y: nextY + 6 }
      for (const island of islandsRef.current) {
        const islandCenter = {
          x: island.x + island.width * 0.52,
          y: island.y + island.width * 0.34,
        }
        const dx = boatCenter.x - islandCenter.x
        const dy = boatCenter.y - islandCenter.y
        const distance = Math.hypot(dx, dy)
        const radius = island.width * 0.38 + 6

        if (distance < radius) {
          const safeDistance = distance || 1
          const normalX = dx / safeDistance
          const normalY = dy / safeDistance
          const dot = nextVx * normalX + nextVy * normalY
          nextVx -= 2 * dot * normalX
          nextVy -= 2 * dot * normalY
          nextX += normalX * (radius - distance + 1.2)
          nextY += normalY * (radius - distance + 1.2)
          bounced = true
          break
        }
      }

      const speed = Math.hypot(nextVx, nextVy) || 0.18
      current.vx = (nextVx / speed) * 0.18
      current.vy = (nextVy / speed) * 0.18
      current.x = Math.min(Math.max(nextX, bounds.minX), bounds.maxX)
      current.y = Math.min(Math.max(nextY, bounds.minY), bounds.maxY)
      current.facing = current.vx < 0 ? -1 : 1

      element.style.setProperty('--sail-x', `${current.x}%`)
      element.style.setProperty('--sail-y', `${current.y}%`)
      element.style.setProperty('--sail-facing', String(current.facing))
    }

    element.style.setProperty('--sail-x', `${motionRef.current.x}%`)
    element.style.setProperty('--sail-y', `${motionRef.current.y}%`)
    element.style.setProperty('--sail-facing', String(motionRef.current.facing))
    const interval = window.setInterval(tick, 120)
    return () => window.clearInterval(interval)
  }, [element])

  return setElement
}

function IslandDetailLayer({
  selection,
  onClose,
  onRename,
}: {
  selection: IslandDetailSelection | null
  onClose: () => void
  onRename: (islandId: string, name: string) => void
}) {
  const [draftName, setDraftName] = useState('')

  useEffect(() => {
    setDraftName(selection?.island.name ?? '')
  }, [selection?.island.id, selection?.island.name])

  if (!selection) {
    return null
  }

  const { island, origin } = selection
  const totalUsd = formatUsdValue(islandUsdValue(island))
  const balances = island.tokenBalances ?? []
  const background = islandDetailBackgrounds[island.level]

  return (
    <div
      className="island-detail-scene absolute inset-0 z-[85] overflow-hidden text-[#3b2615]"
      style={
        {
          '--origin-x': `${origin.x}%`,
          '--origin-y': `${origin.y}%`,
        } as CSSProperties
      }
    >
      <img
        src={background}
        alt=""
        className="island-detail-bg absolute inset-0 z-10 h-full w-full object-cover"
        decoding="sync"
        draggable={false}
        loading="eager"
      />
      <button
        aria-label="关闭岛屿详情"
        className="absolute right-5 top-5 z-30 grid size-9 place-items-center rounded-md border-2 border-[#7a441c]/70 bg-[#b8742a]/95 text-title-sm font-black text-[#fff0b8] shadow-[0_3px_0_rgba(76,39,14,0.48)]"
        onClick={onClose}
        type="button"
      >
        ×
      </button>
      <img
        src={island.sprite}
        alt=""
        className="island-detail-focus absolute z-0 object-contain drop-shadow-[0_18px_22px_rgba(10,36,70,0.32)]"
        decoding="sync"
        draggable={false}
        loading="eager"
      />
      <div className="island-detail-card no-scrollbar absolute z-20 overflow-y-auto px-4 py-2">
        <div className="mb-3 grid gap-1 text-center">
          <div>
            <div className="text-caption font-black text-[#80501f]">{levelLabels[island.level]}</div>
            <h2 className="mt-1 text-title-sm font-black text-[#2f1b0b]">{island.name}</h2>
            <div className="mt-1 text-title-md font-black text-[#1267bd]">{totalUsd}</div>
          </div>
        </div>

        <form
          className="mb-3 rounded-lg border border-[#9b6330]/30 bg-[#fff4cf]/42 p-3"
          onSubmit={(event) => {
            event.preventDefault()
            onRename(island.id, draftName)
          }}
        >
          <label className="text-caption font-black text-[#80501f]" htmlFor="island-name-input">
            更改岛名
          </label>
          <div className="mt-2 flex gap-2">
            <Input
              className="h-9 rounded-md border-[#9b6330]/38 bg-[#fff8df]/70 px-2 text-body-sm font-black text-[#2f1b0b] placeholder:text-[#9a6a38]"
              id="island-name-input"
              maxLength={12}
              onChange={(event) => setDraftName(event.target.value)}
              value={draftName}
            />
            <Button className="h-9 shrink-0 px-3 text-caption" size="sm" type="submit">
              保存
            </Button>
          </div>
        </form>

        <div className="break-all rounded-md border border-[#9b6330]/30 bg-[#fff4cf]/45 px-3 py-2 text-caption font-black leading-5">
          {island.address}
        </div>

        <div className="mt-3 rounded-lg border border-[#9b6330]/30 bg-[#fff4cf]/35 p-3">
          <div className="text-body-sm font-black">钱包资产</div>
          <div className="mt-2 grid gap-2">
            {balances.length > 0 ? balances.map((balance) => (
              <div
                className="flex items-center justify-between rounded-md border border-[#9b6330]/24 bg-[#fff8df]/48 px-3 py-2"
                key={balance.symbol}
              >
                <span className="text-body-sm font-black">{balance.symbol}</span>
                <span className="text-body-md font-black">{balance.value}</span>
              </div>
            )) : (
              <div className="rounded-md border border-[#9b6330]/24 bg-[#fff8df]/48 px-3 py-2 text-caption font-black">
                暂无链上资产
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 rounded-md border border-[#9b6330]/24 bg-[#fff8df]/40 px-3 py-2 text-caption font-black leading-5">
          {island.status}
        </div>
      </div>
    </div>
  )
}
function WalletModalLayer({
  activeModal,
  draft,
  islands,
  receiveAddress,
  receiveChain,
  receiveError,
  receiveIslandId,
  receiveToken,
  sendForm,
  signingState,
  onClose,
  onConfirmCreate,
  onDraftNameChange,
  onReceiveChainChange,
  onReceiveIslandChange,
  onReceiveTokenChange,
  onSendFormChange,
  onSubmitTransfer,
}: {
  activeModal: WalletModal
  draft: WalletDraft | null
  islands: Island[]
  receiveAddress: string
  receiveChain: string
  receiveError: string
  receiveIslandId: string
  receiveToken: string
  sendForm: SendFormState
  signingState: SigningState
  onClose: () => void
  onConfirmCreate: () => void
  onDraftNameChange: (name: string) => void
  onReceiveChainChange: (chain: string) => void
  onReceiveIslandChange: (id: string) => void
  onReceiveTokenChange: (token: string) => void
  onSendFormChange: Dispatch<SetStateAction<SendFormState>>
  onSubmitTransfer: () => void
}) {
  const [renderedModal, setRenderedModal] = useState(activeModal)
  const closing = !activeModal && renderedModal

  useEffect(() => {
    if (activeModal) {
      setRenderedModal(activeModal)
      return
    }

    if (!renderedModal) {
      return undefined
    }

    const timeout = window.setTimeout(() => setRenderedModal(null), 280)
    return () => window.clearTimeout(timeout)
  }, [activeModal, renderedModal])

  if (!renderedModal) {
    return null
  }

  const receiveIsland = islands.find((island) => island.id === receiveIslandId) ?? islands[0]
  const visibleReceiveAddress = receiveAddress || receiveIsland?.address || ''
  const receiveTokenChoices = receiveTokensFor(receiveChain)
  const visibleReceiveToken = receiveTokenChoices.includes(receiveToken)
    ? receiveToken
    : (receiveTokenChoices[0] ?? defaultToken)
  const qrPayload = receivePayload(visibleReceiveAddress)
  const modalKind = activeModal ?? renderedModal

  return (
    <div className="absolute inset-0 z-[80] flex items-start justify-center overflow-hidden bg-dark-surface/50 p-0 backdrop-blur-sm">
      <div
        className={
          closing
            ? 'wallet-scroll-panel wallet-scroll-panel-close relative max-w-none overflow-hidden text-[#3b2615]'
            : 'wallet-scroll-panel wallet-scroll-panel-open relative max-w-none overflow-hidden text-[#3b2615]'
        }
      >
        <img
          src={scrollPanel}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />
        <div className="relative z-10 mx-auto flex h-full w-[62%] flex-col px-1 pb-[10%] pt-[20%]">
        <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
          <div>
            <div className="text-caption font-semibold uppercase tracking-wider text-[#8c5524]">
              {modalKind === 'create'
                ? '创建钱包'
                : modalKind === 'send'
                  ? '转账船坞'
                  : '收款码头'}
            </div>
            <h2 className="mt-1 text-title-sm font-bold text-[#3b2615]">
              {modalKind === 'create'
                ? '生成新岛屿钱包'
                : modalKind === 'send'
                  ? '发起一笔航海转账'
                  : '选择钱包收款'}
            </h2>
          </div>
          <Button
            aria-label="关闭弹窗"
            className="bg-[#7b4a23]/15 text-[#3b2615] hover:bg-[#7b4a23]/25"
            onClick={onClose}
            size="icon-sm"
            variant="ghost"
          >
            ×
          </Button>
        </div>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
        {modalKind === 'create' && draft ? (
          <div className="space-y-4 pb-2">
            <label className="block">
              <span className="mb-2 block text-body-sm font-semibold text-[#3b2615]">岛屿名称</span>
              <Input
                className="border-[#9b6330]/40 bg-[#fff8df]/75 text-[#3b2615] placeholder:text-[#8c5524]/70"
                value={draft.name}
                onChange={(event) => onDraftNameChange(event.target.value)}
              />
            </label>
            <div className="rounded-2xl border border-[#9b6330]/45 bg-[#fff3cf]/45 p-4">
              <div className="text-body-sm font-bold text-[#3b2615]">SaferPro 本地助记词</div>
              {draft.status === 'loading' ? (
                <div className="mt-3 rounded-xl border border-[#9b6330]/35 bg-[#fff8df]/65 px-3 py-4 text-body-sm text-[#6b4a24]">
                  正在调用 tcx-wasm 生成浏览器本地 keystore...
                </div>
              ) : null}
              {draft.status === 'error' ? (
                <div className="mt-3 rounded-xl border border-destructive/40 bg-error-surface px-3 py-4 text-body-sm font-semibold text-error-text">
                  {draft.error}
                </div>
              ) : null}
              {draft.status === 'ready' ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {draft.mnemonic.map((word, index) => (
                    <div
                    className="rounded-xl border border-[#9b6330]/35 bg-[#fff8df]/65 px-3 py-2 text-caption font-semibold text-[#3b2615]"
                      key={`${word}-${index}`}
                    >
                      {index + 1}. {word}
                    </div>
                  ))}
                </div>
              ) : null}
              <p className="mt-3 text-caption leading-5 text-[#6b4a24]">
                仅用于活动作品演示。不要导入真实助记词，也不要把大额资产转入演示钱包。
              </p>
            </div>
            <Button className="w-full" disabled={draft.status !== 'ready'} onClick={onConfirmCreate}>
              已备份，创建岛屿钱包
            </Button>
          </div>
        ) : null}

        {modalKind === 'send' ? (
          <div className="space-y-4 pb-2">
            <div className="rounded-xl border border-[#9b6330]/30 bg-[#fff8df]/56 px-3 py-2 text-caption font-black text-[#6b4a24]">
              当前余额：{tokenBalanceLabel(
                islands.find((island) => island.id === sendForm.fromIslandId),
                sendForm.token,
              )}
            </div>
            <SelectField
              label="付款岛屿"
              value={sendForm.fromIslandId}
              onChange={(value) => onSendFormChange((form) => ({ ...form, fromIslandId: value }))}
              options={islands.map((island) => ({
                label: island.name,
                value: island.id,
              }))}
            />
            <div className="grid gap-3">
              <SelectField
                label="链"
                value={sendForm.chain}
                onChange={(value) =>
                  onSendFormChange((form) => ({
                    ...form,
                    chain: value,
                    token: transferTokensFor(value)[0] ?? defaultToken,
                  }))
                }
                options={chains.map((chain) => ({ label: chain, value: chain }))}
              />
              <SelectField
                label="代币"
                value={sendForm.token}
                onChange={(value) => onSendFormChange((form) => ({ ...form, token: value }))}
                options={transferTokensFor(sendForm.chain).map((token) => ({
                  label: token,
                  value: token,
                }))}
              />
            </div>
            <label className="block">
              <span className="mb-2 block text-body-sm font-semibold text-[#3b2615]">收款地址</span>
              <Input
                className="border-[#9b6330]/40 bg-[#fff8df]/75 text-[#3b2615] placeholder:text-[#8c5524]/70"
                placeholder="输入收款钱包地址"
                value={sendForm.toAddress}
                onChange={(event) =>
                  onSendFormChange((form) => ({ ...form, toAddress: event.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-body-sm font-semibold text-[#3b2615]">数量</span>
              <Input
                className="border-[#9b6330]/40 bg-[#fff8df]/75 text-[#3b2615] placeholder:text-[#8c5524]/70"
                inputMode="decimal"
                placeholder="0.00"
                value={sendForm.amount}
                onChange={(event) =>
                  onSendFormChange((form) => ({ ...form, amount: event.target.value }))
                }
              />
            </label>
            {signingState.status === 'error' ? (
              <div className="rounded-2xl border border-destructive/40 bg-error-surface p-3 text-caption font-semibold text-error-text">
                {signingState.error}
              </div>
            ) : null}
            {signingState.status === 'signing' ? (
              <div className="rounded-2xl border border-[#9b6330]/35 bg-[#fff8df]/65 p-3 text-caption text-[#6b4a24]">
                正在调用 tcx-wasm 生成本地签名...
              </div>
            ) : null}
            <div className="rounded-xl border border-[#9b6330]/30 bg-[#fff8df]/56 px-3 py-2 text-caption font-black text-[#6b4a24]">
              当前使用代币：{sendForm.token}
            </div>
            <Button className="w-full" onClick={onSubmitTransfer}>
              签名 / 广播并写入航线
            </Button>
          </div>
        ) : null}

        {modalKind === 'receive' && receiveIsland ? (
          <div className="space-y-4 pb-2">
            <SelectField
              label="收款岛屿"
              value={receiveIsland.id}
              onChange={onReceiveIslandChange}
              options={islands.map((island) => ({
                label: `${island.name} · ${island.address}`,
                value: island.id,
              }))}
            />
            <SelectField
              label="收款链"
              value={receiveChain}
              onChange={onReceiveChainChange}
              options={chains.map((chain) => ({ label: chain, value: chain }))}
            />
            <SelectField
              label="收款代币"
              value={visibleReceiveToken}
              onChange={onReceiveTokenChange}
              options={receiveTokenChoices.map((token) => ({ label: token, value: token }))}
            />
            <div className="grid gap-4">
              <ReceiveQrCode value={qrPayload} />
              {receiveError ? (
                <p className="text-caption font-semibold leading-5 text-warning">
                  {receiveError}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
        </div>
        </div>
      </div>
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ label: string; value: string }>
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-body-sm font-semibold text-[#3b2615]">{label}</span>
      <select
        className="h-12 w-full rounded-md border border-[#9b6330]/40 bg-[#fff8df]/75 px-4 text-body-md text-[#3b2615] outline-none transition-[color,box-shadow] focus-visible:border-[#8c5524] focus-visible:ring-3 focus-visible:ring-[#8c5524]/25"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function ReceiveQrCode({ value }: { value: string }) {
  if (!value) {
    return (
      <div className="mx-auto grid w-full justify-items-center gap-2">
        <div className="grid size-40 place-items-center rounded-lg border-2 border-[#7a441c]/60 bg-[#fff8df] p-4 text-center text-caption font-bold leading-5 text-[#6b4a24] shadow-[inset_0_0_0_2px_rgba(255,238,184,0.7),0_4px_0_rgba(89,45,16,0.22)]">
          当前链没有可扫码地址
        </div>
      </div>
    )
  }

  const qr = qrcode(0, 'M')
  qr.addData(value)
  qr.make()
  const qrSvg = qr.createSvgTag(5, 8, '收款二维码', value)

  return (
    <div className="mx-auto grid w-full justify-items-center gap-2">
      <div className="rounded-lg border-2 border-[#7a441c]/60 bg-[#fff8df] p-3 shadow-[inset_0_0_0_2px_rgba(255,238,184,0.7),0_4px_0_rgba(89,45,16,0.22)]">
        <div
          aria-label="收款二维码"
          className="size-40 bg-white [&_svg]:h-full [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
      </div>
      <div className="max-w-full break-all rounded-md border border-[#9b6330]/35 bg-[#fff8df]/65 px-3 py-2 text-caption font-bold leading-5 text-[#3b2615]">
        {value}
      </div>
    </div>
  )
}

function ExploreView({
  coins,
  dailyQuests,
  equipped,
  onClaimQuest,
  unlocked,
  onSkinAction,
}: {
  coins: number
  dailyQuests: DailyQuestState
  equipped: Partial<Record<IslandLevel, string>>
  onClaimQuest: (questId: string) => void
  unlocked: string[]
  onSkinAction: (item: SkinItem) => void
}) {
  const activeQuests = dailyQuests.activeIds
    .map((id) => exploreQuestById.get(id))
    .filter((quest): quest is ExploreQuest => Boolean(quest))

  return (
    <OceanPage className="no-scrollbar h-full overflow-y-auto p-4 pb-28 sm:p-6">
      <PanelHeader
        eyebrow="玩法中心"
        title="探索与装饰"
        description="通过交易、确认和风险识别获得海岛币，用来兑换装饰点缀岛屿。"
      />
      <div className="mt-5 grid gap-4">
        <div className="rounded-2xl border border-white/50 bg-white/24 p-4 shadow-[0_10px_28px_rgba(93,62,28,0.14),inset_0_1px_0_rgba(255,255,255,0.44)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className="text-body-md font-bold text-foreground">今日任务</div>
            <Badge variant="primary">{coins.toLocaleString('en-US')} 岛币</Badge>
          </div>
          <div className="mt-1 text-caption font-semibold text-muted-foreground">
            每天 12:00 随机刷新 4 个任务，完成后当天只能领取一次。
          </div>
          <div className="mt-4 space-y-3">
            {activeQuests.map((quest) => {
              const isComplete = (dailyQuests.progress[quest.id] ?? 0) >= 1
              const isClaimed = dailyQuests.claimed.includes(quest.id)
              const status = isClaimed ? '已领取' : isComplete ? '可领取' : '进行中'

              return (
              <div className="rounded-xl border border-white/45 bg-white/22 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.38)] backdrop-blur-md" key={quest.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-body-md font-bold text-foreground">{quest.title}</div>
                    <p className="mt-1 text-body-sm text-muted-foreground">{quest.detail}</p>
                  </div>
                  <Badge variant={isComplete && !isClaimed ? 'success' : 'neutral'}>
                    {status}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-body-sm font-bold text-primary">+{quest.reward} 岛币</div>
                    <div className="mt-1 text-caption font-semibold text-muted-foreground">
                      {quest.difficulty === 'easy' ? '轻松任务' : '困难任务'} · {quest.trigger === 'wallet' ? '钱包操作' : '交易完成'}
                    </div>
                  </div>
                  <Button
                    className="h-8 px-3 text-caption"
                    disabled={!isComplete || isClaimed}
                    onClick={() => onClaimQuest(quest.id)}
                    size="sm"
                    variant={isComplete && !isClaimed ? 'default' : 'secondary'}
                  >
                    {isClaimed ? '已领取' : isComplete ? '领取' : '未完成'}
                  </Button>
                </div>
              </div>
              )
            })}
          </div>
        </div>
        <SkinMarket
          coins={coins}
          equipped={equipped}
          series={skinSeries}
          unlocked={unlocked}
          onSkinAction={onSkinAction}
        />
      </div>
    </OceanPage>
  )
}

function SkinMarket({
  coins,
  equipped,
  series,
  unlocked,
  onSkinAction,
}: {
  coins: number
  equipped: Partial<Record<IslandLevel, string>>
  series: SkinSeries[]
  unlocked: string[]
  onSkinAction: (item: SkinItem) => void
}) {
  return (
    <section className="skin-market-panel rounded-2xl border-2 border-[#ff9fcf]/45 p-3 shadow-[0_6px_0_rgba(30,13,56,0.45),inset_0_0_0_1px_rgba(255,255,255,0.16)]">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#ffc1df]/55 bg-[#111b4c]/52 px-3 py-2 text-[#ffe5f3] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm">
        <div>
          <div className="text-body-md font-black">节日岛屿皮肤市场</div>
          <div className="mt-1 text-caption font-bold opacity-85">同系列三格同排，每个岛屿皮肤独立购买并永久解锁。</div>
        </div>
        <div className="shrink-0 rounded-md border border-[#ffc1df]/55 bg-[#10133a]/68 px-3 py-2 text-caption font-black text-[#ffd7ec]">
          {coins.toLocaleString('en-US')} 岛币
        </div>
      </div>
      <div className="mt-3 grid gap-3">
        {series.map((group) => (
          <article
            className="rounded-xl border border-[#ffd4ec]/35 bg-[#0f1b4c]/42 p-3 text-[#ffe8f5] backdrop-blur-sm"
            key={group.id}
          >
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <div className="text-body-md font-black">{group.name}</div>
                <p className="mt-1 text-caption font-bold leading-5 text-[#d8dcff]">
                  {group.description}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {group.items.map((item) => {
                const isUnlocked = unlocked.includes(item.id)
                const isEquipped = equipped[item.level] === item.id
                const disabled = isEquipped || (!isUnlocked && coins < item.price)
                const buttonLabel = isEquipped
                  ? '使用中'
                  : isUnlocked
                    ? '使用'
                    : coins < item.price
                      ? '不足'
                      : '购买'

                return (
                  <div
                    className="skin-item-card flex min-w-0 flex-col rounded-xl border-2 border-[#ff9fcf]/58 bg-[#f49ac2]/82 p-2 text-[#24102e] shadow-[0_4px_0_rgba(98,31,82,0.36)]"
                    key={item.id}
                  >
                    <div className="skin-preview-ocean grid aspect-square place-items-center overflow-hidden rounded-lg border-2 border-[#ffd4ec]/72 bg-[#133d69]">
                      <img
                        src={item.image}
                        alt=""
                        className="h-[116%] w-[116%] object-contain drop-shadow-[0_8px_8px_rgba(34,15,64,0.32)]"
                        draggable={false}
                        loading="eager"
                      />
                    </div>
                    <div className="mt-2 min-h-[44px]">
                      <div className="text-caption font-black leading-4">{item.name}</div>
                      <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-4 text-[#5b2754]">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-2 text-caption font-black text-[#173d7a]">
                      {item.price.toLocaleString('en-US')} 岛币
                    </div>
                    <Button
                      className="mt-2 h-8 w-full px-2 text-[11px]"
                      disabled={disabled}
                      onClick={() => onSkinAction(item)}
                      size="sm"
                      variant={isUnlocked ? 'secondary' : 'default'}
                    >
                      {buttonLabel}
                    </Button>
                  </div>
                )
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function ProfileView({ hudStats }: { hudStats: HudStat[] }) {
  return (
    <OceanPage className="no-scrollbar h-full overflow-y-auto p-4 pb-28 sm:p-6">
      <PanelHeader
        eyebrow="我的群岛"
        title="账户统计"
        description="汇总群岛总值、今日航行、账户数量和群岛钥匙状态。"
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {hudStats.map((stat) => (
          <HudCard key={stat.label} stat={stat} />
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <ProfileMetric label="今日净流入" value="+0.00 U" />
        <ProfileMetric label="已点亮等级" value="3 / 4" />
        <ProfileMetric label="可用装饰币" value="486 岛币" />
      </div>
      <div className="mt-5 rounded-2xl border border-white/50 bg-white/24 p-4 shadow-[0_10px_28px_rgba(93,62,28,0.14),inset_0_1px_0_rgba(255,255,255,0.44)] backdrop-blur-md">
        <div className="text-body-md font-bold text-foreground">群岛成长规则</div>
        <p className="mt-2 text-body-sm leading-6 text-muted-foreground">
          账户总价值达到 10U 及以下 / 100U 及以下 / 1000U 以上时，岛屿会对应小型、
          中型和大型三档尺寸进化。交易行为、imKey 确认和风险识别可以额外获得海岛币，
          用于兑换装饰。
        </p>
      </div>
    </OceanPage>
  )
}

function PanelHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="max-w-2xl">
      <div className="text-caption font-semibold uppercase tracking-wider text-primary">
        {eyebrow}
      </div>
      <h2 className="mt-1 text-title-lg font-bold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 text-body-md text-muted-foreground">{description}</p>
    </div>
  )
}

function TransactionRow({
  transaction,
  islands,
  compact = false,
}: {
  transaction: Transaction
  islands: Island[]
  compact?: boolean
}) {
  const island = islands.find((item) => item.id === transaction.islandId)
  const toneClass =
    transaction.direction === 'in'
      ? 'text-success-text'
      : transaction.status === 'risk'
        ? 'text-warning'
        : 'text-foreground'

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface-blue">
        <img src={island?.sprite ?? islandReef} alt="" className="h-10 w-10 object-contain" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-caption font-semibold text-muted-foreground">{transaction.time}</span>
          <Badge variant={transaction.status === 'risk' ? 'neutral' : 'primary'} size="sm">
            {transaction.status === 'pending'
              ? '航行中'
              : transaction.status === 'risk'
                ? '未知海域'
                : '已抵达'}
          </Badge>
        </div>
        <div className="mt-1 truncate text-body-md font-bold text-foreground">
          {transaction.title}
        </div>
        {!compact ? (
          <div className="text-caption text-muted-foreground">对方：{transaction.counterparty}</div>
        ) : null}
      </div>
      <div className={`shrink-0 text-body-md font-bold ${toneClass}`}>{transaction.amount}</div>
    </div>
  )
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/50 bg-white/24 p-4 shadow-[0_10px_28px_rgba(93,62,28,0.14),inset_0_1px_0_rgba(255,255,255,0.44)] backdrop-blur-md">
      <div className="text-caption font-semibold text-[#d7f6ff]">{label}</div>
      <div className="mt-2 text-title-sm font-bold text-[#f2fcff]">{value}</div>
    </div>
  )
}

function BottomNav({
  items,
  activeView,
  onChange,
}: {
  items: Array<{ id: ViewId; label: string; icon: string }>
  activeView: ViewId
  onChange: (view: ViewId) => void
}) {
  return (
    <div className="coin-glass-nav absolute inset-x-2 bottom-3 z-50 grid grid-cols-5 items-end gap-0.5 px-1.5 py-1.5 sm:inset-x-4 sm:bottom-4 sm:gap-1 sm:px-2 sm:py-2">
      {items.map((item) => {
        const active = item.id === activeView

        return (
          <button
            aria-pressed={active}
            className={
              active
                ? 'coin-glass-nav-item coin-glass-nav-item-active flex -translate-y-2 flex-col items-center gap-0.5 px-1 py-1.5 text-[#09334a] sm:-translate-y-3 sm:gap-1 sm:px-2 sm:py-2'
                : 'coin-glass-nav-item flex flex-col items-center gap-0.5 px-1 py-1.5 text-[#315468] transition-transform hover:-translate-y-1 sm:gap-1 sm:px-2 sm:py-2'
            }
            key={item.id}
            onClick={() => onChange(item.id)}
            type="button"
          >
            <span className="coin-glass-icon">
              <img src={item.icon} alt="" className="h-7 w-7 object-contain sm:h-9 sm:w-9" />
            </span>
            <span className="text-caption font-bold sm:text-body-sm">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export { WalletDashboard }
