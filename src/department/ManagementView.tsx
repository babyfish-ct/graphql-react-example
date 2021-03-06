import React, { useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { SpecificationView } from './SpecificationView';
import { DepartmentSpecification, DEFAULT_DEPARTMENT_SPECIFICATION } from '../model/DepartmentSpecification';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/Page';
import { createDynamicGraphQLBody } from '../model/dynamic/GraphQLDynamicBody';
import { Case } from '../common/Case';
import List from 'antd/es/list';
import { Department } from '../model/Department';
import { DepartmentView } from './DepartmentView';
import { PaginationConfig } from 'antd/es/pagination';
import Spin from 'antd/es/spin';
import Layout from 'antd/es/layout';
import Button from 'antd/es/button';
import { PlusCircleOutlined } from '@ant-design/icons';
import { EditDialog } from './EditDialog';
import { usePageQuery } from '../common/PageQueryHooks';

export const ManagementView: React.FC = () => {

    const [specification, setSpecification] = useState<DepartmentSpecification>(DEFAULT_DEPARTMENT_SPECIFICATION);
    const [pageNo, setPageNo] = useState<number>(1);
    const [creatingDialogVisible, setCreatingDialogVisible] = useState<boolean>(false);
    const [modifiedId, setModifiedId] = useState<number>();

    const { loading, error, page, refetch } = usePageQuery<Department>({
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
        pageSize: DEFAULT_LIST_PAGE_SIZE,
        options: {
            variables: {
                name: specification.name,
                sortedType: specification.sortedType,
                descending: specification.descending
            }
        }
    });
    useEffect(() => {
        setPageNo(1);
    }, [specification]);

    const renderDepartment = useCallback((department: Department, index: number): ReactNode => {
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
                <DepartmentView 
                department={department} 
                onEdit={refetch}
                onDelete={refetch}/>
            </List.Item>
        );
    }, [refetch]);

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

    const onCloseModifyingDialog = useCallback((saved: boolean) => {
        if (saved) {
            refetch();
        }
        setModifiedId(undefined);
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
                <EditDialog 
                id={modifiedId}
                visible={modifiedId !== undefined} 
                onClose={onCloseModifyingDialog}/>
                <div style={{margin: '1rem'}}>
                    <Button onClick={openOpenCreatingDialog}>
                        <PlusCircleOutlined />
                        Create department...
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
                            <List<Department>
                            dataSource={page?.entities}
                            renderItem={renderDepartment}
                            pagination={pagination}/>
                        )
                    }
                </div>
            </Layout.Content>
        </Layout>
    );
};


