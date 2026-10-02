import './style.css'
import { CROPS } from './game/crops'
import { camera, clampCamera, screenToWorld } from './game/camera'
import {
  spawnFloater,
  spawnHarvestSpark,
  tickEffects,
  type Floater,
  type Spark,
} from './game/effects'
import { hitTest, loadAssets, plotCenter, renderFarm, setupCanvas, VIEW_H, VIEW_W, worldSize } from './game/render'
import { STORY_BEATS, STORY_RAIL, unlockBounds } from './game/story'
import {
  buyDecor,
  buySeed,
  claimDailyGift,
  claimQuest,
  collectAnimalProduct,
  craftItem,
  countReady,
  dismissWelcome,
  expandGrove,
  feedAnimal,
  harvestAt,
  levelFromXp,
  loadState,
  placeDecorAt,
  plantAt,
  plotUnlocked,
  saveState,
  sellAllProduce,
  sellProduce,
  tickAnimals,
  tickPlots,
  unlockAnimal,
} from './game/state'
import type { AnimalId, CraftId, CropId, DecorId, PanelId, StoryStep, ToolMode } from './game/types'
import { renderPanel } from './ui/panels'

const canvas = document.querySelector<HTMLCanvasElement>('#farm')!
const ctx = canvas.getContext('2d')!
setupCanvas(canvas, ctx)
const coinsEl = document.querySelector('#coins')!
const coinsPill = document.querySelector<HTMLElement>('#coins-pill')!
const levelEl = document.querySelector('#level')!
const xpFill = document.querySelector<HTMLElement>('#xp-fill')!
const xpText = document.querySelector('#xp-text')!
const toastEl = document.querySelector<HTMLElement>('#toast')!
const panelBody = document.querySelector('#panel-body')!
const panelTitle = document.querySelector('#panel-title')!
const panelSub = document.querySelector('#panel-sub')!
const readyBadge = document.querySelector<HTMLElement>('#ready-badge')!
const dailyBtn = document.querySelector('#daily-btn')!
const storyRail = document.querySelector<HTMLElement>('#story-rail')!
const groveTitle = document.querySelector('#grove-title')!
const playTip = document.querySelector<HTMLElement>('#play-tip')!
const storyModal = document.querySelector<HTMLElement>('#story-modal')!
const storyKicker = document.querySelector('#story-kicker')!
const storyTitle = document.querySelector('#story-title')!
const storyBody = document.querySelector('#story-body')!
const storyContinue = document.querySelector('#story-continue')!

const PANEL_COPY: Record<PanelId, { title: string; sub: string }> = {
  farm: { title: 'Farm', sub: 'Tap grass · tap glow · sell' },
  barn: { title: 'Barn', sub: 'Feed animals for gifts' },
  workshop: { title: 'Craft', sub: 'Turn crops into feed' },
  quests: { title: 'Quests', sub: 'Goals & rewards' },
}

let state = loadState()
let activePanel: PanelId = 'farm'
let lastSave = Date.now()
let hoverIndex: number | null = null
let lastNow = performance.now()
let lastStoryStep: StoryStep = state.storyStep
const floaters: Floater[] = []
const sparks: Spark[] = []

let dragging = false
let dragMoved = false
let dragStart = { x: 0, y: 0, camX: 0, camY: 0 }

function showToast(msg: string, kind: 'info' | 'warn' | 'success' = 'info') {
  toastEl.textContent = msg
  toastEl.dataset.kind = kind
  toastEl.classList.add('visible')
  window.clearTimeout(showToast.tid)
  showToast.tid = window.setTimeout(() => {
    toastEl.classList.remove('visible')
  }, 2800)
}
showToast.tid = 0

function openStoryCard(step: StoryStep): void {
  if (state.storyFlags[step]) return
  const beat = STORY_BEATS[step]
  storyKicker.textContent = step === 'free' ? 'Grove awakened' : 'Moonlit chapter'
  storyTitle.textContent = beat.title
  storyBody.textContent = beat.body
  storyModal.hidden = false
  storyModal.classList.add('open')
  document.body.classList.add('story-open')
  state.storyFlags[step] = true
}

