const { abs } = Math

export const enum KeyMap {
  w = 'KeyW',
  d = 'KeyD',
  s = 'KeyS',
  a = 'KeyA',
  p = 'KeyP',
  space = 'Space',
  arrowUp = 'ArrowUp',
  arrowRight = 'ArrowRight',
  arrowDown = 'ArrowDown',
  arrowLeft = 'ArrowLeft',
  swipeUp = 'SwipeUp',
  swipeRight = 'SwipeRight',
  swipeDown = 'SwipeDown',
  swipeLeft = 'SwipeLeft',
  click = 'Click',
}

export class Input {
  state = new Set<KeyMap>()
  pressed = new Set<KeyMap>()
  released = new Set<KeyMap>()
  gesture: null | KeyMap.swipeUp | KeyMap.swipeRight | KeyMap.swipeDown | KeyMap.swipeLeft = null
  startX = 0
  startY = 0
  moveX = 0
  moveY = 0
  swipeX = 0
  swipeY = 0
  timeout = 0

  constructor(public game: unknown) {
    addEventListener('keydown', this.handleKeyDown)
    addEventListener('keyup', this.handleKeyUp)
    addEventListener('pointerdown', this.handlePointerDown)
    addEventListener('contextmenu', this.handleContextMenu)
  }

  handleKeyDown = (event: KeyboardEvent) => {
    this.state.add(event.code as KeyMap)
    this.pressed.add(event.code as KeyMap)
  }

  handleKeyUp = (event: KeyboardEvent) => {
    this.released.add(event.code as KeyMap)
  }

  handlePointerDown = (event: PointerEvent) => {
    if (!event.isPrimary) return
    addEventListener('pointermove', this.handlePointerMove)
    addEventListener('pointerup', this.handlePointerUp)
    addEventListener('pointercancel', this.handlePointerUp)
    clearTimeout(this.timeout)
    this.startX = this.moveX = this.swipeX = event.pageX
    this.startY = this.moveY = this.swipeY = event.pageY
    this.timeout = window.setTimeout(this.click, 500)
  }

  handlePointerMove = (event: PointerEvent) => {
    if (!event.isPrimary) return
    this.moveX = event.pageX
    this.moveY = event.pageY
    const x = event.pageX - this.swipeX
    const y = event.pageY - this.swipeY
    const absX = abs(x)
    const absY = abs(y)
    const threshold = 10
    if (absX < threshold && absY < threshold) return
    const gesture =
      absX > absY
        ? x < 0
          ? KeyMap.swipeLeft
          : KeyMap.swipeRight
        : y < 0
        ? KeyMap.swipeUp
        : KeyMap.swipeDown
    if (gesture === this.gesture) return
    clearTimeout(this.timeout)
    this.swipeX = event.pageX
    this.swipeY = event.pageY
    this.gesture = gesture
    this.state.add(gesture)
    this.pressed.add(gesture)
    this.timeout = window.setTimeout(this.click, 500)
  }

  handlePointerUp = (event: PointerEvent) => {
    if (!event.isPrimary) return
    removeEventListener('pointermove', this.handlePointerMove)
    removeEventListener('pointerup', this.handlePointerUp)
    removeEventListener('pointercancel', this.handlePointerUp)
    clearTimeout(this.timeout)
    if (this.startX === event.pageX && this.startY === event.pageY) {
      this.state.add(KeyMap.click)
      this.pressed.add(KeyMap.click)
      this.released.add(KeyMap.click)
    }
    if (!this.gesture) return
    this.released.add(this.gesture)
    this.gesture = null
  }

  handleContextMenu = (event: MouseEvent) => {
    event.preventDefault()
  }

  click = () => {
    if (this.moveX === this.swipeX && this.moveY === this.swipeY) {
      this.state.add(KeyMap.click)
      this.pressed.add(KeyMap.click)
      this.released.add(KeyMap.click)
    }
    this.swipeX = this.moveX
    this.swipeY = this.moveY
    this.timeout = window.setTimeout(this.click, 84)
  }

  update(dt: number) {
    for (const key of this.released) {
      this.state.delete(key)
    }
    this.pressed.clear()
    this.released.clear()
  }
}
