/**
 * Pre-rendered glossy casual-farm sprites (original art).
 * Mobile look: thick outlines, soft fills, speculars, chibi forms.
 */

export type SpriteKey =
  | 'grassA'
  | 'grassB'
  | 'soil'
  | 'soilWet'
  | 'mist'
  | 'crop0'
  | 'crop1'
  | 'crop2'
  | 'crop3'
  | 'cropReady'
  | 'house'
  | 'tree'
  | 'treeFruit'
  | 'fence'
  | 'keeper'
  | 'animal0'
  | 'animal1'
  | 'animal2'
  | 'flower'
  | 'lantern'
  | 'mushroom'

const atlas = new Map<SpriteKey, HTMLCanvasElement>()

const OUT = '#2b2118'
const SCALE = 2 // draw crisp then scale down in world

function make(w: number, h: number): { c: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const c = document.createElement('canvas')
  c.width = w * SCALE
  c.height = h * SCALE
  const ctx = c.getContext('2d')!
  ctx.scale(SCALE, SCALE)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  return { c, ctx }
}

function poly(ctx: CanvasRenderingContext2D, pts: [number, number][], fill: string, stroke = true) {
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) {
    ctx.strokeStyle = OUT
    ctx.lineWidth = 2.2
    ctx.stroke()
  }
}

function oval(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string,
  stroke = true,
) {
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) {
    ctx.strokeStyle = OUT
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

function diamond(cx: number, cy: number, hw: number, hh: number): [number, number][] {
  return [
    [cx, cy - hh],
    [cx + hw, cy],
    [cx, cy + hh],
    [cx - hw, cy],
  ]
}

function buildGrass(variant: 0 | 1): HTMLCanvasElement {
  const { c, ctx } = make(88, 56)
  const cx = 44
  const cy = 28
  const hw = 40
  const hh = 20
  // shadow
  poly(ctx, diamond(cx + 2, cy + 3, hw, hh), 'rgba(0,0,0,0.18)', false)
  // lip
  poly(ctx, [
    [cx - hw, cy],
    [cx, cy + hh],
    [cx, cy + hh + 8],
    [cx - hw, cy + 8],
  ], '#3d6b4f', false)
  poly(ctx, [
    [cx + hw, cy],
    [cx, cy + hh],
    [cx, cy + hh + 8],
    [cx + hw, cy + 8],
  ], '#2f5740', false)
  // top
  const g = ctx.createLinearGradient(cx - 20, cy - 16, cx + 24, cy + 14)
  if (variant === 0) {
    g.addColorStop(0, '#9bde7a')
    g.addColorStop(0.45, '#6fcf5b')
    g.addColorStop(1, '#4caf50')
  } else {
    g.addColorStop(0, '#8fd96a')
    g.addColorStop(0.45, '#62c24e')
    g.addColorStop(1, '#43a047')
  }
  poly(ctx, diamond(cx, cy, hw, hh), g as unknown as string)
  // re-fill with gradient properly
  ctx.save()
  ctx.beginPath()
  const d = diamond(cx, cy, hw, hh)
  ctx.moveTo(d[0][0], d[0][1])
  for (let i = 1; i < d.length; i++) ctx.lineTo(d[i][0], d[i][1])
  ctx.closePath()
  ctx.fillStyle = g
  ctx.fill()
  ctx.strokeStyle = OUT
  ctx.lineWidth = 2.2
  ctx.stroke()
  ctx.restore()
  // highlight edge
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - hw + 6, cy)
  ctx.lineTo(cx, cy - hh + 4)
  ctx.lineTo(cx + hw - 8, cy - 2)
  ctx.stroke()
  // grass tufts / flowers
  const dots = variant === 0
    ? [[-12, -2, '#fff59d'], [10, 4, '#ff8fab'], [-4, 6, '#fff'], [16, -4, '#81d4fa']]
    : [[8, -2, '#fff59d'], [-14, 3, '#ce93d8'], [4, 7, '#fff'], [-8, -5, '#ff8fab']]
  for (const [dx, dy, col] of dots as [number, number, string][]) {
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.arc(cx + dx, cy + dy, 1.8, 0, Math.PI * 2)
    ctx.fill()
  }
  return c
}

