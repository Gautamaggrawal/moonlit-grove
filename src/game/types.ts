export type CropId = 'blossom' | 'moonberry' | 'starfruit' | 'dewmint' | 'shimmeroot'

export type DecorId = 'lantern' | 'mushroom' | 'fountain'

export type AnimalId = 'mothling' | 'podfox' | 'moonhare'

export type CraftId = 'fairyFeed' | 'glowJam' | 'starDust'

export type ToolMode = 'plant' | 'decorate' | 'harvest'

export type PanelId = 'farm' | 'barn' | 'workshop' | 'quests'

export type StoryStep = 'welcome' | 'plant' | 'wait' | 'harvest' | 'earn' | 'expand' | 'free'

export type PlotState =
  | { kind: 'empty' }
  | { kind: 'growing'; crop: CropId; plantedAt: number }
  | { kind: 'ready'; crop: CropId }
  | { kind: 'decor'; decor: DecorId }

export type AnimalState = {
  id: AnimalId
  happiness: number
  lastProductAt: number
  productReady: boolean
}

export type QuestState = {
  id: string
  progress: number
  done: boolean
  claimed: boolean
}

export type GameState = {
  version: 3
  coins: number
  xp: number
  inventory: Record<CropId, number>
  produce: Record<CropId, number>
  decorInventory: Record<DecorId, number>
  craftInventory: Record<CraftId, number>
  selectedSeed: CropId | null
  selectedDecor: DecorId | null
  toolMode: ToolMode
  plots: PlotState[]
  cols: number
  rows: number
  animals: AnimalState[]
  quests: QuestState[]
  dailyLastClaim: string | null
  /** How much mist has been cleared (0–4). */
  expandTier: number
  storyStep: StoryStep
  /** Steps already celebrated with a story card. */
  storyFlags: Partial<Record<StoryStep, boolean>>
  stats: {
    harvests: number
    feeds: number
    crafts: number
    decorsPlaced: number
    plants: number
    sells: number
    expands: number
  }
}

export type CropDef = {
  id: CropId
  name: string
  growMs: number
  seedPrice: number
  sellPrice: number
  color: string
  glow: string
  unlockLevel: number
}

export type DecorDef = {
  id: DecorId
  name: string
  price: number
  unlockLevel: number
  color: string
}

export type AnimalDef = {
  id: AnimalId
  name: string
  emoji: string
  productName: string
  productCoins: number
  productIntervalMs: number
  unlockLevel: number
}

export type RecipeDef = {
  id: CraftId
  name: string
  unlockLevel: number
  inputs: Partial<Record<CropId, number>>
  craftInputs?: Partial<Record<CraftId, number>>
}

export type QuestDef = {
  id: string
  title: string
  description: string
  goal: number
  stat: keyof GameState['stats']
  rewardCoins: number
  rewardXp: number
  unlockLevel: number
}