function closeStoryCard(): void {
  storyModal.classList.remove('open')
  document.body.classList.remove('story-open')
  window.setTimeout(() => {
    storyModal.hidden = true
  }, 280)
}

storyContinue.addEventListener('click', () => {
  if (state.storyStep === 'welcome') dismissWelcome(state)
  lastStoryStep = state.storyStep
  closeStoryCard()
  updateHud({ panel: true })
})

function renderStoryRail(): void {
  const current = state.storyStep
  const order = STORY_RAIL
  const step = current === 'welcome' ? 'plant' : current === 'free' ? null : current
  if (!step || !order.includes(step as (typeof order)[number])) {
    storyRail.innerHTML = ''
    storyRail.hidden = true
    return
  }
  storyRail.hidden = false
  const idx = order.indexOf(step as (typeof order)[number])
  storyRail.innerHTML = `<span class="story-step">${idx + 1}/${order.length} · ${STORY_BEATS[step].railLabel}</span>`
}

function maybeShowStoryForStep(): void {
  if (state.storyStep !== lastStoryStep) {
    lastStoryStep = state.storyStep
    openStoryCard(state.storyStep)
  }
}

function xpProgress(xp: number): { current: number; next: number; pct: number } {
  const level = levelFromXp(xp)
  const floor = (level - 1) * 30
  const next = level * 30
  const current = xp - floor
  const span = next - floor
  return { current, next: span, pct: Math.min(100, (current / span) * 100) }
}

function centerCamera(): void {
  const b = unlockBounds(state.expandTier)
  const tl = plotCenter(b.r0 * state.cols + b.c0, state)
  const br = plotCenter(b.r1 * state.cols + b.c1, state)
  const cx = (tl.x + br.x) / 2
  const cy = (tl.y + br.y) / 2
  const spanW = Math.abs(br.x - tl.x) + 200
  const spanH = Math.abs(br.y - tl.y) + 240
  const zoomW = (VIEW_W * 0.92) / spanW
  const zoomH = (VIEW_H * 0.88) / spanH
  camera.zoom = Math.min(1.55, Math.max(0.75, Math.min(zoomW, zoomH)))
  camera.x = VIEW_W / 2 - cx * camera.zoom
  camera.y = VIEW_H / 2 - cy * camera.zoom + 8
  const { w, h } = worldSize(state)
  clampCamera(camera, w, h, VIEW_W, VIEW_H)
}

function resizeGame(): void {
  setupCanvas(canvas, ctx)
  centerCamera()
}

function syncOrientation(): void {
  const portrait = window.matchMedia('(orientation: portrait)').matches
  const hint = document.querySelector<HTMLElement>('#rotate-hint')
  const shell = document.querySelector<HTMLElement>('.shell')
  if (hint) hint.hidden = !portrait
  if (shell) shell.classList.toggle('hidden-portrait', portrait)
  const orient = (screen as Screen & { orientation?: { lock?: (o: string) => Promise<void> } }).orientation
  if (orient?.lock && !portrait) {
    void orient.lock('landscape').catch(() => {})
  }
}

function refreshPanel(full = true): void {
  if (full) panelBody.innerHTML = renderPanel(activePanel, state)
  panelTitle.textContent = PANEL_COPY[activePanel].title
  panelSub.textContent = PANEL_COPY[activePanel].sub
}

function tipForState(): string {
  const ready = countReady(state)
  const cellar = Object.values(state.produce).reduce((a, b) => a + b, 0)
  switch (state.storyStep) {
    case 'welcome':
    case 'plant':
      return '👉 Tap green grass to plant a seed'
    case 'wait':
      return '⏳ Wait for the ring to fill…'
    case 'harvest':
      return ready ? '✨ Tap the glowing crop to harvest' : '✨ Crops will glow when ready — tap them'
    case 'earn':
      return cellar ? '💰 Press Sell all in the Farm panel' : '💰 Harvest first, then sell'
    case 'expand':
      return '🗺️ Press Expand land to clear the mist'
    default:
      if (ready) return `✨ ${ready} ready — tap glowing crops`
      if (cellar) return '💰 Sell crops in the Farm panel for coins'
      if (state.toolMode === 'decorate') return '🏮 Decorate mode — tap empty grass'
      return '🌱 Tap grass to plant · tap glow to harvest'
  }
}

