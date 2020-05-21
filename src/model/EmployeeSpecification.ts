import { Gender } from "./Gender";
import { EmployeeSortedType } from "./EmployeeSortedType";

export interface EmployeeSpecification {
    readonly criteria?: EmployeeCriteriaInput;
    readonly sortedType: EmployeeSortedType;
    readonly descending: boolean;
    readonly graphQLPaths: string[];
}

export interface EmployeeCriteriaInput {
    readonly name?: string;
    readonly gender?: Gender;
    readonly minSalary?: number;
    readonly maxSalary?: number;
}

export const DEFAULT_EMPLOYEE_SPECIFICATION: EmployeeSpecification = {
    sortedType: "ID",
    descending: false,
    graphQLPaths: []
};