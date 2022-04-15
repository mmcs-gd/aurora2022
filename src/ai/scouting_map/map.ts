export enum CellType {
    Portal,
    Empty,
}

export type ScoutedCell = {
    type: CellType.Portal
    timestamp: number,
    capacity: number,
    size: number,
    x: number,
    y: number,
} | {
    type: CellType.Empty,
    timestamp: number,
    x: number,
    y: number,
}

export class ScoutedMap {
    private scouted_cells: Map<string, ScoutedCell> = new Map()

    public set(it: ScoutedCell) {
        this.scouted_cells.set(key_point(it.x, it.y), it)
    }

    public get(x: number, y: number): ScoutedCell | undefined {
        return this.scouted_cells.get(key_point(x, y))
    }

    public get_all(): IterableIterator<ScoutedCell> {
        return this.scouted_cells.values();
    }
}

function key_point(x: number, y: number): string {
    return `${x}_${y}`
}