function updatePlayTip(): void {
  playTip.textContent = tipForState()
  playTip.dataset.step = state.storyStep
}

function updateHud({ panel = false }: { panel?: boolean } = {}) {
  const prevCoins = coinsEl.textContent
  coinsEl.textContent = String(state.coins)
  if (prevCoins !== String(state.coins)) {
    coinsPill.classList.remove('pop')
    void coinsPill.offsetWidth
    coinsPill.classList.add('pop')
  }

  levelEl.textContent = String(levelFromXp(state.xp))
  const xp = xpProgress(state.xp)
  xpFill.style.width = `${xp.pct}%`
  xpText.textContent = `${xp.current} / ${xp.next} XP`

  const ready = countReady(state)
  readyBadge.textContent = ready === 0 ? '' : ready === 1 ? 'Tap to harvest!' : `${ready} ready — tap!`
  readyBadge.classList.toggle('pulse', ready > 0)
  readyBadge.hidden = ready === 0
  groveTitle.textContent = `Your grove · ${groveLabel()}`

  dailyBtn.classList.toggle('claimed', state.dailyLastClaim === new Date().toISOString().slice(0, 10))

  renderStoryRail()
  updatePlayTip()
  maybeShowStoryForStep()

  if (panel) refreshPanel(true)
}

function groveLabel(): string {
  const labels = ['misted clearing', 'small glade', 'moon meadow', 'star orchard', 'full grove']
  return labels[Math.min(4, state.expandTier)]
}

document.querySelectorAll<HTMLButtonElement>('.tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'))
    btn.classList.add('active')
    activePanel = btn.dataset.panel as PanelId
    refreshPanel(true)
  })
})

