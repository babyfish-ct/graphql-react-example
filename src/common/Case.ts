import { ReactNode } from 'react';

export class Case {

    private matched: boolean = false;

    private result: ReactNode = null;

    when(condition: boolean, node: ReactNode): this {
        if (!this.matched && condition) {
            this.matched = true;
            this.result = node;
        }
        return this;
    }

    otherwise(node: ReactNode): ReactNode {
        if (this.matched === false) {
            this.matched = true;
            this.result = node;
        }
        return this.result;
    }
}