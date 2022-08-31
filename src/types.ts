export type Position = `${string}-${number}`;
export type PossibleValue = "" | ShipType | "hit" | "miss";
export type GridState = Record<Position, PossibleValue>;
export type PlayerType = 'player' | 'computer'
export type ShipType =
  | "destroyer"
  | "submarine"
  | "cruiser"
  | "battleship"
  | "carrier";

export type Ship = {
  type: ShipType
  length: number
  isHorizontal: boolean
  hits: number
  element?: HTMLElement
}

export interface ComputerShips {
  ships: Ship[]
}

export interface PlayerShips extends ComputerShips {
  shipsToBePlaced: Ship[]
  selectedShipPart: number
  selectedShip: Ship | null
}

export type Grid = {
  type: PlayerType
  state: GridState
  element: HTMLElement
  squares: HTMLElement[]
}
