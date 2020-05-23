/*
 * The antd tree returns the selected keys like this
 * [
 *    'id',
 *    'name',
 *    'employees.id',
 *    'employees.name',
 *    'employees.gender',
 *    'employees.supervisor.id',
 *    'employees.supervisor.name',
 *    'employees.supervisor.gender'
 * ]
 * 
 * This method merge the paths and return the dynamic fetch structure of graphql, like this
 * 
 * `
 *     id
 *     name
 *     employees {
 *          id
 *          name
 *          gender
 *          supervisor {
 *              id
 *              name
 *              gender
 *          }
 *     }
 * `
 */
export function createDynamicGraphQLBody(paths: string[]): string {
    if (paths.length === 0) {
        return "__typename";
    }
    const builder = new GraphQLNodeBuilder('');
    for (const path of paths) {
        builder.addChild(path);
    }
    return builder.build(0);
}

class GraphQLNodeBuilder {
    
    // Map + List = OrderedMap(like java.util.LinkedHashMap)
    private childMap: {[key: string]: GraphQLNodeBuilder} = {};

    private childList: GraphQLNodeBuilder[] = [];

    constructor(
        private readonly name: string
    ) {}

    addChild(path: string): GraphQLNodeBuilder {
        const index = path.indexOf('.');
        if (index === -1) {
            return this.addChildByName(path); 
        } else {
            return this
            .addChildByName(path.substring(0, index))
            .addChild(path.substring(index + 1));
        }
    }

    private addChildByName(name: string): GraphQLNodeBuilder {
        let child = this.childMap[name];
        if (child === undefined) {
            child = new GraphQLNodeBuilder(name);
            this.childMap[name] = child;
            this.childList.push(child);
        }
        return child;
    }

    build(depth: number): string {
        let result = indentString(depth);
        result += this.name;
        if (this.childList.length === 0) {
            result += '\n';
        } else if (depth !== 0) {
            result += ' {\n';
            for (const child of this.childList) {
                result += child.build(depth + 1);
            }
            result += indentString(depth);
            result += '}\n';
        } else {
            result += ' \n';
            for (const child of this.childList) {
                result += child.build(depth + 1);
            }
            result += indentString(depth);
            result += '\n';
        }
        return result;
    }
}

function indentString(count: number): string {
    let result = "";
    for (let i = count; i > 0; --i) {
        result += "\t";
    }
    return result;
}