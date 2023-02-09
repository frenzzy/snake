interface PoolObjectInstance<PoolObjectParams> {
  create: (params: PoolObjectParams) => void
  update: (dt: number) => void
  render: (interpolation: number) => void
  isAlive: boolean
}

interface PoolObject<Game, PoolObjectParams> {
  new (game: Game, params: PoolObjectParams): PoolObjectInstance<PoolObjectParams>
}

export class Pool<Game, PoolObjectParams> {
  object: PoolObject<Game, PoolObjectParams>
  objects: PoolObjectInstance<PoolObjectParams>[]
  size = 0
  maxSize = 1024

  constructor(public game: Game, object: PoolObject<Game, PoolObjectParams>) {
    this.object = object
    this.objects = []
  }

  update(dt: number) {
    let doSort = false
    let i = this.size
    while (i--) {
      const object = this.objects[i]
      object.update(dt)
      if (!object.isAlive) {
        doSort = true
        this.size--
      }
    }
    if (doSort) {
      this.objects.sort((a, b) => Number(b.isAlive) - Number(a.isAlive))
    }
  }

  render(interpolation: number) {
    let i = this.size
    while (i--) {
      this.objects[i].render(interpolation)
    }
  }

  create(params: PoolObjectParams) {
    if (this.size >= this.maxSize) return
    this.size++
    const add = this.objects.length <= this.size
    const object = add ? new this.object(this.game, params) : this.objects[this.size - 1]
    if (add) this.objects.push(object)
    else object.create(params)
    return object
  }
}
