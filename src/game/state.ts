import { ANIMALS } from './animals'
import { CROPS, emptyCropRecord } from './crops'
import { DECORS, emptyDecorRecord } from './decorations'
import { questById, QUEST_DEFS } from './quests'
import { emptyCraftRecord, RECIPES } from './recipes'
import { isTileUnlocked, nextExpandCost, STORY_BEATS } from './story'
import type {
  AnimalId,
  CraftId,
  CropId,
  DecorId,
  GameState,
  PlotState,
  QuestState,
  StoryStep,
} from './types'

const STORAGE_KEY = 'moonlit-grove-save-v3'
export const COLS = 12
export const ROWS = 10

function emptyPlots(): PlotState[] {
  return Array.from({ length: COLS * ROWS }, () => ({ kind: 'empty' as const }))
}

function initialQuests(): QuestState[] {
  return QUEST_DEFS.map((q) => ({ id: q.id, progress: 0, done: false, claimed: false }))
}

function initialAnimals(): GameState['animals'] {
  return [{ id: 'mothling', happiness: 80, lastProductAt: Date.now(), productReady: false }]
}

const emptyStats = (): GameState['stats'] => ({
  harvests: 0,
  feeds: 0,
  crafts: 0,
  decorsPlaced: 0,
  plants: 0,
  sells: 0,
  expands: 0,
})

export function createInitialState(): GameState {
  const inventory = emptyCropRecord(0)
  inventory.blossom = 5
  inventory.dewmint = 2
  return {
    version: 3,
    coins: 80,
    xp: 0,
    inventory,
    produce: emptyCropRecord(0),
    decorInventory: emptyDecorRecord(0),
    craftInventory: emptyCraftRecord(0),
    selectedSeed: 'blossom',
    selectedDecor: 'mushroom',
    toolMode: 'plant',
    plots: emptyPlots(),
    cols: COLS,
    rows: ROWS,
    animals: initialAnimals(),
    quests: initialQuests(),
    dailyLastClaim: null,
    expandTier: 0,
    storyStep: 'welcome',
    storyFlags: {},
    stats: emptyStats(),
  }
}

function migrateFromLegacy(parsed: Record<string, unknown>): GameState {
  const base = createInitialState()
  const oldPlots = parsed.plots as PlotState[] | undefined
  const oldCols = (parsed.cols as number) ?? 8
  const oldRows = (parsed.rows as number) ?? 6

  if (oldPlots?.length) {
    const plots = emptyPlots()
    for (let r = 0; r < oldRows; r++) {
      for (let c = 0; c < oldCols; c++) {
        const src = r * oldCols + c
        const dst = (r + 1) * COLS + (c + 1)
        if (oldPlots[src]) plots[dst] = oldPlots[src]
      }
    }
    base.plots = plots
  }

  base.coins = (parsed.coins as number) ?? base.coins
  base.xp = (parsed.xp as number) ?? base.xp
  if (parsed.inventory) {
    base.inventory = { ...base.inventory, ...(parsed.inventory as Record<CropId, number>) }
  }
  if (typeof parsed.expandTier === 'number') base.expandTier = parsed.expandTier as number
  else base.expandTier = 2
  if (parsed.storyStep) base.storyStep = parsed.storyStep as StoryStep
  else base.storyStep = 'free'
  return base
}

export function loadState(): GameState {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem('moonlit-grove-save-v2') ??
      localStorage.getItem('moonlit-grove-save-v1')
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as GameState & { version?: number }
    if (parsed.version !== 3) return migrateFromLegacy(parsed as unknown as Record<string, unknown>)
    if (!parsed.plots?.length) return createInitialState()
    const merged: GameState = {
      ...createInitialState(),
      ...parsed,
      version: 3,
      inventory: { ...emptyCropRecord(0), ...parsed.inventory },
      produce: { ...emptyCropRecord(0), ...parsed.produce },
      decorInventory: { ...emptyDecorRecord(0), ...parsed.decorInventory },
      craftInventory: { ...emptyCraftRecord(0), ...parsed.craftInventory },
      stats: { ...emptyStats(), ...parsed.stats },
      storyFlags: { ...parsed.storyFlags },
      expandTier: parsed.expandTier ?? 0,
      storyStep: parsed.storyStep ?? 'welcome',
    }
    syncQuestProgress(merged)
    return merged
  } catch {
    return createInitialState()
  }
}

export function saveState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function levelFromXp(xp: number): number {
  return 1 + Math.floor(xp / 30)
}

export function plotIndex(col: number, row: number, cols: number): number {
  return row * cols + col
}

export function plotUnlocked(state: GameState, index: number): boolean {
  const col = index % state.cols
  const row = Math.floor(index / state.cols)
  return isTileUnlocked(col, row, state.expandTier)
}

export function syncQuestProgress(state: GameState): void {
  const level = levelFromXp(state.xp)
  for (const qs of state.quests) {
    const def = questById(qs.id)
    if (!def || def.unlockLevel > level) continue
    qs.progress = Math.min(def.goal, state.stats[def.stat] ?? 0)
    if (qs.progress >= def.goal) qs.done = true
  }
}

