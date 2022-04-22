export default class Vector {

    x: number;
    y: number;

    constructor(
		x?: number,
		y?: number,
	) {
		this.x = x == undefined ? 0 : x;
        this.y = y == undefined ? 0 : y;
	}

    public static create (x?: number, y?: number) {
        return new Vector(x, y);
    }

}