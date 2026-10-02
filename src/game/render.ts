import { drawSpr, loadFarmSprites, type FarmSprite } from './assets'
import type { Camera } from './camera'
import { CROPS } from './crops'
import { drawEffects, type Floater, type Spark } from './effects'
import { depthKey, gridToScreen, screenToGrid, worldSize as ws } from './iso'
import { isTileUnlocked, unlockBounds } from './story'
import type { CropId, GameState } from './types'

export let VIEW_W = 960
export let VIEW_H = 540

const TILE_SCALE = 0.58
const PROP_SCALE = 0.62

export function setupCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
  const stage = canvas.parentElement
  const rect = stage?.getBoundingClientRect()
  VIEW_W = Math.max(640, Math.floor(rect?.width || 960))
  VIEW_H = Math.max(360, Math.floor(rect?.height || 540))
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
  canvas.width = Math.floor(VIEW_W * dpr)
  canvas.height = Math.floor(VIEW_H * dpr)
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
}

export function worldSize(state: GameState) {
  return ws(state.cols, state.rows)
}

export function plotCenter(index: number, state: GameState) {
  const col = index % state.cols
  const row = Math.floor(index / state.cols)
  return gridToScreen(col, row, state.cols, state.rows)
}

export function hitTest(state: GameState, worldX: number, worldY: number): number | null {
  const { col: cf, row: rf } = screenToGrid(worldX, worldY, state.cols, state.rows)
  const col = Math.floor(cf)
  const row = Math.floor(rf)
  let best: number | null = null
  let bestDist = Infinity
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const c = col + dc
      const r = row + dr
      if (c < 0 || r < 0 || c >= state.cols || r >= state.rows) continue
      const p = gridToScreen(c, r, state.cols, state.rows)
      const dist = Math.abs(worldX - p.x) / (ISO_HIT_W) + Math.abs(worldY - p.y) / ISO_HIT_H
      if (dist < 1.05 && dist < bestDist) {
        bestDist = dist
        best = r * state.cols + c
      }
    }
  }
  return best
}

const ISO_HIT_W = 56
const ISO_HIT_H = 28

export async function loadAssets(): Promise<void> {
  await loadFarmSprites()
}

type Item = { depth: number; draw: () => void }

const CROP_SPRITE: Record<CropId, FarmSprite> = {
  blossom: 'crop_pink',
  moonberry: 'crop_blue',
  starfruit: 'crop_gold',
  dewmint: 'crop_mint',
  shimmeroot: 'crop_ready',
}

