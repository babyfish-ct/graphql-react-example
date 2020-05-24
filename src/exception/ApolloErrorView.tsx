import React, { useMemo } from 'react';
import { ApolloError } from 'apollo-boost';
import { BusinessError, CannotDeleteDepartmentWithEmployeesError, NamedEntity, CannotDeleteEmployeeWithSubordinatesError, SupervisorCycleError } from './BusinessError';
import { Case } from '../common/Case';
import Table from 'antd/es/table';

export const ApolloErrorView: React.FC<{
    error: ApolloError
}> = ({error}) => {

    const businessError = useMemo<BusinessError | undefined>(() => {    
        if (error.networkError !== null && error.networkError !== undefined) {
            return undefined;
        }
        for (const graphQLError of error.graphQLErrors) {

            // Why does not GraphQLError declare the field 'errorType'?
            const errorType = (graphQLError as any)["errorType"] as string | undefined;

            if (errorType !== undefined && errorType.startsWith(PREFIX)) {
                return {
                    code: errorType.substring(PREFIX.length),
                    ...graphQLError.extensions
                } as any as BusinessError;
            }
        }
        return undefined;
    }, [error]);
    
    return (
        <div>
            {
                new Case()
                .when(
                    error.networkError !== null && error.networkError !== undefined,
                    <div>Network error</div>
                )
                .when(
                    businessError !== undefined,
                    new Case()
                    .when(
                        businessError!.code === 'ILLEGAL_DEPARTMENT_ID',
                        <div>The specified department dependency is illegal</div>
                    )
                    .when(
                        businessError!.code === 'ILLEGAL_SUPERVISOR_ID',
                        <div>The specified department dependency is illegal</div>
                    )
                    .when(
                        businessError!.code === 'CANNOT_DELETE_DEPARTMENT_WITH_EMPLOYEES',
                        <CannotDeleteDepartmentWithEmployeeErrorView 
                        error={businessError as CannotDeleteDepartmentWithEmployeesError}/>
                    )
                    .when(
                        businessError!.code === 'CANNOT_DELETE_EMPLOYEE_WITH_SUBORDINATES',
                        <CannotDeleteEmployeeWithSubordinatesErrorView 
                        error={businessError as CannotDeleteEmployeeWithSubordinatesError}/>
                    )
                    .when(
                        businessError!.code === 'SUPERVISOR_CYCLE',
                        <SupvisorCycleErrorView 
                        error={businessError as SupervisorCycleError}/>
                    )
                    .otherwise(
                        <div>Unknown business exception {businessError!.code}</div>
                    )
                )
                .otherwise(
                    <div>{error.message}</div>
                )
            }
        </div>
    );
};

const PREFIX = "BUSINESS:";

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