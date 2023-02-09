export class Loop {
  private simulationDelta: number
  private simulationStep: number
  private frameDelta: number
  private lastFrameTime: number
  private requestId: number

  constructor(
    public game: {
      update: (deltaTime: number) => void
      render: (interpolation: number) => void
    },
  ) {
    const fps = 60
    this.simulationDelta = 1000 / fps
    this.simulationStep = 1 / fps
    this.frameDelta = 0
    this.lastFrameTime = 0
    this.requestId = 0
  }

  start() {
    if (!this.requestId) {
      this.lastFrameTime = performance.now()
      this.requestId = requestAnimationFrame(this.animate)

      // initial render
      this.game.render(1)
    }
  }

  stop() {
    if (this.requestId) {
      cancelAnimationFrame(this.requestId)
      this.requestId = 0
    }
  }

  animate = (time: number) => {
    this.requestId = requestAnimationFrame(this.animate)

    const dt = time - this.lastFrameTime
    this.lastFrameTime = time

    // discard idle time
    if (dt > 1000) {
      return
    }

    this.frameDelta += dt

    while (this.frameDelta >= this.simulationDelta) {
      this.game.update(this.simulationStep)
      this.frameDelta -= this.simulationDelta
    }

    this.game.render(this.frameDelta / this.simulationDelta)
  }
}
