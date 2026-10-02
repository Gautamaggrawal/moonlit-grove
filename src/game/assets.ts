/** Load cute painted farm sprites from /public/sprites/cute */

export type FarmSprite =
  | 'grass'
  | 'soil'
  | 'mist'
  | 'house'
  | 'tree'
  | 'crop_ready'
  | 'crop_young'
  | 'crop_pink'
  | 'crop_blue'
  | 'crop_gold'
  | 'crop_mint'
  | 'keeper'
  | 'bunny'

const images = new Map<FarmSprite, HTMLImageElement>()

const FILES: FarmSprite[] = [
  'grass',
  'soil',
  'mist',
  'house',
  'tree',
  'crop_ready',
  'crop_young',
  'crop_pink',
  'crop_blue',
  'crop_gold',
  'crop_mint',
  'keeper',
  'bunny',
]

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.src = src
  })
}

export async function loadFarmSprites(): Promise<void> {
  images.clear()
  const base = import.meta.env.BASE_URL
  await Promise.all(
    FILES.map(async (key) => {
      const img = await loadImage(`${base}sprites/cute/${key}.png`)
      images.set(key, img)
    }),
  )
}

export function spr(key: FarmSprite): HTMLImageElement {
  const img = images.get(key)
  if (!img) throw new Error(`Sprite not loaded: ${key}`)
  return img
}

/** Draw sprite with foot-center anchor at (cx, cy). */
export function drawSpr(
  ctx: CanvasRenderingContext2D,
  key: FarmSprite,
  cx: number,
  cy: number,
  opts: { scale?: number; bob?: number; alpha?: number } = {},
) {
  const img = spr(key)
  const scale = opts.scale ?? 1
  const bob = opts.bob ?? 0
  const w = img.width * scale
  const h = img.height * scale
  const x = cx - w / 2
  const y = cy - h + bob
  if (opts.alpha !== undefined && opts.alpha < 1) {
    ctx.save()
    ctx.globalAlpha = opts.alpha
    ctx.drawImage(img, x, y, w, h)
    ctx.restore()
  } else {
    ctx.drawImage(img, x, y, w, h)
  }
}
