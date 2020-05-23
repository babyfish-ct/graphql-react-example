import React, { useState, useMemo, useCallback, HTMLAttributes } from 'react';
import Modal from 'antd/es/modal';
import Table, { TablePaginationConfig } from 'antd/es/table';
import { usePageQuery, DEFAULT_LIST_PAGE_SIZE } from '../common/Page';
import { Employee } from '../model/Employee';
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

    const { loading, error, page } = usePageQuery<Employee>({
        countGraphQL: `query($name: String) {
            employeeCount(criteria: { name: $name })
        }`,
        listGraphQL: `query($name: String, $limit: Int, $offset: Int) {
            employees(criteria: { name: $name }, sortedType: NAME, descending: false, limit: $limit, offset: $offset) {
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
    const rowSelection = useMemo<TableRowSelection<Employee>>(() => {
        return { 
            type: 'radio',
            selectedRowKeys: selectedKey === undefined ? [] : [selectedKey],
            onChange: (selectedRowKeys: Key[], selectedRows: Employee[]) => {
                setSelectedKey(selectedRowKeys[0] as number);
            }
        };
    }, [selectedKey]);
    const onRow = useCallback(
        (employee: Employee, index: number | undefined): 
        HTMLAttributes<HTMLElement> => {
        return {
            onClick: () => { setSelectedKey(employee.id); }
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
        title='Select employee'
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
                    <Table<Employee>
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
