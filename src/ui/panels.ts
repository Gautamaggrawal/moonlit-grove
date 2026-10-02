import { ANIMALS, ANIMAL_LIST } from '../game/animals'
import { CROP_LIST, CROPS } from '../game/crops'
import { DECORS } from '../game/decorations'
import { RECIPE_LIST, RECIPES } from '../game/recipes'
import { nextExpandCost } from '../game/story'
import { isCropUnlocked, isDecorUnlocked, levelFromXp, visibleQuests } from '../game/state'
import type { CropId, GameState, PanelId } from '../game/types'

export function renderPanel(panel: PanelId, state: GameState): string {
  switch (panel) {
    case 'farm':
      return renderFarmPanel(state)
    case 'barn':
      return renderBarnPanel(state)
    case 'workshop':
      return renderWorkshopPanel(state)
    case 'quests':
      return renderQuestsPanel(state)
  }
}

function renderFarmPanel(state: GameState): string {
  const seed = state.selectedSeed ? CROPS[state.selectedSeed] : null
  const seedLine = seed
    ? `<p class="guide">Selected: <strong>${seed.name}</strong> ×${state.inventory[state.selectedSeed!]} — tap grass to plant</p>`
    : `<p class="guide">Pick a seed below, then tap grass</p>`

  const crops = CROP_LIST.map((c) => {
    const locked = !isCropUnlocked(state, c.id)
    const selected = state.selectedSeed === c.id
    return `
    <article class="crop-row ${selected ? 'selected' : ''} ${locked ? 'locked' : ''}">
      <button type="button" class="crop-select" data-select="${c.id}" ${locked ? 'disabled' : ''}>
        <span class="crop-icon" style="--crop:${c.color}; --glow:${c.glow}"></span>
        <span class="crop-name">${c.name}</span>
        <span class="crop-stock">×${state.inventory[c.id]}</span>
      </button>
      <button type="button" class="crop-buy" data-buy-seed="${c.id}" ${locked ? 'disabled' : ''}>
        ${c.seedPrice}✦
      </button>
    </article>`
  }).join('')

  const cellarCount = CROP_LIST.reduce((n, c) => n + state.produce[c.id], 0)
  const expandCost = nextExpandCost(state.expandTier)
  const canExpand = state.storyStep === 'expand' || state.storyStep === 'free'
  const needSell = state.storyStep === 'earn' || cellarCount > 0
  const needExpand = state.storyStep === 'expand'

  const expandBlock =
    expandCost === null
      ? ''
      : `<button type="button" class="expand-btn ${canExpand ? '' : 'dim'} ${needExpand ? 'pulse-cta' : ''}" data-expand ${canExpand ? '' : 'disabled'}>
          Expand land · ${expandCost}✦
        </button>`

  const mushroom = DECORS.mushroom
  const decorLocked = !isDecorUnlocked(state, 'mushroom')

  return `
    ${seedLine}
    ${expandBlock}
    <h3 class="section-label">Seeds (tap to select)</h3>
    <div class="shop-list">${crops}</div>
    <div class="cellar-bar ${needSell ? 'highlight' : ''}">
      <span>${cellarCount ? `${cellarCount} ready to sell` : 'Nothing to sell yet'}</span>
      <button type="button" class="sell-all-btn ${needSell && cellarCount ? 'pulse-cta' : ''}" data-sell-all ${cellarCount ? '' : 'disabled'}>
        Sell all
      </button>
    </div>
    <button type="button" class="decor-buy-line" data-buy-decor="mushroom" ${decorLocked ? 'disabled' : ''}>
      🍄 Buy decor · ${mushroom.price}✦ (×${state.decorInventory.mushroom})
    </button>
    <button type="button" class="decor-mode-btn ${state.toolMode === 'decorate' ? 'active' : ''}" data-tool="decorate">
      ${state.toolMode === 'decorate' ? 'Decorating on — tap grass' : 'Place decor mode'}
    </button>
  `
}

