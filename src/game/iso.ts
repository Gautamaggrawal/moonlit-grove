/** Isometric spacing matched to cute tile sprites drawn larger on mobile. */
export const ISO_W = 112
export const ISO_H = 56
export const ISO_Z = 90

export function isoOrigin(_cols: number, rows: number): { ox: number; oy: number } {
  return { ox: (rows * ISO_W) / 2 + 56, oy: ISO_Z + 36 }
}

export function gridToScreen(col: number, row: number, cols: number, rows: number) {
  const { ox, oy } = isoOrigin(cols, rows)
  return {
    x: ox + (col - row) * (ISO_W / 2),
    y: oy + (col + row) * (ISO_H / 2),
  }
}

export function screenToGrid(sx: number, sy: number, cols: number, rows: number) {
  const { ox, oy } = isoOrigin(cols, rows)
  const x = sx - ox
  const y = sy - oy
  return {
    col: (x / (ISO_W / 2) + y / (ISO_H / 2)) / 2,
    row: (y / (ISO_H / 2) - x / (ISO_W / 2)) / 2,
  }
}

export function worldSize(cols: number, rows: number) {
  return {
    w: ((cols + rows) * ISO_W) / 2 + 120,
    h: ((cols + rows) * ISO_H) / 2 + ISO_Z + 160,
  }
}

export function depthKey(col: number, row: number, layer = 0) {
  return (col + row) * 20 + layer
}
