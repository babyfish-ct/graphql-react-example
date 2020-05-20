import {ReactNode} from 'react';

export interface GraphQLTreeNode {
    readonly key: string,
    readonly title: ReactNode,
    readonly children?: GraphQLTreeNode[]
}

export const DEPARTMENT_BASE_TREE_NODES: GraphQLTreeNode[] = [
    { key: "id", title: "Id" },
    { key: "name", title: "Name" }
];

export const EMPLOYEE_BASE_TREE_NODES: GraphQLTreeNode[] = [
    { key: "id", title: "Id" },
    { key: "name", title: "Name" },
    { key: "gender", title: "Gender" },
    { key: "salary", title: "Salary" }
];

export function childGraphQLTreeNodes(keyPrefix: String, nodes: GraphQLTreeNode[]): GraphQLTreeNode[] {
    return nodes.map(
        node => ({...node, key: `${keyPrefix}.${node.key}`})
    );
}