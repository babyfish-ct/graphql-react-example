import React, { useCallback } from 'react';
import { Employee } from '../model/Employee';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import { Value, hasValue } from '../common/Value';
import List from 'antd/es/list';
import { DepartmentView } from '../department/DepartmentView';
import Card from 'antd/es/card';
import Button from 'antd/es/button';
import Popconfirm from 'antd/es/popconfirm';
import { EditOutlined, LoadingOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/react-hooks';
import Modal from 'antd/es/modal';
import { DocumentNode } from 'graphql';
import { gql } from 'apollo-boost';

export const EmployeeView: React.FC<{
    employee: Employee,
    depth?: number,
    onEditing?: (id: number) => void
    onDeleted?: (id: number) => void
}> = ({employee, depth = 1, onEditing, onDeleted}) => {

    const renderEmployee = useCallback((employee: Employee, index: number) => {
        return (
            <List.Item>
                <EmployeeView employee={employee} depth={depth + 1}/>
            </List.Item>
        );
    }, [depth]);

    const [delete_, { loading }] = useMutation(
        DELETE_DOCUMENT_NODE,
        {
            variables: { id: employee.id },
            onCompleted: () => {
                Modal.success({
                    title: "Employee has been deleted"
                });
            },
            onError: () => {
                Modal.error({
                    content: "Failed to delete the employee"
                });
            }
        }
    );

    const onEdit = useCallback(() => {
        if (onEditing !== undefined) {
            onEditing(employee.id ?? -1);
        }
    }, [employee, onEditing]);

    const onConfirmDelete = useCallback(async () => {
        if (await delete_() !== undefined) {
            if (onDeleted !== undefined) {
                onDeleted(employee.id ?? -1);
            }
        }
    }, [employee, delete_, onDeleted]);

    return (
        <div style={{flex:1}}>
            <Card title={
                <div style={{display: 'flex'}}>
                    <div style={{flex: 1}}>
                        Employee(Level-{depth})
                    </div>
                    {
                        depth === 1 && employee.id === undefined ?
                        <div style={{fontSize: 12, fontWeight: 'normal'}}>
                            Cannot edit/delete because there's no id
                        </div> :
                        undefined
                    }
                    {
                        depth === 1 && employee.id !== undefined?
                        <Button.Group>
                            <Button onClick={onEdit}>
                                <EditOutlined />Edit
                            </Button>
                            <Popconfirm
                            title="Are you sure delete this employee?"
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
                        <Col span={VALUE_SPAN}><Value value={employee.id}/></Col>
                    </Row>
                    <Row>
                        <Col span={LABEL_SPAN}>Name</Col>
                        <Col span={VALUE_SPAN}><Value value={employee.name}/></Col>
                    </Row>
                    <Row>
                        <Col span={LABEL_SPAN}>Gender</Col>
                        <Col span={VALUE_SPAN}><Value value={employee.gender}/></Col>
                    </Row>
                    <Row>
                        <Col span={LABEL_SPAN}>Salary</Col>
                        <Col span={VALUE_SPAN}><Value value={employee.salary}/></Col>
                    </Row>
                    <Row>
                        <Col span={hasValue(employee.department) ? 24 : LABEL_SPAN}>Department</Col>
                        <Col span={hasValue(employee.department) ? 24 : VALUE_SPAN}>
                            <Value value={employee.department}>
                                <div style={{paddingLeft: '2rem'}}>
                                    <DepartmentView department={employee.department!} depth={depth + 1}/>
                                </div>
                            </Value>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={hasValue(employee.supervisor) ? 24 : LABEL_SPAN}>Supervisor</Col>
                        <Col span={hasValue(employee.supervisor) ? 24 : VALUE_SPAN}>
                            <Value value={employee.supervisor}>
                                <div style={{paddingLeft: '2rem'}}>
                                    <EmployeeView employee={employee.supervisor!} depth={depth + 1}/>
                                </div>
                            </Value>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={hasValue(employee.subordinates) ? 24 : LABEL_SPAN}>Subordinates</Col>
                        <Col span={hasValue(employee.subordinates) ? 24 : VALUE_SPAN}>
                            <Value value={employee.subordinates}>
                                <div style={{paddingLeft: '2rem'}}>
                                    <List<Employee>
                                    dataSource={employee.subordinates}
                                    renderItem={renderEmployee}/>
                                </div>
                            </Value>
                        </Col>
                    </Row>
                </div>
            </Card>
        </div>
    );
};

const LABEL_SPAN = 8;
const VALUE_SPAN = 24 - LABEL_SPAN;

const DELETE_DOCUMENT_NODE: DocumentNode = 
    gql`mutation($id: Long!) {
        deleteEmployee(id: $id)
    }`;