function buildSoil(wet: boolean): HTMLCanvasElement {
  const { c, ctx } = make(88, 56)
  const cx = 44
  const cy = 28
  const hw = 40
  const hh = 20
  poly(ctx, diamond(cx + 2, cy + 3, hw, hh), 'rgba(0,0,0,0.2)', false)
  poly(ctx, [
    [cx - hw, cy],
    [cx, cy + hh],
    [cx, cy + hh + 8],
    [cx - hw, cy + 8],
  ], '#5d4037', false)
  poly(ctx, [
    [cx + hw, cy],
    [cx, cy + hh],
    [cx, cy + hh + 8],
    [cx + hw, cy + 8],
  ], '#4e342e', false)
  const g = ctx.createLinearGradient(cx - 16, cy - 12, cx + 20, cy + 12)
  g.addColorStop(0, wet ? '#8d6e63' : '#a1887f')
  g.addColorStop(0.5, wet ? '#6d4c41' : '#8d6e63')
  g.addColorStop(1, wet ? '#5d4037' : '#795548')
  ctx.beginPath()
  const d = diamond(cx, cy, hw, hh)
  ctx.moveTo(d[0][0], d[0][1])
  for (let i = 1; i < d.length; i++) ctx.lineTo(d[i][0], d[i][1])
  ctx.closePath()
  ctx.fillStyle = g
  ctx.fill()
  ctx.strokeStyle = OUT
  ctx.lineWidth = 2.2
  ctx.stroke()
  // furrows
  ctx.strokeStyle = wet ? 'rgba(62,39,35,0.45)' : 'rgba(62,39,35,0.35)'
  ctx.lineWidth = 1.5
  for (const t of [-0.45, -0.15, 0.15, 0.45]) {
    ctx.beginPath()
    ctx.moveTo(cx - hw * 0.55, cy + t * hh)
    ctx.lineTo(cx + hw * 0.55, cy + t * hh)
    ctx.stroke()
  }
  if (wet) {
    ctx.fillStyle = 'rgba(129,212,250,0.35)'
    ctx.beginPath()
    ctx.ellipse(cx - 8, cy - 2, 5, 2.5, -0.4, 0, Math.PI * 2)
    ctx.ellipse(cx + 10, cy + 3, 4, 2, 0.3, 0, Math.PI * 2)
    ctx.fill()
  }
  return c
}

function buildMist(): HTMLCanvasElement {
  const { c, ctx } = make(88, 56)
  const cx = 44
  const cy = 28
  const hw = 40
  const hh = 20
  poly(ctx, diamond(cx + 2, cy + 3, hw, hh), 'rgba(0,0,0,0.12)', false)
  const g = ctx.createLinearGradient(cx, cy - hh, cx, cy + hh)
  g.addColorStop(0, 'rgba(186,200,220,0.55)')
  g.addColorStop(1, 'rgba(120,130,160,0.7)')
  ctx.beginPath()
  const d = diamond(cx, cy, hw, hh)
  ctx.moveTo(d[0][0], d[0][1])
  for (let i = 1; i < d.length; i++) ctx.lineTo(d[i][0], d[i][1])
  ctx.closePath()
  ctx.fillStyle = g
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  // fog wisps
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.beginPath()
  ctx.ellipse(cx - 6, cy - 4, 14, 5, -0.2, 0, Math.PI * 2)
  ctx.ellipse(cx + 10, cy + 4, 12, 4, 0.2, 0, Math.PI * 2)
  ctx.fill()
  return c
}

