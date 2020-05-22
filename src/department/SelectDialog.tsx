import React, { useState, useMemo } from 'react';
import Modal from 'antd/es/modal';
import Table, { TablePaginationConfig } from 'antd/es/table';
import { usePageQuery, DEFAULT_LIST_PAGE_SIZE } from '../common/Page';
import { Department } from '../model/Department';
import { Case } from '../common/Case';
import Spin from 'antd/es/spin';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import { useInputChange } from '../common/Input';

export const SelectDialog: React.FC<{
    visible: boolean,
    id?: number,
    onClose: (id: number | undefined) => void
}> = ({visible, id, onClose}) => {

    const [name, setName] = useState<string>();
    const [pageNo, setPageNo] = useState<number>(1);
    const onNameChange = useInputChange(setName);

    const { loading, error, page } = usePageQuery<Department>({
        countGraphQL: `query($name: String) {
            departmentCount
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

    return (
        <Modal
        visible={visible}
        width={100}>
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
                    rowKey="id">
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
