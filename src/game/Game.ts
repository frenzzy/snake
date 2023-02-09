import { Loop } from './Loop.js'
import { Input, KeyMap } from './Input'
import { Food } from './Food.js'
import { Player } from './Player'

const { min } = Math

export class Game {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  width = 1
  height = 1
  gridX = 0
  gridY = 0
  gridW = 1
  gridH = 1
  cols = 20
  rows = 20
  score = 0
  maxScore = Number(localStorage.getItem('maxScore')) || 0
  paused = false
  resized = false
  isGameOver = false
  input: Input
  loop: Loop
  food: Food
  player: Player

  constructor() {
    this.canvas = document.querySelector('canvas') as HTMLCanvasElement
    this.context = this.canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D
    this.context.imageSmoothingEnabled = false
    this.resize()

    this.input = new Input(this)
    this.loop = new Loop(this)
    this.food = new Food(this)
    this.player = new Player(this)

    addEventListener('resize', this.handleResize)

    this.loop.start()
  }

  handleResize = () => {
    this.resized = false
  }

  resize() {
    if (this.resized) return
    this.resized = true
    const { canvas, context } = this
    const { width, height } = canvas.getBoundingClientRect()
    this.width = width
    this.height = height
    canvas.width = width * devicePixelRatio
    canvas.height = height * devicePixelRatio
    context.scale(devicePixelRatio, devicePixelRatio)
    const minSize = min(width * 0.9, height * 0.65)
    this.gridW = minSize
    this.gridH = minSize
    this.gridX = (width - minSize) / 2
    this.gridY = (height - minSize) / 2
  }

  gameOver() {
    this.isGameOver = true
    if (this.maxScore < this.score) {
      this.maxScore = this.score
      localStorage.setItem('maxScore', `${this.maxScore}`)
    }
  }

  update = (dt: number) => {
    if (this.input.pressed.has(KeyMap.p)) this.paused = !this.paused
    if (this.isGameOver) {
      if (this.input.pressed.size) {
        this.isGameOver = false
        this.score = 0
        this.player.spawn()
      }
    }
    if (!this.paused) {
      this.player.update(dt)
      this.food.update(dt)
    }
    this.input.update(dt)
  }

  render = (interpolation: number) => {
    this.resize()
    const { context: ctx, width, height, gridX, gridY, gridW, gridH } = this
    ctx.fillStyle = '#222738'
    ctx.fillRect(0, 0, width, height)

    // grid
    ctx.fillStyle = '#181825'
    ctx.fillRect(gridX, gridY, gridW, gridH)
    ctx.lineWidth = 1
    ctx.strokeStyle = '#232332'
    const colWidth = gridW / this.cols
    const colHeight = gridH / this.rows
    for (let i = 1; i < this.cols; i++) {
      const w = gridX + colWidth * i
      ctx.beginPath()
      ctx.moveTo(w, gridY)
      ctx.lineTo(w, gridY + gridH)
      ctx.stroke()
    }
    for (let i = 1; i < this.rows; i++) {
      const h = gridY + colHeight * i
      ctx.beginPath()
      ctx.moveTo(gridX, h)
      ctx.lineTo(gridX + gridW, h)
      ctx.stroke()
    }
    ctx.closePath()

    this.player.render(interpolation)
    this.food.render(interpolation)

    ctx.font = `${min(gridH * 0.05, 16)}px Futura,sans-serif`
    ctx.textBaseline = 'bottom'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#6e7888'
    const labelY = (height - gridH) / 4 - min(height * 0.01, 10)
    ctx.fillText('SCORE', gridX, labelY)
    ctx.textAlign = 'right'
    ctx.fillText('MAX SCORE', gridX + gridW, labelY)
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    ctx.font = `bold ${min(gridH * 0.1, 32)}px Futura,sans-serif`
    const valueY = (height - gridH) / 4
    ctx.fillText(`${this.score}`, gridX, valueY)
    ctx.textAlign = 'right'
    ctx.fillText(`${this.maxScore}`, gridX + gridW, valueY)
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillText('SNAKE', gridX + gridW / 2, height - valueY)

    if (this.paused && !this.isGameOver) {
      ctx.fillStyle = '#4cffd7'
      ctx.fillText('PAUSED', width / 2, height / 2)
      return
    }

    if (!this.isGameOver) return
    const border = gridH * 0.02
    const bX = gridX - border
    const bY = gridY - border
    const bW = gridW + border * 2
    const bH = gridH + border * 2
    ctx.fillStyle = 'rgba(24,24,37,.9)'
    ctx.fillRect(bX, bY, bW, bH)
    ctx.strokeStyle = '#222738'
    ctx.lineWidth = border * 2
    ctx.strokeRect(bX, bY, bW, bH)
    ctx.fillStyle = '#4cffd7'
    ctx.fillText('GAME OVER', width / 2, height / 2)
  }
}
