export type StoryStep = 'welcome' | 'plant' | 'wait' | 'harvest' | 'earn' | 'expand' | 'free'

export type StoryBeat = {
  id: StoryStep
  title: string
  body: string
  railLabel: string
  next?: StoryStep
}

/** Guided loop: each action unlocks the next chapter. */
export const STORY_BEATS: Record<StoryStep, StoryBeat> = {
  welcome: {
    id: 'welcome',
    title: 'The mist parts…',
    body: 'A sleepy clearing waits under the moon. The grove will wake if you plant the first seed.',
    railLabel: 'Begin',
    next: 'plant',
  },
  plant: {
    id: 'plant',
    title: 'Plant the first spell',
    body: 'Choose Fairy Blossom, then tap an unlocked soil tile. Magic needs a place to take root.',
    railLabel: 'Plant',
    next: 'wait',
  },
  wait: {
    id: 'wait',
    title: 'Let the moonlight work',
    body: 'Crops drink starlight. Watch the ring fill — when they glow, the harvest is near.',
    railLabel: 'Wait',
    next: 'harvest',
  },
  harvest: {
    id: 'harvest',
    title: 'Gather the glow',
    body: 'Tap a shining crop. Harvest fills your cellar — the grove remembers what you gather.',
    railLabel: 'Harvest',
    next: 'earn',
  },
  earn: {
    id: 'earn',
    title: 'Trade for moon coins',
    body: 'Open the Farm panel cellar and sell produce. Coins are the currency of expansion.',
    railLabel: 'Earn',
    next: 'expand',
  },
  expand: {
    id: 'expand',
    title: 'Push back the mist',
    body: 'Spend coins to expand the grove. Locked tiles bloom into new soil — your world grows.',
    railLabel: 'Expand',
    next: 'free',
  },
  free: {
    id: 'free',
    title: 'Keeper of the Grove',
    body: 'The cycle continues: plant, wait, harvest, earn, expand. Animals and crafts await in the barn and workshop.',
    railLabel: 'Live',
  },
}

export const STORY_RAIL: StoryStep[] = ['plant', 'wait', 'harvest', 'earn', 'expand']

export const EXPAND_COSTS = [0, 40, 90, 160, 260] as const

/** Unlock rectangles by tier (inclusive). Grid is 12×10. */
export function unlockBounds(tier: number): { c0: number; c1: number; r0: number; r1: number } {
  const t = Math.max(0, Math.min(4, tier))
  const sizes = [
    { w: 4, h: 4 },
    { w: 6, h: 5 },
    { w: 8, h: 7 },
    { w: 10, h: 9 },
    { w: 12, h: 10 },
  ]
  const { w, h } = sizes[t]
  const c0 = Math.floor((12 - w) / 2)
  const r0 = Math.floor((10 - h) / 2)
  return { c0, c1: c0 + w - 1, r0, r1: r0 + h - 1 }
}

export function isTileUnlocked(col: number, row: number, tier: number): boolean {
  const b = unlockBounds(tier)
  return col >= b.c0 && col <= b.c1 && row >= b.r0 && row <= b.r1
}

export function nextExpandCost(tier: number): number | null {
  if (tier >= 4) return null
  return EXPAND_COSTS[tier + 1]
}
