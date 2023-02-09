export interface ParticleParams {
  x: number
  y: number
  velX: number
  velY: number
  width: number
  height: number
  color: string
}

export class Particle {
  x = 0
  y = 0
  velX = 0
  velY = 0
  width = 1
  height = 1
  color = ''
  gravityY = -540
  isAlive = false

  constructor(public game: { context: CanvasRenderingContext2D }, params: ParticleParams) {
    this.create(params)
  }

  create({ x, y, velX, velY, width, height, color }: ParticleParams) {
    this.x = x
    this.y = y
    this.velX = velX
    this.velY = velY
    this.width = width
    this.height = height
    this.color = color
    this.isAlive = true
  }

  update(dt: number) {
    this.width -= 18 * dt
    this.height -= 18 * dt
    this.x += this.velX * dt
    this.y += this.velY * dt
    this.velY -= this.gravityY * dt
    if (this.width <= 0 && this.height <= 0) {
      this.isAlive = false
    }
  }

  render() {
    const ctx = this.game.context
    ctx.shadowColor = this.color
    ctx.shadowBlur = 0
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.width, this.height)
    ctx.globalCompositeOperation = 'source-over'
  }
}
