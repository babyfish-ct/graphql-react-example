
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

export class GraphQLNodeBuilder {
    
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