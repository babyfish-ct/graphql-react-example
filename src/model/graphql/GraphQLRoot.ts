export type GraphQLRoot<T> = { [key: string]: T };

/*
 * GraphQL has a tiny problem, the query result is a wrapper of real data, for examples:
 *
 * example-1:
 * 
 *     { //wrapper object
 *         departmentCount: 2 //real data
 *     }
 * 
 * example-2:
 * 
 *     { //wrapper object
 *         employees: [ //real data
 *             { id: 1, name: 'Jim' }
 *             { id: 2, name: 'Kate }
 *         ]
 *     }
 * 
 * The develop want to get the real data, such as '2' and that list in these examples,
 * but GraphQL wraps the real data by an object whose field name is unknown.
 * 
 * In most cases, that wrapper object has only one field, unwrap it to get the real data
 */
export function unwrapRoot<T>(root: GraphQLRoot<T> | undefined) {
    if (root === undefined) {
        return undefined;
    }
    const keys = Object.keys(root);
    if (keys.length !== 1) {
        throw new Error("The argument must an object with only one property if it's not undefined");
    }
    return root[keys[0]];
}