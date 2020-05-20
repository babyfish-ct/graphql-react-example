import { DepartmentSortedType } from './DepartmentSortedType';

export interface DepartmentSpecification {
    readonly name?: string,
    readonly sortedType: DepartmentSortedType,
    readonly descending: boolean,
    readonly graphQLPaths: string[]
}

export const DEFAULT_DEPARTMENT_SPECIFICATION: DepartmentSpecification = {
    sortedType: "ID",
    descending: false,
    graphQLPaths: []
};