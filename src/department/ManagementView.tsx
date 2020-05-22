import React, { useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { SpecificationView } from './SpecificationView';
import { DepartmentSpecification, DEFAULT_DEPARTMENT_SPECIFICATION } from '../model/DepartmentSpecification';
import { usePageQuery, DEFAULT_LIST_PAGE_SIZE } from '../common/Page';
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
            fetchPolicy: 'no-cache',
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
            <List.Item key={index}>
                <DepartmentView 
                value={department} 
                onEditing={setModifiedId}
                onDeleted={refetch}/>
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

    const openOpenModifyingDialog = useCallback((modifiedId: number) => {
        setModifiedId(modifiedId);
    }, []);

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
                    <SpecificationView value={specification} onChange={setSpecification}/>
                </div>
            </Layout.Sider>
            <Layout.Content>
                <div style={{padding: '1rem'}}>
                    <Button onClick={openOpenCreatingDialog}>
                        <PlusCircleOutlined />
                        Create department...
                    </Button>
                    <EditDialog 
                    visible={creatingDialogVisible} 
                    onClose={onCloseCreatingDialog}/>
                    <EditDialog 
                    id={modifiedId}
                    visible={modifiedId !== undefined} 
                    onClose={onCloseModifyingDialog}/>
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
            </Layout.Content>
        </Layout>
    );
};


