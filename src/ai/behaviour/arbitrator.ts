import Slime from '../../characters/slime';
import { CellType, ScoutedGeneral, ScoutedPortal } from '../scouting_map/cells';
import { ScoutedMap } from '../scouting_map/map';

export class Arbitrator {
	private map: ScoutedMap = new ScoutedMap();

	setPortal(portal: ScoutedPortal) {
		this.map.set(portal);
	}

	deletePortal(cell: ScoutedGeneral) {
		this.map.set({
			...cell,
			type: CellType.Empty,
		});
	}
}

export class ArbitratorInstance {
	constructor(private soul: Arbitrator, private x: number, private y: number) {}

	visitedBySlime(slime: Slime) {
		const visit = slime.visitInformation;
		if (visit.scoutedPortal != null) this.soul.setPortal(visit.scoutedPortal);
		if (visit.pickPoint != null) this.soul.deletePortal(visit.pickPoint);
	}
}