function buildCrop(stage: 0 | 1 | 2 | 3 | 4, accent = '#ff6b9d', glow = '#ffc2d4'): HTMLCanvasElement {
  const { c, ctx } = make(72, 96)
  const cx = 36
  const base = 78
  // shadow
  oval(ctx, cx, base + 4, 14 + stage * 2, 5, 'rgba(0,0,0,0.2)', false)
  if (stage === 0) {
    // seed mound
    oval(ctx, cx, base, 10, 5, '#6d4c41')
    oval(ctx, cx - 2, base - 2, 4, 2, '#8d6e63', false)
    return c
  }
  // leaves
  ctx.fillStyle = '#43a047'
  ctx.strokeStyle = OUT
  ctx.lineWidth = 1.8
  ctx.beginPath()
  ctx.ellipse(cx - 12, base - 8 - stage * 4, 10, 5, -0.7, 0, Math.PI * 2)
  ctx.ellipse(cx + 12, base - 6 - stage * 3, 10, 5, 0.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  // stem
  ctx.strokeStyle = '#2e7d32'
  ctx.lineWidth = 3.5
  ctx.beginPath()
  const tip = base - 14 - stage * 12
  ctx.moveTo(cx, base)
  ctx.quadraticCurveTo(cx + 3, (base + tip) / 2, cx, tip)
  ctx.stroke()
  ctx.strokeStyle = OUT
  ctx.lineWidth = 1.2
  ctx.stroke()

  if (stage >= 2) {
    const r = 6 + stage * 4
    const py = tip
    if (stage === 4) {
      ctx.shadowColor = glow
      ctx.shadowBlur = 16
    }
    const g = ctx.createRadialGradient(cx - 3, py - 4, 1, cx, py, r)
    g.addColorStop(0, '#ffffff')
    g.addColorStop(0.35, glow)
    g.addColorStop(1, accent)
    ctx.beginPath()
    ctx.ellipse(cx, py, r, r * 0.92, 0, 0, Math.PI * 2)
    ctx.fillStyle = g
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = OUT
    ctx.lineWidth = 2
    ctx.stroke()
    // shine
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.beginPath()
    ctx.ellipse(cx - r * 0.35, py - r * 0.35, r * 0.28, r * 0.18, -0.5, 0, Math.PI * 2)
    ctx.fill()
    if (stage === 4) {
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px Nunito,system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('✦', cx, py - r - 6)
    }
  }
  return c
}

function buildHouse(): HTMLCanvasElement {
  const { c, ctx } = make(120, 140)
  const cx = 60
  const cy = 110
  oval(ctx, cx, cy + 6, 42, 12, 'rgba(0,0,0,0.22)', false)

  // walls isometric
  poly(ctx, [
    [cx - 36, cy - 8],
    [cx, cy + 10],
    [cx, cy - 42],
    [cx - 36, cy - 60],
  ], '#ffcc80')
  poly(ctx, [
    [cx + 36, cy - 8],
    [cx, cy + 10],
    [cx, cy - 42],
    [cx + 36, cy - 60],
  ], '#ffb74d')

  // roof
  poly(ctx, [
    [cx - 42, cy - 56],
    [cx, cy - 88],
    [cx + 42, cy - 56],
    [cx, cy - 40],
  ], '#e53935')
  poly(ctx, [
    [cx - 42, cy - 56],
    [cx, cy - 88],
    [cx, cy - 40],
  ], '#ef5350', false)

  // chimney
  poly(ctx, [
    [cx + 18, cy - 78],
    [cx + 30, cy - 72],
    [cx + 30, cy - 52],
    [cx + 18, cy - 58],
  ], '#8d6e63')
  poly(ctx, [
    [cx + 16, cy - 80],
    [cx + 32, cy - 72],
    [cx + 32, cy - 68],
    [cx + 16, cy - 76],
  ], '#6d4c41')

  // door
  poly(ctx, [
    [cx - 8, cy + 2],
    [cx + 8, cy + 8],
    [cx + 8, cy - 18],
    [cx - 8, cy - 24],
  ], '#6d4c41')
  ctx.fillStyle = '#ffd54f'
  ctx.beginPath()
  ctx.arc(cx + 4, cy - 6, 2, 0, Math.PI * 2)
  ctx.fill()

  // window glow
  ctx.fillStyle = '#fff59d'
  ctx.shadowColor = '#ffe082'
  ctx.shadowBlur = 10
  poly(ctx, [
    [cx + 12, cy - 28],
    [cx + 26, cy - 22],
    [cx + 26, cy - 8],
    [cx + 12, cy - 14],
  ], '#fff59d')
  ctx.shadowBlur = 0
  ctx.strokeStyle = OUT
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx + 19, cy - 25)
  ctx.lineTo(cx + 19, cy - 11)
  ctx.moveTo(cx + 12, cy - 21)
  ctx.lineTo(cx + 26, cy - 15)
  ctx.stroke()

  // flower box
  poly(ctx, [
    [cx - 30, cy - 20],
    [cx - 14, cy - 14],
    [cx - 14, cy - 8],
    [cx - 30, cy - 14],
  ], '#8d6e63')
  for (const [dx, col] of [[-28, '#ff8fab'], [-22, '#fff59d'], [-17, '#ce93d8']] as const) {
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.arc(cx + dx + 22, cy - 22, 3, 0, Math.PI * 2)
    ctx.fill()
  }
  return c
}