/** Advance story when the player completes the current beat. Returns true if stepped. */
export function advanceStory(state: GameState, from: StoryStep): boolean {
  if (state.storyStep !== from) return false
  const next = STORY_BEATS[from].next
  if (!next) return false
  state.storyStep = next
  return true
}

export function dismissWelcome(state: GameState): boolean {
  if (state.storyStep !== 'welcome') return false
  state.storyStep = 'plant'
  state.storyFlags.welcome = true
  return true
}

export function tickPlots(state: GameState, now: number): { changed: boolean; becameReady: boolean } {
  let changed = false
  let becameReady = false
  state.plots = state.plots.map((plot) => {
    if (plot.kind !== 'growing') return plot
    const def = CROPS[plot.crop]
    if (now - plot.plantedAt >= def.growMs) {
      changed = true
      becameReady = true
      return { kind: 'ready', crop: plot.crop }
    }
    return plot
  })
  if (becameReady) advanceStory(state, 'wait')
  return { changed, becameReady }
}

export function tickAnimals(state: GameState, now: number, dt: number): boolean {
  let changed = false
  const level = levelFromXp(state.xp)
  for (const a of state.animals) {
    const def = ANIMALS[a.id]
    if (def.unlockLevel > level) continue
    a.happiness = Math.max(0, a.happiness - dt * 1.2)
    if (a.productReady) continue
    const rate = a.happiness >= 50 ? 1 : 1.75
    if (now - a.lastProductAt >= def.productIntervalMs * rate) {
      a.productReady = true
      changed = true
    }
  }
  return changed
}

function bumpStat(state: GameState, stat: keyof GameState['stats'], n = 1): void {
  state.stats[stat] += n
  syncQuestProgress(state)
}

export function isCropUnlocked(state: GameState, crop: CropId): boolean {
  return levelFromXp(state.xp) >= CROPS[crop].unlockLevel
}

export function isDecorUnlocked(state: GameState, decor: DecorId): boolean {
  return levelFromXp(state.xp) >= DECORS[decor].unlockLevel
}

export function plantAt(state: GameState, index: number): string | null {
  if (!plotUnlocked(state, index)) return 'Mist still covers this soil — expand the grove first.'
  const plot = state.plots[index]
  if (!plot || plot.kind !== 'empty') return 'That plot is not empty.'
  const seed = state.selectedSeed
  if (!seed) return 'Pick a seed first.'
  if (!isCropUnlocked(state, seed)) return 'Reach a higher grove rank to unlock this crop.'
  if (state.inventory[seed] <= 0) return 'No seeds left — buy more on the right.'

  state.inventory[seed] -= 1
  state.plots[index] = { kind: 'growing', crop: seed, plantedAt: Date.now() }
  bumpStat(state, 'plants')
  advanceStory(state, 'plant')
  return null
}

export function harvestAt(state: GameState, index: number): string | null {
  if (!plotUnlocked(state, index)) return 'Mist still covers this soil.'
  const plot = state.plots[index]
  if (!plot || plot.kind !== 'ready') return 'Nothing ready to harvest here.'
  state.produce[plot.crop] += 1
  state.xp += 4
  state.plots[index] = { kind: 'empty' }
  bumpStat(state, 'harvests')
  advanceStory(state, 'harvest')
  return null
}

export function placeDecorAt(state: GameState, index: number): string | null {
  if (!plotUnlocked(state, index)) return 'Mist still covers this soil — expand the grove first.'
  const plot = state.plots[index]
  if (!plot || plot.kind !== 'empty') return 'Clear soil needed for decorations.'
  const decor = state.selectedDecor
  if (!decor) return 'Pick a decoration first.'
  if (!isDecorUnlocked(state, decor)) return 'Unlock this decoration at a higher rank.'
  if (state.decorInventory[decor] <= 0) return 'Buy decorations from the farm panel first.'

  state.decorInventory[decor] -= 1
  state.plots[index] = { kind: 'decor', decor }
  bumpStat(state, 'decorsPlaced')
  return null
}

export function buySeed(state: GameState, crop: CropId): string | null {
  if (!isCropUnlocked(state, crop)) return 'Locked — level up your grove rank.'
  const def = CROPS[crop]
  if (state.coins < def.seedPrice) return 'Not enough moon coins.'
  state.coins -= def.seedPrice
  state.inventory[crop] += 1
  return null
}

export function buyDecor(state: GameState, decor: DecorId): string | null {
  if (!isDecorUnlocked(state, decor)) return 'Locked — level up your grove rank.'
  const def = DECORS[decor]
  if (state.coins < def.price) return 'Not enough moon coins.'
  state.coins -= def.price
  state.decorInventory[decor] += 1
  return null
}

