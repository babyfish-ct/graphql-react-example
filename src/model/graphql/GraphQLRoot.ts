export type GraphQLRoot<T> = { [key: string]: T };

export function unwrapRoot<T>(root: GraphQLRoot<T> | undefined) {
    if (root === undefined) {
        return undefined;
    }
    const keys = Object.keys(root);
    if (keys.length !== 1) {
        throw new Error("The argument must an object with only one property is it's not undefined");
    }
    return root[keys[0]];
}