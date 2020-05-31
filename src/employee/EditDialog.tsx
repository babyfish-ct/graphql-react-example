import React, { useEffect, useCallback } from 'react';
import { GraphQLRoot, unwrapRoot } from '../model/graphql/GraphQLRoot';
import { useForm } from 'antd/es/form/util';
import { Employee } from '../model/Employee';
import Modal from 'antd/es/modal';
import { Case } from '../common/Case';
import Spin from 'antd/es/spin';
import { TypedForm, FormDefination } from '../common/TypedForm';
import { EmployeeInput } from '../model/EmployeeInput';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import InputNumber from 'antd/es/input-number';
import Button from 'antd/es/button';
import { SaveOutlined, LoadingOutlined } from '@ant-design/icons';
import { Selector as DepartmentSelector } from '../department/Selector';
import { Selector as EmployeeSelector } from './Selector';
import { APIErrorView } from '../exception/APIErrorView';
import { useSkipQuery } from '../common/SkipQueryHooks';
import { useMutation } from 'graphql-hooks';

export const EditDialog: React.FC<{
    visible: boolean,
    id?: number,
    onClose: (saved: boolean) => void
}> = ({visible, id, onClose}) => {

    const [form] = useForm();

    const { loading, error, data: employeeRoot } = useSkipQuery<GraphQLRoot<Employee>>(
        `query($id: Long!) {
            employee(id: $id) {
                name
                gender
                salary
                department {
                    id
                }
                supervisor {
                    id
                }
            }
        }`,
        {
            skip: id === undefined,
            variables: { id }
        }
    );

    useEffect(() => {
        if (!loading && error === undefined && employeeRoot !== undefined) {
            const employee = unwrapRoot(employeeRoot);
            if (employee !== undefined) {
                form.setFieldsValue({
                    name: employee.name,
                    gender: employee.gender,
                    salary: employee.salary,
                    departmentId: employee.department!.id,
                    supervisorId: employee.supervisor?.id
                });
            }
        }
    }, [loading, error, employeeRoot, form]);

    const [create, {loading: creating}] = useMutation(
        `mutation($input: EmployeeInput!) {
            createEmployee(input: $input)
        }`,
    );

    const [modify, {loading: modifying}] = useMutation(
        `mutation($id: Long!, $input: EmployeeInput!) {
            modifyEmployee(id: $id, input: $input)
        }`,
    );

    const onSubmit = useCallback(async () => {
        await form.validateFields();
        const {error, data} = await (id === undefined ? create : modify)({
            variables: {
                id, 
                input: form.getFieldsValue() 
            }
        });
        if (error !== undefined) {
            Modal.error({
                title: "Error",
                content: <APIErrorView error={error}/>
            });
        } else {
            if (id === undefined) {
                Modal.success({
                    title: "Success",
                    content: 'Create employee successfully, ' + 
                    `the id of new employee is ${unwrapRoot(data)}`
                });
                form.resetFields();
            } else {
                Modal.success({
                    title: "Success",
                    content: `Modify employee successfully`
                });
            }
            onClose(true);
        }
    }, [id, form, create, modify,onClose]);

    const onCancel = useCallback(() => {
        onClose(false);
    }, [onClose]);

    return (
        <Modal
        visible={visible}
        title={`${id === undefined ? 'Create' : 'Modify'} employee`}
        width={600}
        footer={null}
        onCancel={onCancel}>
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
                    <TypedForm<EmployeeInput>
                    form={form}
                    layout="horizontal"
                    labelCol={{span: 8}}
                    wrapperCol={{span:16}}
                    defination={
                        new FormDefination<EmployeeInput>()
                        .item(
                            'name',
                            'Name',
                            <Input autoComplete='off'/>,
                            [{required: true, message: 'Name is required'}]
                        )
                        .item(
                            'gender',
                            'Gender',
                            <Select>
                                <Select.Option value="MALE">Male</Select.Option>
                                <Select.Option value="FEMALE">Female</Select.Option>
                            </Select>,
                            [{required: true, message: 'Gender is required'}]
                        )
                        .item(
                            'salary',
                            'Salary',
                            <InputNumber min={100} max={100000}/>,
                            [{required: true, message: 'Salary is required'}]
                        )
                        .item(
                            'departmentId',
                            'Department',
                            <DepartmentSelector required={true}/>,
                            [{required: true, message: 'Department is required'}]
                        )
                        .item(
                            'supervisorId',
                            'Supervisor',
                            <EmployeeSelector/>
                        )
                        .footer(
                            (invalid: boolean) => (
                                <div style={{textAlign: 'right'}}>
                                    <Button 
                                    type="primary"
                                    disabled={creating || modifying || invalid}
                                    onClick={onSubmit}>
                                        {
                                            creating || modifying ? 
                                            <LoadingOutlined/> : 
                                            <SaveOutlined/>
                                        }
                                        {
                                            id === undefined ? 'Create' : 'Modify' }
                                    </Button>
                                </div>
                            )
                        )
                    }/>
                )
            }
        </Modal>
    );
};
