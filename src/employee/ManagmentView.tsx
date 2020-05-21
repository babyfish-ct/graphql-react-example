import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SpecificationView } from './SpecificationView';
import Layout from 'antd/es/layout';
import { EmployeeSpecification, DEFAULT_EMPLOYEE_SPECIFICATION } from '../model/EmployeeSpecification';
import { usePageQuery, DEFAULT_LIST_PAGE_SIZE } from '../common/Page';
import { createDynamicGraphQLBody } from '../model/dynamic/GraphQLDynamicBody';
import { Employee } from '../model/Employee';
import { Case } from '../common/Case';
import Spin from 'antd/es/spin';
import List from 'antd/es/list';
import { EmployeeView } from './EmployeeView';
import { PaginationConfig } from 'antd/es/pagination';

export const ManagementView: React.FC = () => {

    const [specification, setSpecification] = useState<EmployeeSpecification>(
        DEFAULT_EMPLOYEE_SPECIFICATION
    );

    const [pageNo, setPageNo] = useState<number>(1);

    const { loading, error, page } = usePageQuery<Employee>({
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
            fetchPolicy: 'no-cache',
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

    const renderEmployee = useCallback((department: Employee, index: number): React.ReactNode => {
        return (
            <List.Item key={index}>
                <EmployeeView value={department}/>
            </List.Item>
        );
    }, []);

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

    return (
        <Layout>
            <Layout.Sider theme="light" width={550}>
                <div style={{padding: '1rem'}}>
                    <SpecificationView value={specification} onChange={setSpecification}/>
                </div>
            </Layout.Sider>
            <Layout.Content>
                <div style={{padding: '1rem'}}>
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
                            <div>加载数据失败</div>
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
