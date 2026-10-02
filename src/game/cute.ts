import { ISO_H, ISO_W } from './iso'

function roundPoly(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
  ctx.closePath()
}

export function drawSoftTile(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  opts: { locked?: boolean; hover?: boolean; tint?: number },
) {
  const hw = ISO_W / 2
  const hh = ISO_H / 2
  const lip = 7

  // Soft drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  roundPoly(ctx, [
    [cx - hw + 6, cy + 4],
    [cx + 6, cy + hh + 4],
    [cx + hw + 6, cy + 4],
    [cx + 6, cy - hh + 4],
  ])
  ctx.fill()

  if (opts.locked) {
    const g = ctx.createLinearGradient(cx, cy - hh, cx, cy + hh)
    g.addColorStop(0, 'rgba(165,180,210,0.45)')
    g.addColorStop(1, 'rgba(90,100,140,0.55)')
    roundPoly(ctx, [
      [cx, cy - hh],
      [cx + hw, cy],
      [cx, cy + hh],
      [cx - hw, cy],
    ])
    ctx.fillStyle = g
    ctx.fill()
    ctx.strokeStyle = opts.hover ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    return
  }

  // Sides
  ctx.fillStyle = '#2d6a4f'
  roundPoly(ctx, [
    [cx - hw, cy],
    [cx, cy + hh],
    [cx, cy + hh + lip],
    [cx - hw, cy + lip],
  ])
  ctx.fill()
  ctx.fillStyle = '#1b4332'
  roundPoly(ctx, [
    [cx + hw, cy],
    [cx, cy + hh],
    [cx, cy + hh + lip],
    [cx + hw, cy + lip],
  ])
  ctx.fill()

  // Top — soft grassy gradient
  const top = ctx.createLinearGradient(cx - 20, cy - 16, cx + 24, cy + 14)
  const t = opts.tint ?? 0
  top.addColorStop(0, t ? '#74c69d' : '#95d5b2')
  top.addColorStop(0.5, t ? '#52b788' : '#74c69d')
  top.addColorStop(1, '#40916c')
  roundPoly(ctx, [
    [cx, cy - hh],
    [cx + hw, cy],
    [cx, cy + hh],
    [cx - hw, cy],
  ])
  ctx.fillStyle = top
  ctx.fill()

  if (opts.hover) {
    ctx.strokeStyle = 'rgba(255, 236, 150, 0.95)'
    ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.fill()
  }
}

