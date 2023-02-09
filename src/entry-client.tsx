import './root.css'
import { Game } from './game/Game'

;(window as any).game = new Game()

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('https://frenzzy.github.io/snake/service-worker.js');
}
