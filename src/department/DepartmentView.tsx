import React, { useCallback, useState } from 'react';
import { Department } from '../model/Department';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import { Value, hasValue } from '../common/Value';
import { Employee } from '../model/Employee';
import List from 'antd/es/list';
import Card from 'antd/es/card';
import { EmployeeView } from '../employee/EmployeeView';
import { EditOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import Button from 'antd/es/button';
import Popconfirm from 'antd/es/popconfirm';
import { DocumentNode } from 'graphql';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import Modal from 'antd/es/modal';
import { EditDialog } from './EditDialog';

export const DepartmentView: React.FC<{
    department: Department,
    depth?: number,
    onEdit?: (id: number) => void
    onDelete?: (id: number) => void
}> = ({department, depth = 1, onEdit, onDelete}) => {

    const [dialog, setDialog] = useState<boolean>(false);

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
                <EmployeeView employee={employee} depth={depth + 1}/>
            </List.Item>
        );
    }, [depth]);

    const [delete_, { loading }] = useMutation(
        DELETE_DOCUMENT_NODE,
        {
            variables: { id: department.id },
            onCompleted: () => {
                Modal.success({
                    title: "Departent has been deleted"
                });
            },
            onError: () => {
                Modal.error({
                    content: "Failed to delete the department"
                });
            }
        }
    );

    const onEditClick = useCallback(() => {
        setDialog(true);
    }, []);
    const onDialogClose = useCallback((saved: boolean) => {
        setDialog(false);
        if (onEdit !== undefined) {
            onEdit(department.id!);
        }
    }, [onEdit, department]);

    const onConfirmDelete = useCallback(async () => {
        if (await delete_() !== undefined) {
            if (onDelete !== undefined) {
                onDelete(department.id ?? -1);
            }
        }
    }, [department, delete_, onDelete]);

    return (
        <div style={{flex: 1}}>
            <Card title={
                <div style={{display: 'flex'}}>
                    <div style={{flex: 1}}>
                        Department(Level-{depth})
                    </div>
                    {
                        depth === 1 && department.id === undefined ?
                        <div style={{fontSize: 12, fontWeight: 'normal'}}>
                            Cannot edit/delete because there's no id
                        </div> :
                        undefined
                    }
                    {
                        depth === 1 && department.id !== undefined?
                        <Button.Group>
                            <Button onClick={onEditClick}>
                                <EditOutlined />Edit
                            </Button>
                            <Popconfirm
                            title="Are you sure delete this department?"
                            onConfirm={onConfirmDelete}
                            okText="Yes"
                            cancelText="No">
                                <Button disabled={loading}>
                                    {
                                        loading ?
                                        <LoadingOutlined/> :
                                        <DeleteOutlined/>
                                    }
                                    Delete
                                </Button>
                            </Popconfirm>
                        </Button.Group> :
                        undefined
                    }
                </div>
            }>
                <div className={`object-view-${depth}`}>
                    <Row>
                        <Col span={LABEL_SPAN}>Id</Col>
                        <Col span={VALUE_SPAN}><Value value={department.id}/></Col>
                    </Row>
                    <Row>
                        <Col span={LABEL_SPAN}>Name</Col>
                        <Col span={VALUE_SPAN}><Value value={department.name}/></Col>
                    </Row>
                    <Row>
                        <Col span={LABEL_SPAN}>Average salary</Col>
                        <Col span={VALUE_SPAN}><Value value={department.avgSalary}/></Col>
                    </Row>
                    <Row>
                        <Col span={hasValue(department.employees) ? 24 : LABEL_SPAN}>Employees</Col>
                        <Col span={hasValue(department.employees) ? 24 : VALUE_SPAN}>
                            <Value value={department.employees}>
                                <div style={{paddingLeft: '2rem'}}>
                                    <List<Employee>
                                    dataSource={department.employees}
                                    renderItem={renderEmployee}/>
                                </div>
                            </Value>
                        </Col>
                    </Row>
                </div>
            </Card>
            {
                /*
                 * The attribute 'visible' of EditDialog always is true,
                 * but use the boolean flag to decide whether the dialog should be rendered or not.
                 * 
                 * This is because the parent componnement uses 
                 * the current EmployeeView component in the loop,
                 * don't always create the dialog for each EmployeeView,
                 * just created it when it's necessary
                 */
                dialog ?
                <EditDialog 
                visible={true}
                id={department.id}
                onClose={onDialogClose}/> : 
                undefined
            }
        </div>
    );
};

const LABEL_SPAN = 8;
const VALUE_SPAN = 24 - LABEL_SPAN;

const DELETE_DOCUMENT_NODE: DocumentNode = 
    gql`mutation($id: Long!) {
        deleteDepartment(id: $id)
    }`;