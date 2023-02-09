import { Pool } from './Pool'
import { Particle, ParticleParams } from './Particle'

const { random, floor } = Math

interface FoodParams {
  context: CanvasRenderingContext2D
  gridX: number
  gridY: number
  gridW: number
  gridH: number
  cols: number
  rows: number
}

export class Food {
  col = 0
  row = 0
  color = ''
  pool: Pool<FoodParams, ParticleParams>

  constructor(public game: FoodParams) {
    this.pool = new Pool(game, Particle)
  }

  spawn(exclude: { col: number; row: number }[]) {
    const { cols, rows } = this.game
    this.col = floor(random() * cols)
    this.row = floor(random() * rows)
    for (const p of exclude) {
      if (this.col === p.col && this.row === p.row) {
        this.spawn(exclude)
        return
      }
    }
    this.color = `hsl(${floor(random() * 360)},100%,50%)`
  }

  kill() {
    const { gridX, gridY, gridW, gridH, cols, rows } = this.game
    for (let i = 0; i < 20; i++) {
      const colW = gridW / cols
      const colH = gridH / rows
      this.pool.create({
        x: gridX + this.col * colW + colW / 4,
        y: gridY + this.row * colH + colH / 4,
        velX: random() * 360 - 180,
        velY: random() * 360 - 180,
        width: colW / 2,
        height: colH / 2,
        color: this.color,
      })
    }
  }

  update(dt: number) {
    this.pool.update(dt)
  }

  render(interpolation: number) {
    const { col, row, game } = this
    const { context: ctx, gridX, gridY, gridW, gridH, cols, rows } = game
    const colW = gridW / cols
    const colH = gridH / rows
    ctx.globalCompositeOperation = 'lighter'
    ctx.shadowBlur = 20
    ctx.shadowColor = this.color
    ctx.fillStyle = this.color
    ctx.fillRect(gridX + col * colW, gridY + row * colH, colW, colH)
    ctx.globalCompositeOperation = 'source-over'
    ctx.shadowBlur = 0
    this.pool.render(interpolation)
  }
}
