import React, { PureComponent, PropsWithChildren, Children } from 'react';

export function hasValue<T>(value: T | null | undefined): boolean {
    if (value === undefined) {
        return false;
    }
    if (value === null) {
        return false;
    }
    if (Array.isArray(value) && value.length === 0) {
        return false;
    }
    return true;
}

export class Value<T> extends PureComponent<
    PropsWithChildren<{
        value: T | null | undefined
    }>
> {
    render(): JSX.Element {
        const {value, children} = this.props;
        if (value === undefined) {
            return <div>Not loaded</div>
        }
        if (value === null) {
            return <div>No data</div>
        }
        if (Array.isArray(value) && value.length === 0) {
            return <div>Empty list</div>
        }
        if (children === undefined) {
            return <div>{value}</div>
        }
        return (
            <div>
                {children}
            </div>
        );
    }
}