panelBody.addEventListener('click', (e) => {
  const t = e.target as HTMLElement

  const tool = t.closest('[data-tool]') as HTMLElement | null
  if (tool?.dataset.tool) {
    const mode = tool.dataset.tool as ToolMode
    state.toolMode = state.toolMode === mode && mode === 'decorate' ? 'plant' : mode
    updatePlayTip()
    refreshPanel(true)
    return
  }

  if (t.closest('[data-expand]')) {
    const err = expandGrove(state)
    if (err) showToast(err, 'warn')
    else {
      showToast('The mist retreats — new soil awakens!', 'success')
      document.body.classList.add('expand-flash')
      window.setTimeout(() => document.body.classList.remove('expand-flash'), 900)
      centerCamera()
      updateHud({ panel: true })
    }
    return
  }

  const seedSel = t.closest('[data-select]') as HTMLElement | null
  if (seedSel?.dataset.select) {
    state.selectedSeed = seedSel.dataset.select as CropId
    state.toolMode = 'plant'
    updatePlayTip()
    refreshPanel(true)
    return
  }

  const decorSel = t.closest('[data-select-decor]') as HTMLElement | null
  if (decorSel?.dataset.selectDecor) {
    state.selectedDecor = decorSel.dataset.selectDecor as DecorId
    state.toolMode = 'decorate'
    refreshPanel(true)
    return
  }

  const buySeedBtn = t.closest('[data-buy-seed]') as HTMLElement | null
  if (buySeedBtn?.dataset.buySeed) {
    const id = buySeedBtn.dataset.buySeed as CropId
    const err = buySeed(state, id)
    if (err) showToast(err, 'warn')
    else {
      state.selectedSeed = id
      updateHud({ panel: true })
      showToast(`Bought ${CROPS[id].name} seeds.`, 'success')
    }
    return
  }

  const buyDecorBtn = t.closest('[data-buy-decor]') as HTMLElement | null
  if (buyDecorBtn?.dataset.buyDecor) {
    const id = buyDecorBtn.dataset.buyDecor as DecorId
    const err = buyDecor(state, id)
    if (err) showToast(err, 'warn')
    else {
      state.selectedDecor = id
      state.toolMode = 'decorate'
      updateHud({ panel: true })
      showToast('Decoration added to inventory.', 'success')
    }
    return
  }

  const sellBtn = t.closest('[data-sell]') as HTMLElement | null
  if (sellBtn?.dataset.sell) {
    const id = sellBtn.dataset.sell as CropId
    const err = sellProduce(state, id, 1)
    if (err) showToast(err, 'warn')
    else {
      showToast(`Sold ${CROPS[id].name} — moon coins jingle.`, 'success')
      updateHud({ panel: true })
    }
    return
  }

  if (t.closest('[data-sell-all]')) {
    const total = sellAllProduce(state)
    if (total <= 0) showToast('Cellar is empty.', 'warn')
    else {
      showToast(`Sold produce for ${total}✦`, 'success')
      updateHud({ panel: true })
    }
    return
  }

  const craftBtn = t.closest('[data-craft]') as HTMLElement | null
  if (craftBtn?.dataset.craft) {
    const err = craftItem(state, craftBtn.dataset.craft as CraftId)
    if (err) showToast(err, 'warn')
    else {
      showToast('Crafted!', 'success')
      updateHud({ panel: true })
    }
    return
  }

  const feedBtn = t.closest('[data-feed]') as HTMLElement | null
  if (feedBtn?.dataset.feed) {
    const err = feedAnimal(state, feedBtn.dataset.feed as AnimalId)
    if (err) showToast(err, 'warn')
    else {
      showToast('Animal fed and happy!', 'success')
      updateHud({ panel: true })
    }
    return
  }

  const collectBtn = t.closest('[data-collect]') as HTMLElement | null
  if (collectBtn?.dataset.collect) {
    const err = collectAnimalProduct(state, collectBtn.dataset.collect as AnimalId)
    if (err) showToast(err, 'warn')
    else {
      showToast('Collected animal gift!', 'success')
      updateHud({ panel: true })
    }
    return
  }

  const adoptBtn = t.closest('[data-adopt]') as HTMLElement | null
  if (adoptBtn?.dataset.adopt) {
    const err = unlockAnimal(state, adoptBtn.dataset.adopt as AnimalId)
    if (err) showToast(err, 'warn')
    else {
      showToast('New friend joined the barn!', 'success')
      updateHud({ panel: true })
    }
    return
  }

  const claimBtn = t.closest('[data-claim-quest]') as HTMLElement | null
  if (claimBtn?.dataset.claimQuest) {
    const err = claimQuest(state, claimBtn.dataset.claimQuest)
    if (err) showToast(err, 'warn')
    else {
      showToast('Quest reward claimed!', 'success')
      updateHud({ panel: true })
    }
  }
})

dailyBtn.addEventListener('click', () => {
  const err = claimDailyGift(state)
  if (err) showToast(err, 'warn')
  else {
    showToast('Daily gift: coins, seeds, and XP!', 'success')
    updateHud({ panel: true })
  }
})

function beginDrag(clientX: number, clientY: number) {
  dragging = true
  dragMoved = false
  dragStart = { x: clientX, y: clientY, camX: camera.x, camY: camera.y }
}

function moveDrag(clientX: number, clientY: number) {
  if (!dragging) return
  if (Math.hypot(clientX - dragStart.x, clientY - dragStart.y) > 8) dragMoved = true
  camera.x = dragStart.camX + (clientX - dragStart.x)
  camera.y = dragStart.camY + (clientY - dragStart.y)
  const { w, h } = worldSize(state)
  clampCamera(camera, w, h, VIEW_W, VIEW_H)
}