function renderBarnPanel(state: GameState): string {
  const level = levelFromXp(state.xp)
  const owned = state.animals
    .map((a) => {
      const def = ANIMALS[a.id]
      return `
      <article class="animal-card">
        <div class="animal-head">
          <span class="animal-emoji">${def.emoji}</span>
          <div>
            <strong>${def.name}</strong>
            <span class="muted">${def.productName}</span>
          </div>
        </div>
        <div class="happiness-track"><div class="happiness-fill" style="width:${a.happiness}%"></div></div>
        <p class="animal-status">${a.productReady ? '✦ Product ready!' : 'Resting…'}</p>
        <div class="animal-actions">
          <button type="button" class="mini-btn" data-feed="${a.id}">Feed (1 Fairy Feed)</button>
          <button type="button" class="mini-btn primary" data-collect="${a.id}" ${a.productReady ? '' : 'disabled'}>
            Collect ${def.productCoins}✦
          </button>
        </div>
      </article>`
    })
    .join('')

  const adopt = ANIMAL_LIST.filter((a) => !state.animals.some((x) => x.id === a.id))
    .map((a) => {
      const locked = level < a.unlockLevel
      const cost = a.unlockLevel * 45
      return `
      <button type="button" class="adopt-btn" data-adopt="${a.id}" ${locked ? 'disabled' : ''}>
        ${a.emoji} Befriend ${a.name} · ${cost}✦ (Lv.${a.unlockLevel})
      </button>`
    })
    .join('')

  return `
    <p class="panel-intro">Feed friends with crafted Fairy Feed. Happy animals bring gifts.</p>
    ${owned || '<p class="muted">No animals yet.</p>'}
    <h3 class="section-label">Wild grove</h3>
    ${adopt}
  `
}

function renderWorkshopPanel(state: GameState): string {
  const level = levelFromXp(state.xp)
  return RECIPE_LIST.map((r) => {
    const locked = level < r.unlockLevel
    const inputs = Object.entries(r.inputs)
      .map(([id, n]) => `${n} ${CROPS[id as CropId].name}`)
      .join(', ')
    const extra = r.craftInputs
      ? ` + ${Object.entries(r.craftInputs)
          .map(([id, n]) => `${n} ${RECIPES[id as keyof typeof RECIPES].name}`)
          .join(', ')}`
      : ''
    return `
    <article class="recipe-card ${locked ? 'locked' : ''}">
      <div>
        <strong>${r.name}</strong>
        <p class="muted">${inputs}${extra}</p>
        <span class="chip">Owned: ${state.craftInventory[r.id]}</span>
      </div>
      <button type="button" class="mini-btn primary" data-craft="${r.id}" ${locked ? 'disabled' : ''}>
        Craft (Lv.${r.unlockLevel})
      </button>
    </article>`
  }).join('')
}

function renderQuestsPanel(state: GameState): string {
  return visibleQuests(state)
    .map((def) => {
      const qs = state.quests.find((q) => q.id === def.id)!
      const pct = Math.min(100, (qs.progress / def.goal) * 100)
      return `
    <article class="quest-card ${qs.claimed ? 'claimed' : qs.done ? 'done' : ''}">
      <div class="quest-top">
        <strong>${def.title}</strong>
        <span class="chip">${def.rewardCoins}✦ · ${def.rewardXp} XP</span>
      </div>
      <p class="muted">${def.description}</p>
      <div class="xp-track quest-track"><div class="xp-fill" style="width:${pct}%"></div></div>
      <div class="quest-foot">
        <span>${qs.progress} / ${def.goal}</span>
        <button type="button" class="mini-btn primary" data-claim-quest="${def.id}"
          ${qs.done && !qs.claimed ? '' : 'disabled'}>
          ${qs.claimed ? 'Claimed' : qs.done ? 'Claim' : 'In progress'}
        </button>
      </div>
    </article>`
    })
    .join('')
}
