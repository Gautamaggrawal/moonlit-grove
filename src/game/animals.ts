import type { AnimalDef, AnimalId } from './types'

export const ANIMAL_IDS: AnimalId[] = ['mothling', 'podfox', 'moonhare']

export const ANIMALS: Record<AnimalId, AnimalDef> = {
  mothling: {
    id: 'mothling',
    name: 'Mothling',
    emoji: '🦋',
    productName: 'Silk dust',
    productCoins: 18,
    productIntervalMs: 45_000,
    unlockLevel: 2,
  },
  podfox: {
    id: 'podfox',
    name: 'Podfox',
    emoji: '🦊',
    productName: 'Ember berry',
    productCoins: 28,
    productIntervalMs: 60_000,
    unlockLevel: 3,
  },
  moonhare: {
    id: 'moonhare',
    name: 'Moonhare',
    emoji: '🐇',
    productName: 'Soft tuft',
    productCoins: 22,
    productIntervalMs: 50_000,
    unlockLevel: 4,
  },
}

export const ANIMAL_LIST = ANIMAL_IDS.map((id) => ANIMALS[id])
