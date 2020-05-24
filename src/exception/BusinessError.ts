export type BusinessError = 
IllegalDepartmentError |
IllegalSupervisorError |
CannotDeleteDepartmentWithEmployeesError |
CannotDeleteEmployeeWithSubordinatesError |
SupervisorCycleError;

export interface IllegalDepartmentError {
    readonly code: 'ILLEGAL_DEPARTMENT_ID';
    readonly departmentId: number;
}

export interface IllegalSupervisorError {
    readonly code: 'ILLEGAL_SUPERVISOR_ID';
    readonly supervisorId: number;
}

export interface CannotDeleteDepartmentWithEmployeesError {
    code: 'CANNOT_DELETE_DEPARTMENT_WITH_EMPLOYEES';
    departmentId: number;
    employees: NamedEntity[]
}

export interface CannotDeleteEmployeeWithSubordinatesError {
    code: 'CANNOT_DELETE_EMPLOYEE_WITH_SUBORDINATES';
    employeeId: number;
    subordinates: NamedEntity[]
}

export interface SupervisorCycleError {
    code: 'SUPERVISOR_CYCLE',
    employeeId: number;
    supervisors: NamedEntity[]
}

export interface NamedEntity<TID = number> {
    readonly id: TID;
    readonly name: number;
}