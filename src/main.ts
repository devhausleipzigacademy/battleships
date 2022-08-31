import { createGrid, getSquareValue } from "./grid";
import { createComputerShips, createPlayerShips, fireRandom, rotateShip, addShipListeners, generateShipPlacement, takeShot } from "./ships";
import { makePositionFromId } from "./utils";
import type { Grid, PlayerShips, ComputerShips } from './types'

const rotateButton = document.getElementById('rotate') as HTMLElement
const startButton = document.getElementById('start') as HTMLElement
let playerTurn = 1
let computerTurn = 1

const playerGrid: Grid = createGrid('player')
const computerGrid: Grid = createGrid('computer')

const playerShips: PlayerShips = createPlayerShips()
const computerShips: ComputerShips = createComputerShips()

rotateButton.addEventListener('click', () => {
  playerShips.shipsToBePlaced.forEach(ship => rotateShip(ship))
})

addShipListeners(playerGrid, playerShips)



computerShips.ships.forEach(ship => {
  generateShipPlacement(computerGrid.state, ship)
})

startButton.addEventListener('click', () => {
  if (playerShips.shipsToBePlaced.length > 0) {
    alert('You need to place all your ships to begin!')
    return
  }
  computerGrid.element.addEventListener('click', fire)
})

function fire(event: Event): void {
  if (!computerShips.ships.length || !playerShips.ships.length) {
    alert("Stop clicking, the game is over!")
    return
  }
  const square = event.target as HTMLElement
  const position = makePositionFromId(square.id)
  const squareValue = getSquareValue(computerGrid.state, position)

  if (playerTurn !== computerTurn) {
    return
  }

  if (squareValue === 'hit' || squareValue === 'miss') {
    alert('You already fired at that square pick another one')
    return
  }

  takeShot(computerGrid, computerShips, square)
  playerTurn += 1

  setTimeout(() => {
    const randomFire = fireRandom(playerGrid)
    takeShot(playerGrid, playerShips, randomFire)
    computerTurn += 1
  }, 500)
}

