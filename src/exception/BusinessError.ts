export type BusinessError = 
IllegalLoginNameError |
IllegalPasswordError |
UnauthorizedError |
IllegalDepartmentError |
IllegalSupervisorError |
CannotDeleteDepartmentWithEmployeesError |
CannotDeleteEmployeeWithSubordinatesError |
SupervisorCycleError;

export interface IllegalLoginNameError {
    readonly code: 'ILLEGAL_LOGIN_NAME';
    readonly loginName: string;
}

export interface IllegalPasswordError {
    readonly code: 'ILLEGAL_PASSWORD';
}

export interface UnauthorizedError {
    readonly code: 'UNAUTHORIZED';
}

export interface IllegalDepartmentError {
    readonly code: 'ILLEGAL_DEPARTMENT_ID';
    readonly departmentId: number;
}

export interface IllegalSupervisorError {
    readonly code: 'ILLEGAL_SUPERVISOR_ID';
    readonly supervisorId: number;
}

export interface CannotDeleteDepartmentWithEmployeesError {
    readonly code: 'CANNOT_DELETE_DEPARTMENT_WITH_EMPLOYEES';
    readonly departmentId: number;
    readonly employees: NamedEntity[]
}

export interface CannotDeleteEmployeeWithSubordinatesError {
    readonly code: 'CANNOT_DELETE_EMPLOYEE_WITH_SUBORDINATES';
    readonly employeeId: number;
    readonly subordinates: NamedEntity[]
}

export interface SupervisorCycleError {
    readonly code: 'SUPERVISOR_CYCLE',
    readonly employeeId: number;
    readonly supervisors: NamedEntity[]
}

export interface NamedEntity<TID = number> {
    readonly id: TID;
    readonly name: number;
}