export function drawSoftCrop(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  progress: number,
  color: string,
  glow: string,
  ready: boolean,
  now: number,
) {
  const stage = ready ? 1 : Math.min(0.98, progress)
  const bob = ready ? Math.sin(now / 300) * 2 : 0

  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath()
  ctx.ellipse(cx + 2, cy + 6, 12 + stage * 4, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  if (stage < 0.12) {
    ctx.fillStyle = '#6f4e37'
    ctx.beginPath()
    ctx.ellipse(cx, cy + 2, 8, 4, 0, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  // Leaves
  ctx.fillStyle = '#2d6a4f'
  ctx.beginPath()
  ctx.ellipse(cx - 10, cy - 4 - stage * 8 + bob, 8, 4, -0.6, 0, Math.PI * 2)
  ctx.ellipse(cx + 10, cy - 3 - stage * 7 + bob, 8, 4, 0.6, 0, Math.PI * 2)
  ctx.fill()

  const stemH = 10 + stage * 24
  ctx.strokeStyle = '#40916c'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx, cy + 2)
  ctx.quadraticCurveTo(cx + 2, cy - stemH * 0.4, cx, cy - stemH + bob)
  ctx.stroke()

  const r = 7 + stage * 12
  const py = cy - stemH + bob
  if (ready) {
    ctx.shadowColor = glow
    ctx.shadowBlur = 18
  }
  const g = ctx.createRadialGradient(cx - 3, py - 4, 1, cx, py, r)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.35, glow)
  g.addColorStop(1, color)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx, py, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  if (ready) {
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 13px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('✦', cx, py + 4)
  }
}

export function drawSoftHouse(ctx: CanvasRenderingContext2D, cx: number, cy: number, now: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.beginPath()
  ctx.ellipse(cx + 4, cy + 14, 42, 14, 0, 0, Math.PI * 2)
  ctx.fill()

  const w = 34
  const h = 30
  // left wall
  ctx.fillStyle = '#f4a261'
  ctx.beginPath()
  ctx.moveTo(cx - w, cy)
  ctx.lineTo(cx, cy + 14)
  ctx.lineTo(cx, cy + 14 - h)
  ctx.lineTo(cx - w, cy - h)
  ctx.closePath()
  ctx.fill()
  // right wall
  ctx.fillStyle = '#e76f51'
  ctx.beginPath()
  ctx.moveTo(cx + w, cy)
  ctx.lineTo(cx, cy + 14)
  ctx.lineTo(cx, cy + 14 - h)
  ctx.lineTo(cx + w, cy - h)
  ctx.closePath()
  ctx.fill()
  // roof
  ctx.fillStyle = '#c1121f'
  ctx.beginPath()
  ctx.moveTo(cx - w - 6, cy - h + 6)
  ctx.lineTo(cx, cy - h - 22)
  ctx.lineTo(cx + w + 6, cy - h + 6)
  ctx.lineTo(cx, cy - h + 12)
  ctx.closePath()
  ctx.fill()
  // roof highlight
  ctx.fillStyle = '#e63946'
  ctx.beginPath()
  ctx.moveTo(cx - w - 6, cy - h + 6)
  ctx.lineTo(cx, cy - h - 22)
  ctx.lineTo(cx, cy - h + 12)
  ctx.closePath()
  ctx.fill()
  // chimney
  ctx.fillStyle = '#6d597a'
  ctx.fillRect(cx + 14, cy - h - 18, 8, 16)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  const smokeY = cy - h - 22 - (now / 80) % 18
  ctx.beginPath()
  ctx.arc(cx + 18, smokeY, 5, 0, Math.PI * 2)
  ctx.arc(cx + 22, smokeY - 8, 4, 0, Math.PI * 2)
  ctx.fill()
  // door
  ctx.fillStyle = '#6b4226'
  ctx.beginPath()
  ctx.moveTo(cx - 6, cy + 8)
  ctx.lineTo(cx + 6, cy + 12)
  ctx.lineTo(cx + 6, cy - 4)
  ctx.lineTo(cx - 6, cy - 8)
  ctx.closePath()
  ctx.fill()
  // window glow
  const flick = 0.75 + Math.sin(now / 220) * 0.2
  ctx.fillStyle = `rgba(255, 236, 150, ${flick})`
  ctx.shadowColor = '#ffe66d'
  ctx.shadowBlur = 12
  ctx.fillRect(cx + 8, cy - 14, 12, 10)
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1
  ctx.strokeRect(cx + 8, cy - 14, 12, 10)
  ctx.beginPath()
  ctx.moveTo(cx + 14, cy - 14)
  ctx.lineTo(cx + 14, cy - 4)
  ctx.moveTo(cx + 8, cy - 9)
  ctx.lineTo(cx + 20, cy - 9)
  ctx.stroke()
}

export function drawSoftTree(ctx: CanvasRenderingContext2D, cx: number, cy: number, seed: number, now: number) {
  const sway = Math.sin(now / 1000 + seed) * 2.5
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.beginPath()
  ctx.ellipse(cx + 2, cy + 4, 18, 7, 0, 0, Math.PI * 2)
  ctx.fill()
  // trunk
  ctx.fillStyle = '#8b5e34'
  ctx.beginPath()
  ctx.moveTo(cx - 5, cy + 2)
  ctx.lineTo(cx + 5, cy + 2)
  ctx.lineTo(cx + 4, cy - 22)
  ctx.lineTo(cx - 4, cy - 22)
  ctx.closePath()
  ctx.fill()
  // layered cute canopy
  const baseY = cy - 34
  const blobs: [number, number, number, string][] = [
    [0, 0, 22, '#1b4332'],
    [-14, 8, 16, '#2d6a4f'],
    [14, 6, 15, '#2d6a4f'],
    [-6, -8, 14, '#40916c'],
    [8, -6, 13, '#52b788'],
    [0, -2, 12, '#74c69d'],
  ]
  for (const [dx, dy, r, col] of blobs) {
    const g = ctx.createRadialGradient(cx + dx + sway - 4, baseY + dy - 4, 2, cx + dx + sway, baseY + dy, r)
    g.addColorStop(0, '#b7e4c7')
    g.addColorStop(0.45, col)
    g.addColorStop(1, '#081c15')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx + dx + sway, baseY + dy, r, 0, Math.PI * 2)
    ctx.fill()
  }
  // fruit accents
  if (seed % 3 === 0) {
    ctx.fillStyle = '#ff6b9d'
    ctx.beginPath()
    ctx.arc(cx - 8 + sway, baseY + 4, 3.5, 0, Math.PI * 2)
    ctx.arc(cx + 10 + sway, baseY - 2, 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function drawSoftKeeper(ctx: CanvasRenderingContext2D, cx: number, cy: number, now: number) {
  const bob = Math.abs(Math.sin(now / 220)) * 2
  const walk = Math.sin(now / 400) * 2
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.beginPath()
  ctx.ellipse(cx + walk, cy + 4, 11, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  // legs
  ctx.strokeStyle = '#023e8a'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - 3 + walk, cy - 2 + bob)
  ctx.lineTo(cx - 5 + walk + Math.sin(now / 200) * 2, cy + 4)
  ctx.moveTo(cx + 3 + walk, cy - 2 + bob)
  ctx.lineTo(cx + 5 + walk - Math.sin(now / 200) * 2, cy + 4)
  ctx.stroke()
  // body / cloak
  const g = ctx.createLinearGradient(cx, cy - 28, cx, cy)
  g.addColorStop(0, '#90e0ef')
  g.addColorStop(0.5, '#00b4d8')
  g.addColorStop(1, '#0077b6')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(cx - 11 + walk, cy - 2 + bob)
  ctx.quadraticCurveTo(cx + walk, cy + 2 + bob, cx + 11 + walk, cy - 2 + bob)
  ctx.lineTo(cx + 9 + walk, cy - 22 + bob)
  ctx.quadraticCurveTo(cx + walk, cy - 26 + bob, cx - 9 + walk, cy - 22 + bob)
  ctx.closePath()
  ctx.fill()
  // sash
  ctx.fillStyle = '#ffd60a'
  ctx.fillRect(cx - 8 + walk, cy - 12 + bob, 16, 3)
  // head
  ctx.fillStyle = '#ffe8d6'
  ctx.beginPath()
  ctx.arc(cx + walk, cy - 28 + bob, 8, 0, Math.PI * 2)
  ctx.fill()
  // eyes
  ctx.fillStyle = '#1b4332'
  ctx.beginPath()
  ctx.arc(cx - 2.5 + walk, cy - 28 + bob, 1.3, 0, Math.PI * 2)
  ctx.arc(cx + 2.5 + walk, cy - 28 + bob, 1.3, 0, Math.PI * 2)
  ctx.fill()
  // smile
  ctx.strokeStyle = '#e76f51'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(cx + walk, cy - 26 + bob, 3, 0.15, Math.PI - 0.15)
  ctx.stroke()
  // hat
  ctx.fillStyle = '#023e8a'
  ctx.beginPath()
  ctx.ellipse(cx + walk, cy - 33 + bob, 11, 3.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(cx - 7 + walk, cy - 33 + bob)
  ctx.lineTo(cx + walk, cy - 46 + bob)
  ctx.lineTo(cx + 7 + walk, cy - 33 + bob)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#ff6b9d'
  ctx.beginPath()
  ctx.arc(cx + walk, cy - 46 + bob, 2.5, 0, Math.PI * 2)
  ctx.fill()
}

export function drawSoftFlower(ctx: CanvasRenderingContext2D, cx: number, cy: number, seed: number, now: number) {
  const bob = Math.sin(now / 400 + seed) * 1.2
  const colors = ['#ff6b9d', '#ffd60a', '#c77dff', '#48cae4', '#ff9f1c']
  const c = colors[seed % colors.length]
  ctx.fillStyle = '#2d6a4f'
  ctx.fillRect(cx - 1, cy - 8 + bob, 2, 10)
  ctx.fillStyle = c
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + seed
    ctx.beginPath()
    ctx.ellipse(cx + Math.cos(a) * 4, cy - 10 + bob + Math.sin(a) * 3, 3.5, 2.5, a, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(cx, cy - 10 + bob, 2.2, 0, Math.PI * 2)
  ctx.fill()
}

export function drawSoftFence(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.strokeStyle = '#d4a373'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.fillStyle = '#b08968'
  for (const t of [0, 0.5, 1]) {
    const x = x1 + (x2 - x1) * t
    const y = y1 + (y2 - y1) * t
    ctx.fillRect(x - 2, y - 10, 4, 12)
  }
}

export function drawSoftAnimal(
  ctx: CanvasRenderingContext2D,
  kind: number,
  cx: number,
  cy: number,
  now: number,
  ready: boolean,
) {
  const bob = Math.sin(now / 320 + kind) * 1.5
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + 4, 12, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  if (kind === 0) {
    // moth
    ctx.fillStyle = 'rgba(200,180,255,0.7)'
    ctx.beginPath()
    ctx.ellipse(cx - 10, cy - 12 + bob, 10, 5 + Math.sin(now / 100) * 2, -0.4, 0, Math.PI * 2)
    ctx.ellipse(cx + 10, cy - 12 + bob, 10, 5 + Math.sin(now / 100) * 2, 0.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.ellipse(cx, cy - 10 + bob, 5, 7, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (kind === 1) {
    ctx.fillStyle = '#fb8500'
    ctx.beginPath()
    ctx.ellipse(cx, cy - 10 + bob, 12, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffb703'
    ctx.beginPath()
    ctx.ellipse(cx + 12, cy - 8 + bob, 8, 4, 0.5, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.fillStyle = '#f8f9fa'
    ctx.beginPath()
    ctx.ellipse(cx, cy - 10 + bob, 11, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(cx - 5, cy - 22 + bob, 3, 8, -0.1, 0, Math.PI * 2)
    ctx.fill()
  }
  if (ready) {
    ctx.fillStyle = '#ffd60a'
    ctx.font = 'bold 12px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('✦', cx, cy - 28 + bob)
  }
}
