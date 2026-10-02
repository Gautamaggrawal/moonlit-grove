import type { CropDef, CropId } from './types'

export const CROP_IDS: CropId[] = ['blossom', 'moonberry', 'starfruit', 'dewmint', 'shimmeroot']

export const CROPS: Record<CropId, CropDef> = {
  blossom: {
    id: 'blossom',
    name: 'Fairy Blossom',
    growMs: 8_000,
    seedPrice: 5,
    sellPrice: 12,
    color: '#e879f9',
    glow: '#f0abfc',
    unlockLevel: 1,
  },
  moonberry: {
    id: 'moonberry',
    name: 'Moonberry',
    growMs: 18_000,
    seedPrice: 15,
    sellPrice: 35,
    color: '#818cf8',
    glow: '#a5b4fc',
    unlockLevel: 1,
  },
  starfruit: {
    id: 'starfruit',
    name: 'Starfruit',
    growMs: 35_000,
    seedPrice: 40,
    sellPrice: 95,
    color: '#fbbf24',
    glow: '#fde68a',
    unlockLevel: 3,
  },
  dewmint: {
    id: 'dewmint',
    name: 'Dewmint',
    growMs: 14_000,
    seedPrice: 12,
    sellPrice: 28,
    color: '#34d399',
    glow: '#6ee7b7',
    unlockLevel: 2,
  },
  shimmeroot: {
    id: 'shimmeroot',
    name: 'Shimmeroot',
    growMs: 50_000,
    seedPrice: 55,
    sellPrice: 130,
    color: '#f472b6',
    glow: '#fbcfe8',
    unlockLevel: 5,
  },
}

export const CROP_LIST = CROP_IDS.map((id) => CROPS[id])

export function emptyCropRecord(defaultValue = 0): Record<CropId, number> {
  return { blossom: defaultValue, moonberry: defaultValue, starfruit: defaultValue, dewmint: defaultValue, shimmeroot: defaultValue }
}