export function sellProduce(state: GameState, crop: CropId, amount = 1): string | null {
  if (state.produce[crop] < amount) return 'Not enough produce in your cellar.'
  state.produce[crop] -= amount
  state.coins += CROPS[crop].sellPrice * amount
  bumpStat(state, 'sells')
  advanceStory(state, 'earn')
  return null
}

export function sellAllProduce(state: GameState): number {
  let total = 0
  let sold = 0
  for (const id of Object.keys(CROPS) as CropId[]) {
    const n = state.produce[id]
    if (n > 0) {
      total += n * CROPS[id].sellPrice
      sold += n
      state.produce[id] = 0
    }
  }
  state.coins += total
  if (sold > 0) {
    bumpStat(state, 'sells', sold)
    advanceStory(state, 'earn')
  }
  return total
}

export function expandGrove(state: GameState): string | null {
  const cost = nextExpandCost(state.expandTier)
  if (cost === null) return 'The whole grove is already yours.'
  if (state.storyStep !== 'expand' && state.storyStep !== 'free') {
    return 'Finish the earlier magic first — plant, harvest, then earn.'
  }
  if (state.coins < cost) return `Need ${cost}✦ to push back the mist.`
  state.coins -= cost
  state.expandTier += 1
  state.xp += 10
  bumpStat(state, 'expands')
  advanceStory(state, 'expand')
  return null
}

export function craftItem(state: GameState, recipeId: CraftId): string | null {
  const recipe = RECIPES[recipeId]
  if (levelFromXp(state.xp) < recipe.unlockLevel) return 'Recipe locked.'
  for (const [crop, need] of Object.entries(recipe.inputs) as [CropId, number][]) {
    if ((state.produce[crop] ?? 0) < need) return `Need more ${CROPS[crop].name} produce.`
  }
  if (recipe.craftInputs) {
    for (const [item, need] of Object.entries(recipe.craftInputs) as [CraftId, number][]) {
      if ((state.craftInventory[item] ?? 0) < need) return `Need more ${RECIPES[item].name}.`
    }
  }
  for (const [crop, need] of Object.entries(recipe.inputs) as [CropId, number][]) {
    state.produce[crop] -= need
  }
  if (recipe.craftInputs) {
    for (const [item, need] of Object.entries(recipe.craftInputs) as [CraftId, number][]) {
      state.craftInventory[item] -= need
    }
  }
  state.craftInventory[recipeId] += 1
  state.xp += 6
  bumpStat(state, 'crafts')
  return null
}

export function feedAnimal(state: GameState, animalId: AnimalId): string | null {
  const animal = state.animals.find((a) => a.id === animalId)
  if (!animal) return 'Animal not found.'
  if (state.craftInventory.fairyFeed < 1) return 'Craft Fairy Feed in the workshop.'
  state.craftInventory.fairyFeed -= 1
  animal.happiness = 100
  animal.lastProductAt = Date.now() - ANIMALS[animalId].productIntervalMs * 0.5
  bumpStat(state, 'feeds')
  return null
}

export function collectAnimalProduct(state: GameState, animalId: AnimalId): string | null {
  const animal = state.animals.find((a) => a.id === animalId)
  if (!animal?.productReady) return 'Nothing to collect yet.'
  const def = ANIMALS[animalId]
  state.coins += def.productCoins
  state.xp += 5
  animal.productReady = false
  animal.lastProductAt = Date.now()
  return null
}

export function unlockAnimal(state: GameState, animalId: AnimalId): string | null {
  if (state.animals.some((a) => a.id === animalId)) return 'Already in your barn.'
  const def = ANIMALS[animalId]
  if (levelFromXp(state.xp) < def.unlockLevel) return 'Reach a higher rank first.'
  const cost = def.unlockLevel * 45
  if (state.coins < cost) return `Need ${cost}✦ to befriend this animal.`
  state.coins -= cost
  state.animals.push({
    id: animalId,
    happiness: 75,
    lastProductAt: Date.now(),
    productReady: false,
  })
  return null
}

export function claimQuest(state: GameState, questId: string): string | null {
  const qs = state.quests.find((q) => q.id === questId)
  const def = questById(questId)
  if (!qs || !def) return 'Quest not found.'
  if (!qs.done) return 'Quest not finished yet.'
  if (qs.claimed) return 'Reward already claimed.'
  qs.claimed = true
  state.coins += def.rewardCoins
  state.xp += def.rewardXp
  syncQuestProgress(state)
  return null
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function claimDailyGift(state: GameState): string | null {
  const today = todayKey()
  if (state.dailyLastClaim === today) return 'Come back tomorrow for another gift.'
  state.dailyLastClaim = today
  state.coins += 35
  state.inventory.blossom += 2
  state.inventory.dewmint += 1
  state.xp += 8
  return null
}

export function countReady(state: GameState): number {
  return state.plots.filter((p) => p.kind === 'ready').length
}

export function visibleQuests(state: GameState) {
  const level = levelFromXp(state.xp)
  return QUEST_DEFS.filter((q) => q.unlockLevel <= level + 1)
}
