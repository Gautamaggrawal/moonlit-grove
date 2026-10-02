export type Camera = {
  x: number
  y: number
  zoom: number
}

export const camera: Camera = { x: 0, y: 0, zoom: 1 }

export function clampCamera(cam: Camera, worldW: number, worldH: number, viewW: number, viewH: number): void {
  const scaledW = worldW * cam.zoom
  const scaledH = worldH * cam.zoom
  const minX = Math.min(0, viewW - scaledW)
  const minY = Math.min(0, viewH - scaledH)
  cam.x = Math.min(0, Math.max(minX, cam.x))
  cam.y = Math.min(0, Math.max(minY, cam.y))
  cam.zoom = Math.min(1.55, Math.max(0.7, cam.zoom))
}

export function screenToWorld(
  cam: Camera,
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
  viewW: number,
  viewH: number,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect()
  const sx = ((clientX - rect.left) / rect.width) * viewW
  const sy = ((clientY - rect.top) / rect.height) * viewH
  return {
    x: (sx - cam.x) / cam.zoom,
    y: (sy - cam.y) / cam.zoom,
  }
}
