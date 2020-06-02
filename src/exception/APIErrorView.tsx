import React, { useMemo } from 'react';
import { APIError } from 'graphql-hooks';
import { BusinessError, CannotDeleteDepartmentWithEmployeesError, NamedEntity, CannotDeleteEmployeeWithSubordinatesError, SupervisorCycleError } from './BusinessError';
import { Case } from '../common/Case';
import Table from 'antd/es/table';

export const APIErrorView: React.FC<{
    error: APIError<object>
}> = ({error}) => {

    const businessError = useMemo<BusinessError | undefined>(() => {    
        if (error.httpError !== undefined || error.fetchError !== undefined) {
            return undefined;
        }
        for (const graphQLError of error.graphQLErrors ?? []) {

            // Why does not GraphQLError declare the field 'errorType'?
            const errorType = (graphQLError as any)["errorType"] as string | undefined;
            const extensions = (graphQLError as any)["extensions"] as any | undefined;
            const extensionCode = extensions !== undefined ? extensions["code"] : undefined;
            // For kotlin server "https://github.com/babyfish-ct/graphql-kotlin-example"
            if (errorType !== undefined && errorType.startsWith(BUSINESS_PREFIX)) {
                return {
                    code: errorType.substring(BUSINESS_PREFIX.length),
                    ...extensions
                } as BusinessError;
            }
            // For C# server "https://github.com/babyfish-ct/graphql-csharp-example"
            if (extensionCode !== undefined && extensionCode?.startsWith(BUSINESS_PREFIX)) {
                return {
                    ...extensions,
                    code: extensionCode.substring(BUSINESS_PREFIX.length)
                } as BusinessError;
            }
        }
        return undefined;
    }, [error]);
    
    return (
        <div>
            {
                new Case()
                .when(
                    error.httpError !== undefined || error.fetchError !== undefined,
                    <div>Network error</div>
                )
                .when(
                    businessError !== undefined,
                    new Case()
                    .when(
                        businessError?.code === 'ILLEGAL_LOGIN_NAME',
                        <div>The login name is illegal</div>
                    )
                    .when(
                        businessError?.code === 'ILLEGAL_PASSWORD',
                        <div>The password is illegal</div>
                    )
                    .when(
                        businessError?.code === 'UNAUTHORIZED',
                        <div>Unauthorized, please login</div>
                    )
                    .when(
                        businessError?.code === 'ILLEGAL_DEPARTMENT_ID',
                        <div>The specified department dependency is illegal</div>
                    )
                    .when(
                        businessError?.code === 'ILLEGAL_SUPERVISOR_ID',
                        <div>The specified department dependency is illegal</div>
                    )
                    .when(
                        businessError?.code === 'CANNOT_DELETE_DEPARTMENT_WITH_EMPLOYEES',
                        <CannotDeleteDepartmentWithEmployeeErrorView 
                        error={businessError as CannotDeleteDepartmentWithEmployeesError}/>
                    )
                    .when(
                        businessError?.code === 'CANNOT_DELETE_EMPLOYEE_WITH_SUBORDINATES',
                        <CannotDeleteEmployeeWithSubordinatesErrorView 
                        error={businessError as CannotDeleteEmployeeWithSubordinatesError}/>
                    )
                    .when(
                        businessError?.code === 'SUPERVISOR_CYCLE',
                        <SupvisorCycleErrorView 
                        error={businessError as SupervisorCycleError}/>
                    )
                    .otherwise(
                        <div>Unknown business exception {businessError?.code}</div>
                    )
                )
                .otherwise(
                    <div>
                        {error.fetchError?.message ?? 'Unknown error'}
                    </div>
                )
            }
        </div>
    );
};

export const BUSINESS_PREFIX = "BUSINESS:";

const CannotDeleteDepartmentWithEmployeeErrorView: React.FC<{
    error: CannotDeleteDepartmentWithEmployeesError
}> = ({error}) => {
    return (
        <div>
            Cannot delete the department whose id is {error.departmentId} because it has these employees
            <Table<NamedEntity>
            rowKey="id"
            dataSource={error.employees}
            pagination={false}>
                <Table.Column dataIndex="id" title="Id"/>
                <Table.Column dataIndex="name" title="Name"/>
            </Table>
        </div>
    );
};

const CannotDeleteEmployeeWithSubordinatesErrorView: React.FC<{
    error: CannotDeleteEmployeeWithSubordinatesError
}> = ({error}) => {
    return (
        <div>
            Cannot delete the employee whose id is {error.employeeId} because it has these subordinates
            <Table<NamedEntity>
            rowKey="id"
            dataSource={error.subordinates}
            pagination={false}>
                <Table.Column dataIndex="id" title="Id"/>
                <Table.Column dataIndex="name" title="Name"/>
            </Table>
        </div>
    );
};

const SupvisorCycleErrorView: React.FC<{
    error: SupervisorCycleError
}> = ({error}) => {

    return (
        <div>
            Cannot modify the employee whose id is {error.employeeId} because 
            the expected new value has supervisor cycle
            <Table<NamedEntity>
            rowKey="id"
            dataSource={error.supervisors}
            pagination={false}>
                <Table.Column dataIndex="id" title="Id"/>
                <Table.Column dataIndex="name" title="Name"/>
            </Table>
        </div>
    );
}