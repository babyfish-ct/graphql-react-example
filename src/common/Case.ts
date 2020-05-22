import { ReactElement } from 'react';

export class Case {

    private matched: boolean = false;

    private result: ReactElement | null = null;

    when(condition: boolean, node: ReactElement): this {
        if (!this.matched && condition) {
            this.matched = true;
            this.result = node;
        }
        return this;
    }

    otherwise(node: ReactElement): ReactElement | null {
        if (this.matched === false) {
            this.matched = true;
            this.result = node;
        }
        return this.result;
    }
}