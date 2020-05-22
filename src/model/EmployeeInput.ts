import { Gender } from "./Gender";

export interface EmployeeInput {
    readonly name: string;
    readonly gender: Gender;
    readonly salary: number;
    readonly departmentId: number;
    readonly supervisorId?: number;
}