function drawWorld(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  now: number,
  hoverIndex: number | null,
  floaters: Floater[],
  sparks: Spark[],
) {
  const { cols, rows } = state
  const { w: W, h: H } = worldSize(state)
  const b = unlockBounds(state.expandTier)

  const sky = ctx.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, '#4fc3f7')
  sky.addColorStop(0.4, '#81d4fa')
  sky.addColorStop(0.7, '#b3e5fc')
  sky.addColorStop(1, '#c8e6c9')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, H)

  // hills
  ctx.fillStyle = '#a5d6a7'
  ctx.beginPath()
  ctx.moveTo(0, H * 0.4)
  ctx.quadraticCurveTo(W * 0.3, H * 0.3, W * 0.55, H * 0.38)
  ctx.quadraticCurveTo(W * 0.8, H * 0.46, W, H * 0.36)
  ctx.lineTo(W, H)
  ctx.lineTo(0, H)
  ctx.fill()
  ctx.fillStyle = '#81c784'
  ctx.beginPath()
  ctx.moveTo(0, H * 0.5)
  ctx.quadraticCurveTo(W * 0.35, H * 0.42, W * 0.6, H * 0.5)
  ctx.quadraticCurveTo(W * 0.85, H * 0.56, W, H * 0.48)
  ctx.lineTo(W, H)
  ctx.lineTo(0, H)
  ctx.fill()

  const sun = ctx.createRadialGradient(W * 0.84, H * 0.09, 4, W * 0.84, H * 0.09, 100)
  sun.addColorStop(0, 'rgba(255,255,220,1)')
  sun.addColorStop(0.4, 'rgba(255,236,150,0.4)')
  sun.addColorStop(1, 'rgba(255,255,200,0)')
  ctx.fillStyle = sun
  ctx.beginPath()
  ctx.arc(W * 0.84, H * 0.09, 100, 0, Math.PI * 2)
  ctx.fill()

  for (let i = 0; i < 3; i++) {
    const cx = ((now / 50 + i * 280) % (W + 180)) - 90
    const cy = 48 + (i % 2) * 36
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.beginPath()
    ctx.ellipse(cx, cy, 40, 14, 0, 0, Math.PI * 2)
    ctx.ellipse(cx + 24, cy + 2, 26, 11, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  const items: Item[] = []
  const pad = 1

  for (let row = Math.max(0, b.r0 - pad); row <= Math.min(rows - 1, b.r1 + pad); row++) {
    for (let col = Math.max(0, b.c0 - pad); col <= Math.min(cols - 1, b.c1 + pad); col++) {
      const i = row * cols + col
      const { x: cx, y: cy } = gridToScreen(col, row, cols, rows)
      const unlocked = isTileUnlocked(col, row, state.expandTier)

      items.push({
        depth: depthKey(col, row, 0),
        draw: () => {
          if (!unlocked) {
            drawSpr(ctx, 'mist', cx, cy + 18, { scale: TILE_SCALE, alpha: 0.75 })
            return
          }
          const plot = state.plots[i]
          const tile: FarmSprite =
            plot.kind === 'empty' ? 'grass' : plot.kind === 'decor' ? 'grass' : 'soil'
          drawSpr(ctx, tile, cx, cy + 18, { scale: TILE_SCALE })
          if (hoverIndex === i) {
            ctx.save()
            ctx.strokeStyle = 'rgba(255, 230, 80, 0.9)'
            ctx.lineWidth = 2.5
            ctx.beginPath()
            ctx.moveTo(cx, cy - 8)
            ctx.lineTo(cx + 48, cy + 16)
            ctx.lineTo(cx, cy + 40)
            ctx.lineTo(cx - 48, cy + 16)
            ctx.closePath()
            ctx.stroke()
            ctx.restore()
          } else if (
            unlocked &&
            state.plots[i].kind === 'empty' &&
            (state.storyStep === 'plant' || state.storyStep === 'welcome')
          ) {
            const pulse = 0.25 + Math.sin(now / 350) * 0.15
            ctx.save()
            ctx.strokeStyle = `rgba(255, 255, 255, ${pulse})`
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(cx, cy - 8)
            ctx.lineTo(cx + 48, cy + 16)
            ctx.lineTo(cx, cy + 40)
            ctx.lineTo(cx - 48, cy + 16)
            ctx.closePath()
            ctx.stroke()
            ctx.restore()
          }
        },
      })

      if (!unlocked) continue
      const plot = state.plots[i]

      if (plot.kind === 'growing' || plot.kind === 'ready') {
        const def = CROPS[plot.crop]
        const p = plot.kind === 'ready' ? 1 : Math.min(1, (now - plot.plantedAt) / def.growMs)
        items.push({
          depth: depthKey(col, row, 3),
          draw: () => {
            if (plot.kind === 'growing') {
              ctx.strokeStyle = 'rgba(255,255,255,0.45)'
              ctx.lineWidth = 2.5
              ctx.beginPath()
              ctx.arc(cx, cy - 48, 11, 0, Math.PI * 2)
              ctx.stroke()
              ctx.strokeStyle = def.glow
              ctx.beginPath()
              ctx.arc(cx, cy - 48, 11, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p)
              ctx.stroke()
            }
            const bob = plot.kind === 'ready' ? Math.sin(now / 280) * 2.5 : 0
            const key: FarmSprite =
              plot.kind === 'ready' || p > 0.55 ? CROP_SPRITE[plot.crop] : 'crop_young'
            drawSpr(ctx, key, cx, cy + 10, { scale: PROP_SCALE * 0.9, bob })
          },
        })
      } else if (plot.kind === 'decor') {
        items.push({
          depth: depthKey(col, row, 3),
          draw: () => {
            drawSpr(ctx, plot.decor === 'mushroom' ? 'crop_mint' : 'crop_gold', cx, cy + 8, {
              scale: 0.4,
            })
          },
        })
      }
    }
  }

  // Sparse trees — corners only
  const treeSpots = [
    [b.c0 - 1, b.r0 - 1],
    [b.c1 + 1, b.r0 - 1],
    [b.c0 - 1, b.r1 + 1],
    [b.c1 + 1, b.r1 + 1],
    [Math.floor((b.c0 + b.c1) / 2), b.r0 - 1],
  ]
  for (const [c, r] of treeSpots) {
    if (c < 0 || r < 0 || c >= cols || r >= rows) continue
    if (c >= b.c0 && c <= b.c1 && r >= b.r0 && r <= b.r1) continue
    items.push({
      depth: depthKey(c, r, 4),
      draw: () => {
        const p = gridToScreen(c, r, cols, rows)
        drawSpr(ctx, 'tree', p.x, p.y + 16, { scale: 0.5 })
      },
    })
  }

  items.push({
    depth: depthKey(b.c0, b.r0, 5),
    draw: () => {
      const p = gridToScreen(b.c0, b.r0, cols, rows)
      drawSpr(ctx, 'house', p.x + 8, p.y + 28, { scale: 0.55 })
    },
  })

  state.animals.forEach((a, ai) => {
    const c = Math.min(cols - 1, b.c1 - (ai % 2))
    const r = Math.min(rows - 1, b.r0 + 1)
    items.push({
      depth: depthKey(c, r, 6),
      draw: () => {
        const p = gridToScreen(c, r, cols, rows)
        const x = p.x + Math.sin(now / 900 + ai) * 10
        const y = p.y + Math.cos(now / 1000 + ai) * 5
        drawSpr(ctx, 'bunny', x, y + 12, { scale: 0.4, bob: Math.sin(now / 320 + ai) * 1.5 })
        if (a.productReady) {
          ctx.fillStyle = '#ffd60a'
          ctx.font = 'bold 14px Nunito,system-ui'
          ctx.textAlign = 'center'
          ctx.fillText('✦', x, y - 18)
        }
      },
    })
  })

  {
    const cc = Math.floor((b.c0 + b.c1) / 2)
    const rr = Math.floor((b.r0 + b.r1) / 2)
    items.push({
      depth: depthKey(cc, rr, 7),
      draw: () => {
        const p = gridToScreen(cc, rr, cols, rows)
        drawSpr(
          ctx,
          'keeper',
          p.x + Math.sin(now / 2800) * 24,
          p.y + Math.cos(now / 3000) * 10 + 10,
          { scale: 0.48, bob: Math.abs(Math.sin(now / 240)) * 2 },
        )
      },
    })
  }

  items.sort((a, b) => a.depth - b.depth)
  for (const it of items) it.draw()

  drawEffects(ctx, floaters, sparks)
}

export function renderFarm(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: GameState,
  cam: Camera,
  now: number,
  hoverIndex: number | null,
  floaters: Floater[],
  sparks: Spark[],
) {
  const dpr = canvas.width / VIEW_W
  ctx.save()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, VIEW_W, VIEW_H)
  ctx.fillStyle = '#81d4fa'
  ctx.fillRect(0, 0, VIEW_W, VIEW_H)
  ctx.translate(cam.x, cam.y)
  ctx.scale(cam.zoom, cam.zoom)
  drawWorld(ctx, state, now, hoverIndex, floaters, sparks)
  ctx.restore()
}
