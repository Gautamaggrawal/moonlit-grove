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
    title: 'Welcome to your grove',
    body: 'Tap green grass to plant. Tap glowing crops to harvest. Sell for coins, then expand.',
    railLabel: 'Begin',
    next: 'plant',
  },
  plant: {
    id: 'plant',
    title: 'Plant a seed',
    body: 'Tap any green grass tile on the left. Fairy Blossom seeds are already selected.',
    railLabel: 'Plant',
    next: 'wait',
  },
  wait: {
    id: 'wait',
    title: 'Wait for it to grow',
    body: 'Watch the ring above the plant. When the crop sparkles, tap it.',
    railLabel: 'Wait',
    next: 'harvest',
  },
  harvest: {
    id: 'harvest',
    title: 'Harvest',
    body: 'Tap the glowing crop. It goes to your cellar on the right.',
    railLabel: 'Harvest',
    next: 'earn',
  },
  earn: {
    id: 'earn',
    title: 'Sell for coins',
    body: 'Press Sell all in the Farm panel to get moon coins.',
    railLabel: 'Sell',
    next: 'expand',
  },
  expand: {
    id: 'expand',
    title: 'Grow your land',
    body: 'Press Expand to clear the mist and unlock more grass.',
    railLabel: 'Expand',
    next: 'free',
  },
  free: {
    id: 'free',
    title: 'You know the loop',
    body: 'Plant → harvest → sell → expand. Try the barn and craft tabs when you want more.',
    railLabel: 'Play',
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
