import type { CraftId, RecipeDef } from './types'

export const RECIPE_IDS: CraftId[] = ['fairyFeed', 'glowJam', 'starDust']

export const RECIPES: Record<CraftId, RecipeDef> = {
  fairyFeed: {
    id: 'fairyFeed',
    name: 'Fairy Feed',
    unlockLevel: 2,
    inputs: { blossom: 2, moonberry: 1 },
  },
  glowJam: {
    id: 'glowJam',
    name: 'Glow Jam',
    unlockLevel: 3,
    inputs: { moonberry: 2, dewmint: 2 },
  },
  starDust: {
    id: 'starDust',
    name: 'Star Dust',
    unlockLevel: 4,
    inputs: { starfruit: 1, shimmeroot: 1 },
    craftInputs: { glowJam: 1 },
  },
}

export const RECIPE_LIST = RECIPE_IDS.map((id) => RECIPES[id])

export function emptyCraftRecord(defaultValue = 0): Record<CraftId, number> {
  return { fairyFeed: defaultValue, glowJam: defaultValue, starDust: defaultValue }
}
