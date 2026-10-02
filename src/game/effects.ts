export type Floater = {
  x: number
  y: number
  vy: number
  life: number
  maxLife: number
  text: string
  color: string
}

export type Spark = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
  size: number
}

export function spawnHarvestSpark(centerX: number, centerY: number, color: string, sparks: Spark[]): void {
  for (let i = 0; i < 14; i++) {
    const a = (Math.PI * 2 * i) / 14 + Math.random() * 0.4
    const speed = 1.5 + Math.random() * 2.5
    sparks.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - 1,
      life: 1,
      color,
      size: 2 + Math.random() * 3,
    })
  }
}

export function spawnFloater(x: number, y: number, text: string, color: string, floaters: Floater[]): void {
  floaters.push({
    x,
    y,
    vy: -0.9,
    life: 1,
    maxLife: 1,
    text,
    color,
  })
}

export function tickEffects(floaters: Floater[], sparks: Spark[], dt: number): void {
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i]
    f.y += f.vy * dt * 60
    f.life -= dt * 0.9
    if (f.life <= 0) floaters.splice(i, 1)
  }
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i]
    s.x += s.vx * dt * 60
    s.y += s.vy * dt * 60
    s.vy += dt * 4
    s.life -= dt * 1.4
    if (s.life <= 0) sparks.splice(i, 1)
  }
}

export function drawEffects(ctx: CanvasRenderingContext2D, floaters: Floater[], sparks: Spark[]): void {
  for (const s of sparks) {
    ctx.globalAlpha = Math.max(0, s.life)
    ctx.fillStyle = s.color
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  for (const f of floaters) {
    const a = Math.max(0, f.life)
    ctx.globalAlpha = a
    ctx.font = 'bold 15px Outfit, system-ui'
    ctx.textAlign = 'center'
    ctx.fillStyle = f.color
    ctx.shadowColor = f.color
    ctx.shadowBlur = 8
    ctx.fillText(f.text, f.x, f.y)
    ctx.shadowBlur = 0
  }
  ctx.globalAlpha = 1
}
