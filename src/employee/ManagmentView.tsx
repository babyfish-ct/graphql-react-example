import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SpecificationView } from './SpecificationView';
import Layout from 'antd/es/layout';
import { EmployeeSpecification, DEFAULT_EMPLOYEE_SPECIFICATION } from '../model/EmployeeSpecification';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/Page';
import { createDynamicGraphQLBody } from '../model/dynamic/GraphQLDynamicBody';
import { Employee } from '../model/Employee';
import { Case } from '../common/Case';
import Spin from 'antd/es/spin';
import List from 'antd/es/list';
import { EmployeeView } from './EmployeeView';
import { PaginationConfig } from 'antd/es/pagination';
import { PlusCircleOutlined } from '@ant-design/icons';
import Button from 'antd/es/button';
import { EditDialog } from '../employee/EditDialog';
import { usePageQuery } from '../common/PageQueryHooks';

export const ManagementView: React.FC = () => {

    const [specification, setSpecification] = useState<EmployeeSpecification>(
        DEFAULT_EMPLOYEE_SPECIFICATION
    );

    const [pageNo, setPageNo] = useState<number>(1);

    const [creatingDialogVisible, setCreatingDialogVisible] = useState<boolean>(false);

    const { loading, error, page, refetch } = usePageQuery<Employee>({
        skip: specification.graphQLPaths.length === 0,
        countGraphQL: `query($criteria: EmployeeCriteriaInput) { 
            employeeCount(criteria: $criteria)
        }`,
        listGraphQL: `query(
            $criteria: EmployeeCriteriaInput, 
            $sortedType: EmployeeSortedType,
            $descending: Boolean,
            $limit: Int,
            $offset: Int) {
            employees(
                criteria: $criteria, 
                sortedType: $sortedType, 
                descending: $descending, 
                limit: $limit, 
                offset: $offset) {
                ${createDynamicGraphQLBody(specification.graphQLPaths)}
            }
        }`,
        pageNo,
        pageSize: DEFAULT_LIST_PAGE_SIZE,
        options: {
            variables: {
                criteria: specification.criteria,
                sortedType: specification.sortedType,
                descending: specification.descending
            }
        }
    });
    useEffect(() => {
        setPageNo(1);
    }, [specification]);

    const pagination = useMemo<PaginationConfig | undefined>(() => {
        if (page === undefined) {
            return undefined
        }
        return {
            current: page.pageNo,
            pageSize: page.pageSize,
            total: page.rowCount,
            onChange: (page: number) => { setPageNo(page); }
        }
    }, [page]);

    const openOpenCreatingDialog = useCallback(() => {
        setCreatingDialogVisible(true);
    }, []);

    const onCloseCreatingDialog = useCallback((saved: boolean) => {
        if (saved) {
            refetch();
        }
        setCreatingDialogVisible(false);
    }, [refetch]);

    const renderEmployee = useCallback((employee: Employee, index: number): React.ReactNode => {
        return (
            /*
             * For real business projects, assign the object id to the 'key' is the best choice,
             * 
             * but this demo shows the dynamic query so that the object id may be undefined,
             * there is no better choice except set the 'key' as index
             * 
             * It's unnecessary to use the index in real business projects
             */
            <List.Item key={index}>
                <EmployeeView 
                employee={employee}
                onEdit={refetch}
                onDelete={refetch}/>
            </List.Item>
        );
    }, [refetch]);

    return (
        <Layout>
            <Layout.Sider theme="light" width={550}>
                <div style={{padding: '1rem'}}>
                    <SpecificationView specification={specification} onChange={setSpecification}/>
                </div>
            </Layout.Sider>
            <Layout.Content>
                <EditDialog 
                visible={creatingDialogVisible} 
                onClose={onCloseCreatingDialog}/>
                <div style={{margin: '1rem'}}>
                    <Button onClick={openOpenCreatingDialog}>
                        <PlusCircleOutlined />
                        Create employee...
                    </Button>
                </div>
                <div style={{margin: '1rem'}}>
                    {
                        new Case()
                        .when(
                            specification.graphQLPaths.length === 0,
                            <div>Please select some checkbox of GraphQL structure</div>
                        )
                        .when(
                            loading,
                            <div>
                                <Spin tip="Loading data from server side..."/>
                            </div>
                        )
                        .when(
                            error !== undefined,
                            <div>Load data failed!</div>
                        )
                        .otherwise(
                            <List<Employee>
                            dataSource={page?.entities}
                            renderItem={renderEmployee}
                            pagination={pagination}/>
                        )
                    }
                </div>
            </Layout.Content>
        </Layout>
    );
};
