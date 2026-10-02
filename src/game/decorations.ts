import type { DecorDef, DecorId } from './types'

export const DECOR_IDS: DecorId[] = ['lantern', 'mushroom', 'fountain']

export const DECORS: Record<DecorId, DecorDef> = {
  lantern: {
    id: 'lantern',
    name: 'Moon Lantern',
    price: 25,
    unlockLevel: 2,
    color: '#fde68a',
  },
  mushroom: {
    id: 'mushroom',
    name: 'Glow Mushroom',
    price: 18,
    unlockLevel: 1,
    color: '#c4b5fd',
  },
  fountain: {
    id: 'fountain',
    name: 'Pixie Fountain',
    price: 80,
    unlockLevel: 4,
    color: '#67e8f9',
  },
}

export const DECOR_LIST = DECOR_IDS.map((id) => DECORS[id])

export function emptyDecorRecord(defaultValue = 0): Record<DecorId, number> {
  return { lantern: defaultValue, mushroom: defaultValue, fountain: defaultValue }
}
