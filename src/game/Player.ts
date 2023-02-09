import { Input, KeyMap } from './Input'
import { Food } from './Food'

const { floor } = Math
const headColor = '#fff'
const enum Dir {
  none,
  up,
  right,
  down,
  left,
}

interface PlayerParams {
  context: CanvasRenderingContext2D
  width: number
  height: number
  gridX: number
  gridY: number
  gridW: number
  gridH: number
  cols: number
  rows: number
  food: Food
  score: number
  input: Input
  gameOver: () => void
}

export class Player {
  chain = [{ col: 0, row: 0, color: headColor }]
  dir = Dir.none
  lastDir = Dir.none
  speed = 0.5
  timer = 0
  delay = 0

  constructor(public game: PlayerParams) {
    this.spawn()
    game.food.spawn(this.chain)
  }

  spawn() {
    const { cols, rows } = this.game
    this.chain = [{ col: floor(cols / 2), row: floor(rows / 2), color: headColor }]
    this.dir = Dir.none
  }

  update(dt: number) {
    // input
    const { game, chain } = this
    const btn = game.input.pressed
    const up = btn.has(KeyMap.arrowUp) || btn.has(KeyMap.w) || btn.has(KeyMap.swipeUp)
    const right = btn.has(KeyMap.arrowRight) || btn.has(KeyMap.d) || btn.has(KeyMap.swipeRight)
    const down = btn.has(KeyMap.arrowDown) || btn.has(KeyMap.s) || btn.has(KeyMap.swipeDown)
    const left = btn.has(KeyMap.arrowLeft) || btn.has(KeyMap.a) || btn.has(KeyMap.swipeLeft)
    let dir = this.dir
    let force = btn.has(KeyMap.space) || btn.has(KeyMap.click)
    if (up && this.lastDir !== Dir.down) {
      dir = Dir.up
      force = true
    }
    if (right && this.lastDir !== Dir.left) {
      dir = Dir.right
      force = true
    }
    if (down && this.lastDir !== Dir.up) {
      dir = Dir.down
      force = true
    }
    if (left && this.lastDir !== Dir.right) {
      dir = Dir.left
      force = true
    }
    // force &&= dir === this.lastDir
    this.dir = dir
    if (!dir) return

    // speed limit
    this.timer += dt
    if (this.timer < this.delay && !force) return
    this.delay = force ? this.timer + this.speed : this.delay + this.speed

    // next step
    const head = chain[chain.length - 1]
    const { cols, rows, food } = game
    let nextCol = head.col + (dir === Dir.left ? -1 : dir === Dir.right ? 1 : 0)
    let nextRow = head.row + (dir === Dir.up ? -1 : dir === Dir.down ? 1 : 0)
    if (nextCol >= cols) nextCol = 0
    if (nextRow >= rows) nextRow = 0
    if (nextCol < 0) nextCol = cols - 1
    if (nextRow < 0) nextRow = rows - 1

    // collision
    for (let i = 0; i < chain.length; i++) {
      const p = chain[i]
      if (nextCol === p.col && nextRow === p.row) {
        game.gameOver()
        return
      }
    }

    // actual move
    if (nextCol === food.col && nextRow === food.row) {
      head.color = food.color.replace('100%,50%', '50%,90%')
      chain.push({ col: nextCol, row: nextRow, color: headColor })
      food.kill()
      food.spawn(chain)
      game.score++
      if (game.score % 10 === 0) this.speed *= 0.9
      return
    }
    const length = chain.length - 1
    for (let i = 0; i < length; i++) {
      const prev = chain[i + 1]
      const curr = chain[i]
      curr.col = prev.col
      curr.row = prev.row
    }
    head.col = nextCol
    head.row = nextRow
    this.lastDir = dir
  }

  render(interpolation: number) {
    const { game, chain } = this
    const { context: ctx, gridX, gridY, gridW, gridH, cols, rows } = game
    const colW = gridW / cols
    const colH = gridH / rows
    ctx.shadowBlur = 20
    ctx.shadowColor = 'rgba(255,255,255,.3)'
    const length = chain.length - 1
    for (let i = length; i >= 0; i--) {
      const { col, row, color } = chain[i]
      ctx.fillStyle = color
      ctx.fillRect(gridX + col * colH, gridY + row * colH, colW, colH)
      if (i === length) ctx.shadowBlur = 0
    }
  }
}