function actOnTile(clientX: number, clientY: number) {
  if (dragMoved) return

  const world = screenToWorld(camera, canvas, clientX, clientY, VIEW_W, VIEW_H)
  const index = hitTest(state, world.x, world.y)
  if (index === null) {
    showToast('Drag to look around · tap a grass tile', 'info')
    return
  }

  if (!plotUnlocked(state, index)) {
    showToast('Grey mist is locked — sell crops, then Expand', 'warn')
    return
  }

  const plot = state.plots[index]
  const { x, y } = plotCenter(index, state)

  // Smart tap: ready crops always harvest
  if (plot.kind === 'ready') {
    const def = CROPS[plot.crop]
    const err = harvestAt(state, index)
    if (err) showToast(err, 'warn')
    else {
      spawnHarvestSpark(x, y, def.glow, sparks)
      spawnFloater(x, y - 20, `+1 ${def.name}`, def.glow, floaters)
      showToast('Harvested! Sell it in the Farm panel →', 'success')
      updateHud({ panel: true })
    }
    return
  }

  if (plot.kind === 'growing') {
    showToast('Still growing — wait for the sparkle', 'info')
    return
  }

  if (plot.kind === 'decor') {
    showToast('Decoration here — try empty grass', 'info')
    return
  }

  // Empty plot
  if (state.toolMode === 'decorate') {
    const err = placeDecorAt(state, index)
    if (err) showToast(err, 'warn')
    else {
      spawnFloater(x, y, 'Placed', '#c4b5fd', floaters)
      updateHud({ panel: activePanel === 'farm' })
    }
    return
  }

  if (!state.selectedSeed) {
    state.selectedSeed = 'blossom'
  }
  if (state.inventory[state.selectedSeed] <= 0) {
    showToast('Out of seeds — buy more on the right →', 'warn')
    updateHud({ panel: true })
    return
  }

  const err = plantAt(state, index)
  if (err) showToast(err, 'warn')
  else {
    spawnFloater(x, y, 'Planted!', '#a7f3d0', floaters)
    showToast('Growing… tap when it sparkles!', 'info')
    updateHud({ panel: true })
  }
}

canvas.addEventListener('mousemove', (e) => {
  if (dragging) {
    moveDrag(e.clientX, e.clientY)
    return
  }
  const w = screenToWorld(camera, canvas, e.clientX, e.clientY, VIEW_W, VIEW_H)
  hoverIndex = hitTest(state, w.x, w.y)
})

canvas.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return
  beginDrag(e.clientX, e.clientY)
})

window.addEventListener('mouseup', (e) => {
  if (!dragging) return
  dragging = false
  actOnTile(e.clientX, e.clientY)
})

canvas.addEventListener(
  'touchstart',
  (e) => {
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    beginDrag(t.clientX, t.clientY)
  },
  { passive: true },
)

canvas.addEventListener(
  'touchmove',
  (e) => {
    if (!dragging || e.touches.length !== 1) return
    e.preventDefault()
    const t = e.touches[0]
    moveDrag(t.clientX, t.clientY)
  },
  { passive: false },
)

canvas.addEventListener(
  'touchend',
  (e) => {
    if (!dragging) return
    dragging = false
    const t = e.changedTouches[0]
    actOnTile(t.clientX, t.clientY)
  },
  { passive: true },
)

canvas.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.06 : 0.06
    camera.zoom = Math.min(1.55, Math.max(0.7, camera.zoom + delta))
    const { w, h } = worldSize(state)
    clampCamera(camera, w, h, VIEW_W, VIEW_H)
  },
  { passive: false },
)

function loop(now: number) {
  const dt = Math.min(0.05, (now - lastNow) / 1000)
  lastNow = now

  let hud = false
  const plotTick = tickPlots(state, now)
  if (plotTick.changed) hud = true
  if (plotTick.becameReady) {
    showToast('Crops shimmer — harvest the ready ones!', 'success')
    updateHud({ panel: true })
    hud = false
  }
  if (tickAnimals(state, now, dt)) hud = true
  if (hud) updateHud({ panel: activePanel === 'barn' })

  tickEffects(floaters, sparks, dt)
  renderFarm(ctx, canvas, state, camera, now, hoverIndex, floaters, sparks)

  if (now - lastSave > 3000) {
    saveState(state)
    lastSave = now
  }

  requestAnimationFrame(loop)
}

centerCamera()
refreshPanel(true)
updateHud()
syncOrientation()
resizeGame()
window.addEventListener('resize', () => {
  syncOrientation()
  resizeGame()
})
window.addEventListener('orientationchange', () => {
  window.setTimeout(() => {
    syncOrientation()
    resizeGame()
  }, 120)
})

if (state.storyStep === 'welcome' || !state.storyFlags[state.storyStep]) {
  openStoryCard(state.storyStep === 'welcome' ? 'welcome' : state.storyStep)
}

void loadAssets().then(() => {
  resizeGame()
  requestAnimationFrame(loop)
})
