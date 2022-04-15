import { ScoutedCell } from "./cells";

export class ScoutedMap {
    private scoutedCells: Map<string, ScoutedCell> = new Map()

    public set(it: ScoutedCell) {
        this.scoutedCells.set(key_point(it.x, it.y), it)
    }

    public get(x: number, y: number): ScoutedCell | undefined {
        return this.scoutedCells.get(key_point(x, y))
    }

    public get_all(): ScoutedCell[] {
        return Array.from(this.scoutedCells.values());
    }

    public merge(other: ScoutedMap) {
        for (const cell of other.get_all()) {
            const self_cell = this.get(cell.x, cell.y)
            if (self_cell === undefined || self_cell.timestamp < cell.timestamp) {
                this.set(cell)
            }
        }
    }
}

function key_point(x: number, y: number): string {
    return `${x}_${y}`
}