function buildTree(fruit: boolean): HTMLCanvasElement {
  const { c, ctx } = make(100, 130)
  const cx = 50
  const cy = 118
  oval(ctx, cx, cy + 2, 22, 8, 'rgba(0,0,0,0.22)', false)
  // trunk
  poly(ctx, [
    [cx - 8, cy],
    [cx + 8, cy],
    [cx + 6, cy - 40],
    [cx - 6, cy - 40],
  ], '#8d6e63')
  // canopy layers
  const blobs: [number, number, number, string][] = [
    [0, -70, 28, '#1b5e20'],
    [-18, -58, 20, '#2e7d32'],
    [18, -56, 19, '#2e7d32'],
    [-8, -82, 16, '#43a047'],
    [10, -78, 15, '#66bb6a'],
    [0, -66, 14, '#81c784'],
  ]
  for (const [dx, dy, r, col] of blobs) {
    const g = ctx.createRadialGradient(cx + dx - 4, cy + dy - 5, 2, cx + dx, cy + dy, r)
    g.addColorStop(0, '#c8e6c9')
    g.addColorStop(0.4, col)
    g.addColorStop(1, '#0d3311')
    ctx.beginPath()
    ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2)
    ctx.fillStyle = g
    ctx.fill()
    ctx.strokeStyle = OUT
    ctx.lineWidth = 2
    ctx.stroke()
  }
  if (fruit) {
    for (const [dx, dy] of [[-12, -62], [14, -70], [0, -50], [18, -55]] as const) {
      oval(ctx, cx + dx, cy + dy, 5, 5, '#ff5252')
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.beginPath()
      ctx.arc(cx + dx - 1.5, cy + dy - 1.5, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  return c
}

function buildFence(): HTMLCanvasElement {
  const { c, ctx } = make(80, 40)
  ctx.strokeStyle = OUT
  ctx.lineWidth = 2
  ctx.fillStyle = '#bcaaa4'
  for (const x of [12, 40, 68]) {
    poly(ctx, [
      [x - 3, 32],
      [x + 3, 32],
      [x + 3, 8],
      [x - 3, 8],
    ], '#a1887f')
    ctx.fillStyle = '#d7ccc8'
    ctx.fillRect(x - 4, 6, 8, 4)
  }
  ctx.strokeStyle = '#8d6e63'
  ctx.lineWidth = 3.5
  ctx.beginPath()
  ctx.moveTo(8, 18)
  ctx.lineTo(72, 18)
  ctx.moveTo(8, 26)
  ctx.lineTo(72, 26)
  ctx.stroke()
  ctx.strokeStyle = OUT
  ctx.lineWidth = 1.5
  ctx.stroke()
  return c
}

function buildKeeper(): HTMLCanvasElement {
  const { c, ctx } = make(64, 90)
  const cx = 32
  const cy = 78
  oval(ctx, cx, cy + 2, 12, 4, 'rgba(0,0,0,0.22)', false)
  // legs
  ctx.strokeStyle = OUT
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(cx - 5, cy - 8)
  ctx.lineTo(cx - 7, cy)
  ctx.moveTo(cx + 5, cy - 8)
  ctx.lineTo(cx + 7, cy)
  ctx.stroke()
  ctx.strokeStyle = '#5d4037'
  ctx.lineWidth = 3
  ctx.stroke()
  // body
  const body = ctx.createLinearGradient(cx, cy - 40, cx, cy - 4)
  body.addColorStop(0, '#4fc3f7')
  body.addColorStop(1, '#0288d1')
  poly(ctx, [
    [cx - 14, cy - 6],
    [cx + 14, cy - 6],
    [cx + 12, cy - 36],
    [cx - 12, cy - 36],
  ], '#29b6f6')
  ctx.beginPath()
  ctx.moveTo(cx - 14, cy - 6)
  ctx.lineTo(cx + 14, cy - 6)
  ctx.lineTo(cx + 12, cy - 36)
  ctx.lineTo(cx - 12, cy - 36)
  ctx.closePath()
  ctx.fillStyle = body
  ctx.fill()
  ctx.strokeStyle = OUT
  ctx.lineWidth = 2
  ctx.stroke()
  // sash
  ctx.fillStyle = '#ffd54f'
  ctx.fillRect(cx - 12, cy - 18, 24, 5)
  ctx.strokeRect(cx - 12, cy - 18, 24, 5)
  // head (chibi)
  oval(ctx, cx, cy - 48, 14, 14, '#ffe0b2')
  // eyes
  ctx.fillStyle = OUT
  ctx.beginPath()
  ctx.arc(cx - 5, cy - 49, 2.2, 0, Math.PI * 2)
  ctx.arc(cx + 5, cy - 49, 2.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(cx - 4.2, cy - 49.8, 0.8, 0, Math.PI * 2)
  ctx.arc(cx + 5.8, cy - 49.8, 0.8, 0, Math.PI * 2)
  ctx.fill()
  // blush
  ctx.fillStyle = 'rgba(255,138,128,0.55)'
  ctx.beginPath()
  ctx.ellipse(cx - 9, cy - 44, 3, 1.5, 0, 0, Math.PI * 2)
  ctx.ellipse(cx + 9, cy - 44, 3, 1.5, 0, 0, Math.PI * 2)
  ctx.fill()
  // smile
  ctx.strokeStyle = '#e57373'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy - 44, 4, 0.2, Math.PI - 0.2)
  ctx.stroke()
  // hat
  poly(ctx, [
    [cx - 16, cy - 54],
    [cx + 16, cy - 54],
    [cx + 14, cy - 60],
    [cx - 14, cy - 60],
  ], '#0277bd')
  poly(ctx, [
    [cx - 10, cy - 60],
    [cx + 10, cy - 60],
    [cx, cy - 82],
  ], '#01579b')
  oval(ctx, cx, cy - 82, 4, 4, '#ff8fab')
  return c
}

function buildAnimal(kind: 0 | 1 | 2): HTMLCanvasElement {
  const { c, ctx } = make(64, 56)
  const cx = 32
  const cy = 42
  oval(ctx, cx, cy + 2, 14, 5, 'rgba(0,0,0,0.2)', false)
  if (kind === 0) {
    // moth / fairy
    oval(ctx, cx - 14, cy - 16, 12, 7, 'rgba(206,147,216,0.85)')
    oval(ctx, cx + 14, cy - 16, 12, 7, 'rgba(206,147,216,0.85)')
    oval(ctx, cx, cy - 12, 8, 11, '#fce4ec')
    ctx.fillStyle = OUT
    ctx.beginPath()
    ctx.arc(cx - 2, cy - 14, 1.2, 0, Math.PI * 2)
    ctx.arc(cx + 3, cy - 14, 1.2, 0, Math.PI * 2)
    ctx.fill()
  } else if (kind === 1) {
    // fox-ish
    oval(ctx, cx, cy - 12, 16, 11, '#ff9800')
    oval(ctx, cx + 14, cy - 8, 10, 5, '#ffb74d')
    poly(ctx, [
      [cx - 10, cy - 20],
      [cx - 4, cy - 28],
      [cx - 2, cy - 18],
    ], '#ff9800')
    poly(ctx, [
      [cx + 2, cy - 18],
      [cx + 4, cy - 28],
      [cx + 10, cy - 20],
    ], '#ff9800')
    oval(ctx, cx - 2, cy - 14, 9, 8, '#ffe0b2', false)
    ctx.fillStyle = OUT
    ctx.beginPath()
    ctx.arc(cx - 4, cy - 14, 1.5, 0, Math.PI * 2)
    ctx.arc(cx + 2, cy - 14, 1.5, 0, Math.PI * 2)
    ctx.fill()
  } else {
    // bunny
    oval(ctx, cx - 6, cy - 28, 4, 12, '#f5f5f5')
    oval(ctx, cx + 6, cy - 28, 4, 12, '#f5f5f5')
    oval(ctx, cx, cy - 12, 14, 12, '#fafafa')
    oval(ctx, cx, cy - 8, 8, 6, '#f8bbd0', false)
    ctx.fillStyle = OUT
    ctx.beginPath()
    ctx.arc(cx - 4, cy - 14, 1.5, 0, Math.PI * 2)
    ctx.arc(cx + 4, cy - 14, 1.5, 0, Math.PI * 2)
    ctx.fill()
  }
  return c
}

function buildFlower(): HTMLCanvasElement {
  const { c, ctx } = make(28, 36)
  ctx.fillStyle = '#43a047'
  ctx.fillRect(13, 18, 2, 14)
  const cols = ['#ff8fab', '#fff59d', '#80d8ff', '#ce93d8']
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    ctx.fillStyle = cols[i % cols.length]
    ctx.beginPath()
    ctx.ellipse(14 + Math.cos(a) * 6, 14 + Math.sin(a) * 5, 5, 3.5, a, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = OUT
    ctx.lineWidth = 1
    ctx.stroke()
  }
  oval(ctx, 14, 14, 3.5, 3.5, '#fffde7')
  return c
}

function buildLantern(): HTMLCanvasElement {
  const { c, ctx } = make(40, 64)
  ctx.strokeStyle = OUT
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(20, 8)
  ctx.lineTo(20, 18)
  ctx.stroke()
  poly(ctx, [
    [10, 20],
    [30, 20],
    [28, 48],
    [12, 48],
  ], '#ef5350')
  ctx.fillStyle = '#fff59d'
  ctx.shadowColor = '#ffecb3'
  ctx.shadowBlur = 12
  ctx.fillRect(14, 26, 12, 14)
  ctx.shadowBlur = 0
  ctx.strokeRect(14, 26, 12, 14)
  return c
}

function buildMushroom(): HTMLCanvasElement {
  const { c, ctx } = make(40, 48)
  oval(ctx, 20, 40, 10, 4, 'rgba(0,0,0,0.15)', false)
  poly(ctx, [
    [14, 36],
    [26, 36],
    [24, 22],
    [16, 22],
  ], '#efebe9')
  ctx.beginPath()
  ctx.ellipse(20, 20, 16, 12, 0, Math.PI, 0)
  ctx.closePath()
  ctx.fillStyle = '#7e57c2'
  ctx.fill()
  ctx.strokeStyle = OUT
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(14, 16, 2.5, 0, Math.PI * 2)
  ctx.arc(22, 12, 2, 0, Math.PI * 2)
  ctx.arc(26, 18, 1.8, 0, Math.PI * 2)
  ctx.fill()
  return c
}

export function buildSpriteAtlas(): void {
  atlas.clear()
  atlas.set('grassA', buildGrass(0))
  atlas.set('grassB', buildGrass(1))
  atlas.set('soil', buildSoil(false))
  atlas.set('soilWet', buildSoil(true))
  atlas.set('mist', buildMist())
  atlas.set('crop0', buildCrop(0))
  atlas.set('crop1', buildCrop(1, '#81c784', '#c8e6c9'))
  atlas.set('crop2', buildCrop(2, '#ff8fab', '#f8bbd0'))
  atlas.set('crop3', buildCrop(3, '#ff6b9d', '#ffc2d4'))
  atlas.set('cropReady', buildCrop(4, '#ff4081', '#ff80ab'))
  atlas.set('house', buildHouse())
  atlas.set('tree', buildTree(false))
  atlas.set('treeFruit', buildTree(true))
  atlas.set('fence', buildFence())
  atlas.set('keeper', buildKeeper())
  atlas.set('animal0', buildAnimal(0))
  atlas.set('animal1', buildAnimal(1))
  atlas.set('animal2', buildAnimal(2))
  atlas.set('flower', buildFlower())
  atlas.set('lantern', buildLantern())
  atlas.set('mushroom', buildMushroom())
}

export function getSprite(key: SpriteKey): HTMLCanvasElement {
  const s = atlas.get(key)
  if (!s) throw new Error(`Sprite missing: ${key}`)
  return s
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  key: SpriteKey,
  cx: number,
  cy: number,
  opts: { scale?: number; bob?: number; anchor?: 'foot' | 'center' } = {},
) {
  const spr = getSprite(key)
  const scale = (opts.scale ?? 1) / SCALE
  const w = spr.width * scale
  const h = spr.height * scale
  const bob = opts.bob ?? 0
  const x = cx - w / 2
  const y = (opts.anchor ?? 'foot') === 'foot' ? cy - h + bob : cy - h / 2 + bob
  ctx.drawImage(spr, x, y, w, h)
}

/** Colored crop variant drawn from base crop stage sprite with tint overlay */
export function drawTintedCrop(
  ctx: CanvasRenderingContext2D,
  stage: 0 | 1 | 2 | 3 | 4,
  cx: number,
  cy: number,
  color: string,
  glow: string,
  bob = 0,
) {
  const key: SpriteKey =
    stage === 0 ? 'crop0' : stage === 1 ? 'crop1' : stage === 2 ? 'crop2' : stage === 3 ? 'crop3' : 'cropReady'
  // Rebuild a small tinted version on the fly for crop color variety
  const base = getSprite(key)
  const scale = 1 / SCALE
  const w = base.width * scale
  const h = base.height * scale
  const x = cx - w / 2
  const y = cy - h + bob
  ctx.drawImage(base, x, y, w, h)
  if (stage >= 2) {
    // color wash on bloom
    ctx.save()
    ctx.globalCompositeOperation = 'source-atop'
    // soft color hint ring
    ctx.restore()
    ctx.save()
    ctx.globalAlpha = 0.35
    const g = ctx.createRadialGradient(cx, cy - h * 0.55, 2, cx, cy - h * 0.55, 16)
    g.addColorStop(0, glow)
    g.addColorStop(1, color)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx, cy - h * 0.55 + bob, 12 + stage, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}
