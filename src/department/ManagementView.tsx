import React, { useState, useCallback, ReactNode, useMemo } from 'react';
import { CriteriaView } from './CriteriaView';
import { DepartmentSpecification, DEFAULT_DEPARTMENT_SPECIFICATION } from '../model/DepartmentSpecification';
import { usePageQuery } from '../common/Page';
import { createDynamicGraphQLBody } from '../model/dynamic/GraphQLDynamicBody';
import { Case } from '../common/Case';
import List from 'antd/es/list';
import { Department } from '../model/Department';
import { DepartmentView } from './DepartmentView';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import { PaginationConfig } from 'antd/es/pagination';
import Spin from 'antd/es/spin';

export const ManagementView: React.FC = () => {

    const [specification, setSpecification] = useState<DepartmentSpecification>(DEFAULT_DEPARTMENT_SPECIFICATION);
    const [pageNo, setPageNo] = useState<number>(1);

    const { called, loading, error, page } = usePageQuery({
        skip: specification.graphQLPaths.length === 0,
        countGraphQL: `query($name: String) { 
            departmentCount(name: $name)
        }`,
        listGraphQL: `query(
            $name: String, 
            $sortedType: DepartmentSortedType,
            $descending: Boolean,
            $limit: Int,
            $offset: Int) {
            departments(
                name: $name, 
                sortedType: $sortedType, 
                descending: $descending, 
                limit: $limit, 
                offset: $offset) {
                ${createDynamicGraphQLBody(specification.graphQLPaths)}
            }
        }`,
        pageNo,
        pageSize: 10,
        options: {
            fetchPolicy: 'no-cache',
            variables: {
                name: specification.name,
                sortedType: specification.sortedType,
                descending: specification.descending
            }
        }
    });

    const renderDepartment = useCallback((department: Department, index: number): ReactNode => {
        return (
            <List.Item key={index}>
                <DepartmentView value={department}/>
            </List.Item>
        );
    }, []);

    const pagination = useMemo<PaginationConfig>(() => {
        return {
            current: page?.pageNo ?? 1,
            pageSize: 10,
            total: page?.pageCount ?? 0,
            onChange: (page: number) => { setPageNo(page); }
        }
    }, [page]);

    return (
        <Row>
            <Col span={12}>
                <div style={{padding: '1rem'}}>
                    <CriteriaView value={specification} onChange={setSpecification}/>
                </div>
            </Col>
            <Col span={12}>
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
                            <List<Department>
                            dataSource={page?.entities}
                            renderItem={renderDepartment}
                            pagination={pagination}/>
                        )
                    }
                </div>
            </Col>
        </Row>
    );
};


