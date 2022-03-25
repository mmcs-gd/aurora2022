class StateTableRow<T = unknown> {
    constructor(
        public readonly initialState: string,
        public readonly condition: (this: T) => void,
        public readonly finalState: string,
        public readonly onStateChanged?: (this: T) => void) {
    }
}

class StateTable<T> {
    private readonly states: StateTableRow<T>[] = []
    constructor(private readonly context: T) {
    }

    addState(state: StateTableRow<T>) {
        this.states.push(state);
    }

    getNextState(current: string) {
        const row = this.states
            .filter(x => x.initialState === current)
            .find(x => x.condition.call(this.context));
        if (row) {
            if (row.onStateChanged) {
                row.onStateChanged.call(this.context);
            }
            return row.finalState;
        }
        return current;
    }
}
export { StateTableRow, StateTable };