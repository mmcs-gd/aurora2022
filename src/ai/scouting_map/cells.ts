export enum CellType {
    Portal,
    Empty
}

export type ScoutedCell = ScoutedPortal | ScoutedEmpty

export type ScoutedPortal = {
    type: CellType.Portal
    capacity: number,
    count: number,
} & ScoutedGeneral

export type ScoutedEmpty = {
    type: CellType.Empty,
} & ScoutedGeneral

export type ScoutedGeneral = {
    timestamp: number,
    x: number,
    y: number,
}