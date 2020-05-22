import React, { useEffect, useCallback } from 'react';
import { DocumentNode } from 'graphql';
import { gql, ApolloError } from 'apollo-boost';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { GraphQLRoot, unwrapRoot } from '../model/graphql/GraphQLRoot';
import { useForm } from 'antd/es/form/util';
import { Employee } from '../model/Employee';
import Modal from 'antd/es/modal';
import { Case } from '../common/Case';
import Spin from 'antd/es/spin';
import { TypedFrom, FormDefination } from '../common/TypedForm';
import { EmployeeInput } from '../model/EmployeeInput';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import InputNumber from 'antd/es/input-number';
import Button from 'antd/es/button';
import { LoadingOutlined } from '@ant-design/icons';

export const EditDialog: React.FC<{
    visible: boolean,
    id?: number,
    onClose: (saved: boolean) => void
}> = ({visible, id, onClose}) => {

    const [form] = useForm();

    const { loading, error, data: employeeRoot } = useQuery<GraphQLRoot<Employee>>(
        GET_BY_ID_DOCUMENT_NODE,
        {
            skip: id === undefined,
            variables: { id }
        }
    );
    useEffect(() => {
        if (!loading && error === undefined && employeeRoot !== undefined) {
            form.setFieldsValue({
                name: unwrapRoot(employeeRoot)?.name ?? ""
            });
        }
    }, [loading, error, employeeRoot, form]);

    const onCreated = useCallback((root: GraphQLRoot<number>) => {
        Modal.success({
            title: "Success",
            content: `Create employee successfully, the id of new employee is ${unwrapRoot(root)}`
        });
        form.resetFields();
    }, []);
    const onModified = useCallback((root: GraphQLRoot<boolean>) => {
        Modal.success({
            title: "Success",
            content: `Modify employee successfully`
        });
    }, []);
    const onError = useCallback((error: ApolloError) => {
        Modal.error({
            title: "Error",
            content: `Failed to ${id === undefined ? 'create' : 'modify'} employee`
        });
    }, []);

    const [create, {loading: creating}] = useMutation(
        CREATE_DOCUMENT_NODE,
        {
            onCompleted: onCreated,
            onError
        }
    );

    const [modify, {loading: modifying}] = useMutation(
        MODIFY_DOCUMENT_NODE,
        {
            onCompleted: onModified,
            onError
        }
    );

    const onSubmit = useCallback(async () => {
        if (await (id === undefined ? create : modify)({
            variables: {
                id, 
                name: form.getFieldsValue()['name'] 
            }
        }) !== undefined) {
            onClose(true);
        }
    }, [id, create, modify,onClose]);

    const onCancel = useCallback(() => {
        onClose(false);
    }, [onClose]);

    return (
        <Modal
        visible={visible}
        title={`${id === undefined ? 'Create' : 'Modify'} employee`}
        width={600}
        footer={null}>
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
                    <TypedFrom<EmployeeInput>
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
                            </Select>
                        )
                        .item(
                            'salary',
                            'Salary',
                            <InputNumber min={100} max={100000}/>,
                            [{required: true, message: 'Salary is required'}]
                        )
                        .footer(
                            (invalid: boolean) => (
                                <div style={{textAlign: 'right'}}>
                                    <Button disabled={creating || modifying || invalid}>
                                        {
                                            creating || modifying ? 
                                            <LoadingOutlined/> : 
                                            undefined
                                        }
                                        Save
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

const CREATE_DOCUMENT_NODE: DocumentNode = 
    gql`mutation($input: EmployeeeInput!) {
        createEmployee(input: $input)
    }`;

const MODIFY_DOCUMENT_NODE: DocumentNode =
    gql`mutation($id: Long!, $input: EmployeeeInput!) {
        modifyEmployee(id: $id, input: $input)
    }`;

const GET_BY_ID_DOCUMENT_NODE: DocumentNode = 
    gql`query($id: Long!) {
        employee(id: $id) {
            name
        }
    }`;