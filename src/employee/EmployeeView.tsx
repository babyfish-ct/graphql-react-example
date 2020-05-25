import React, { useCallback, useState } from 'react';
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
import Modal from 'antd/es/modal';
import { EditDialog } from '../employee/EditDialog';
import { APIErrorView } from '../exception/APIErrorView';
import { useMutation } from 'graphql-hooks';

export const EmployeeView: React.FC<{
    employee: Employee,
    depth?: number,
    onEdit?: (id: number) => void,
    onDelete?: (id: number) => void
}> = ({employee, depth = 1, onEdit, onDelete}) => {

    const [dialog, setDialog] = useState<boolean>(false);

    const renderEmployee = useCallback((employee: Employee, index: number) => {
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
        `mutation($id: Long!) {
            deleteEmployee(id: $id)
        }`,
        {
            variables: { id: employee.id }
        }
    );

    const onEditClick = useCallback(() => {
        setDialog(true);
    }, []);
    const onDialogClose = useCallback((saved: boolean) => {
        setDialog(false);
        if (saved && onEdit !== undefined) {
            onEdit(employee.id!);
        }
    }, [onEdit, employee]);

    const onConfirmDelete = useCallback(async () => {
        const {error} = await delete_();
        if (error !== undefined) {
            Modal.error({
                title: "Error",
                content: <APIErrorView error={error}/>
            });
        } else {
            Modal.success({
                title: "Success",
                content: "Employee has been deleted"
            });
            if (onDelete !== undefined) {
                onDelete(employee.id!);
            }
        }
    }, [employee, delete_, onDelete]);

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
                            <Button onClick={onEditClick}>
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
                id={employee.id}
                onClose={onDialogClose}/> : 
                undefined
            }
        </div>
    );
};

const LABEL_SPAN = 8;
const VALUE_SPAN = 24 - LABEL_SPAN;
