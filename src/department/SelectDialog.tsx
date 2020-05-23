import React, { useState, useMemo, useCallback, HTMLAttributes } from 'react';
import Modal from 'antd/es/modal';
import Table, { TablePaginationConfig } from 'antd/es/table';
import { usePageQuery, DEFAULT_LIST_PAGE_SIZE } from '../common/Page';
import { Department } from '../model/Department';
import { Case } from '../common/Case';
import Spin from 'antd/es/spin';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import { useInputChange } from '../common/Input';
import { TableRowSelection, Key } from 'antd/es/table/interface';

export const SelectDialog: React.FC<{
    visible: boolean,
    id?: number,
    onClose: (id: number | undefined) => void
}> = ({visible, id, onClose}) => {

    const [name, setName] = useState<string>();
    const [pageNo, setPageNo] = useState<number>(1);
    const onNameChange = useInputChange(setName);

    const [selectedKey, setSelectedKey] = useState<number>();

    const { loading, error, page } = usePageQuery<Department>({
        countGraphQL: `query($name: String) {
            departmentCount(name: $name)
        }`,
        listGraphQL: `query($name: String, $limit: Int, $offset: Int) {
            departments(name: $name, sortedType: NAME, descending: false, limit: $limit, offset: $offset) {
                id
                name
            }
        }`,
        pageNo,
        pageSize: DEFAULT_LIST_PAGE_SIZE,
        options: {
            variables: {name}
        }
    });
    const pagination = useMemo<TablePaginationConfig | undefined>(() => {
        if (loading || error || page === undefined) {
            return undefined;
        }
        return  {
            total: page.rowCount,
            pageSize: DEFAULT_LIST_PAGE_SIZE,
            current: page.pageNo,
            onChange: (v: number) => { setPageNo(v); }
        };
    }, [loading, error, page]);
    const rowSelection = useMemo<TableRowSelection<Department>>(() => {
        return { 
            type: 'radio',
            selectedRowKeys: selectedKey === undefined ? [] : [selectedKey],
            onChange: (selectedRowKeys: Key[], selectedRows: Department[]) => {
                setSelectedKey(selectedRowKeys[0] as number);
            }
        };
    }, [selectedKey]);
    const onRow = useCallback(
        (department: Department, index: number | undefined): 
        HTMLAttributes<HTMLElement> => {
        return {
            onClick: () => { setSelectedKey(department.id); }
        };
    }, []);

    const onOk = useCallback(() => {
        onClose(selectedKey);
    }, [selectedKey, onClose]);
    const onCancel = useCallback(() => {
        onClose(id);
    }, [id, onClose]);

    return (
        <Modal
        title='Select department'
        visible={visible}
        width={500}
        onOk={onOk}
        onCancel={onCancel}>
            <Form layout="horizontal" labelCol={{span: 8}} wrapperCol={{span: 16}}>
                <Form.Item label="Name">
                    <Input value={name} onChange={onNameChange}/>
                </Form.Item>
            </Form>
            {
                new Case()
                .when(
                    loading,
                    <Spin>Loading...</Spin>
                )
                .when(
                    error !== undefined,
                    <div>Load failed</div>
                )
                .otherwise(
                    <Table<Department>
                    dataSource={page?.entities}
                    pagination={pagination}
                    rowKey="id"
                    rowSelection={rowSelection}
                    onRow={onRow}
                    size="small">
                        <Table.Column
                        dataIndex="id"
                        title="Id"/>
                        <Table.Column
                        dataIndex="name"
                        title="Name"/>
                    </Table>
                )
            }
        </Modal>
    );
}
