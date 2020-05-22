import React, { useCallback } from 'react';
import { Department } from '../model/Department';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import { Value, hasValue } from '../common/Value';
import { Employee } from '../model/Employee';
import List from 'antd/es/list';
import Card from 'antd/es/card';
import { EmployeeView } from '../employee/EmployeeView';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Button from 'antd/es/button';
import Popconfirm from 'antd/es/popconfirm';
import { DocumentNode, valueFromAST } from 'graphql';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import Modal from 'antd/es/modal';

export const DepartmentView: React.FC<{
    department: Department,
    depth?: number,
    onEditing?: (id: number) => void
    onDeleted?: (id: number) => void
}> = ({department: value, depth = 1, onEditing, onDeleted}) => {

    const renderEmployee = useCallback((employee: Employee, index: number): React.ReactNode => {
        return (
            <List.Item key={index}>
                <EmployeeView employee={employee} depth={depth + 1}/>
            </List.Item>
        );
    }, [depth]);

    const [delete_, { loading }] = useMutation(
        DELETE_DOCUMENT_NODE,
        {
            variables: { id: value.id },
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

    const onEdit = useCallback(() => {
        if (onEditing !== undefined) {
            onEditing(value.id ?? -1);
        }
    }, [value, onEditing]);

    const onConfirmDelete = useCallback(async () => {
        if (await delete_() !== undefined) {
            if (onDeleted !== undefined) {
                onDeleted(value.id ?? -1);
            }
        }
    }, [value, delete_, onDeleted]);

    return (
        <div style={{flex: 1}}>
            <Card title={
                <div style={{display: 'flex'}}>
                    <div style={{flex: 1}}>
                        Department(Level-{depth})
                    </div>
                    {
                        depth === 1 && value.id === undefined ?
                        <div style={{fontSize: 12, fontWeight: 'normal'}}>
                            Cannot edit/delete because there's no id
                        </div> :
                        undefined
                    }
                    {
                        depth === 1 && value.id !== undefined?
                        <Button.Group>
                            <Button onClick={onEdit}>
                                <EditOutlined />Edit
                            </Button>
                            <Popconfirm
                            title="Are you sure delete this department?"
                            onConfirm={onConfirmDelete}
                            okText="Yes"
                            cancelText="No">
                                <Button>
                                    <DeleteOutlined/>Delete
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
                        <Col span={VALUE_SPAN}><Value value={value.id}/></Col>
                    </Row>
                    <Row>
                        <Col span={LABEL_SPAN}>Name</Col>
                        <Col span={VALUE_SPAN}><Value value={value.name}/></Col>
                    </Row>
                    <Row>
                        <Col span={LABEL_SPAN}>Average salary</Col>
                        <Col span={VALUE_SPAN}><Value value={value.avgSalary}/></Col>
                    </Row>
                    <Row>
                        <Col span={hasValue(value.employees) ? 24 : LABEL_SPAN}>Employees</Col>
                        <Col span={hasValue(value.employees) ? 24 : VALUE_SPAN}>
                            <Value value={value.employees}>
                                <div style={{paddingLeft: '2rem'}}>
                                    <List<Employee>
                                    dataSource={value.employees}
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
        deleteDepartment(id: $id)
    }`;