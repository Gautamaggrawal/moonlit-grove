import type { QuestDef } from './types'

export const QUEST_DEFS: QuestDef[] = [
  {
    id: 'harvest-8',
    title: 'First harvest festival',
    description: 'Gather 8 crops from your grove.',
    goal: 8,
    stat: 'harvests',
    rewardCoins: 40,
    rewardXp: 15,
    unlockLevel: 1,
  },
  {
    id: 'decorate-3',
    title: 'Enchant the clearing',
    description: 'Place 3 decorations on your farm.',
    goal: 3,
    stat: 'decorsPlaced',
    rewardCoins: 35,
    rewardXp: 12,
    unlockLevel: 2,
  },
  {
    id: 'feed-4',
    title: 'Kind keeper',
    description: 'Feed grove animals 4 times.',
    goal: 4,
    stat: 'feeds',
    rewardCoins: 50,
    rewardXp: 18,
    unlockLevel: 2,
  },
  {
    id: 'craft-3',
    title: 'Workshop whispers',
    description: 'Craft 3 items in the workshop.',
    goal: 3,
    stat: 'crafts',
    rewardCoins: 60,
    rewardXp: 20,
    unlockLevel: 3,
  },
  {
    id: 'harvest-25',
    title: 'Grove in bloom',
    description: 'Harvest 25 crops total.',
    goal: 25,
    stat: 'harvests',
    rewardCoins: 120,
    rewardXp: 35,
    unlockLevel: 4,
  },
]

export function questById(id: string): QuestDef | undefined {
  return QUEST_DEFS.find((q) => q.id === id)
}
