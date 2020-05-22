import React, { useState, useCallback, ChangeEvent, useEffect } from 'react';
import Modal from 'antd/es/modal';
import Input from 'antd/es/input';
import { useMutation } from '@apollo/react-hooks';
import { gql, DocumentNode, ApolloError, from } from 'apollo-boost';
import { TypedFrom, FormDefination } from '../common/TypedForm';
import Button from 'antd/es/button';
import { LoadingOutlined } from '@ant-design/icons';
import { useForm } from 'antd/es/form/util';
import { GraphQLRoot, unwrapRoot } from '../model/graphql/GraphQLRoot';
import { Department } from '../model/Department';

export const Editor: React.FC<{
    visible: boolean,
    department?: Department,
    onClose: (saved: boolean) => void
}> = ({visible, department, onClose}) => {

    const [form] = useForm();

    useEffect(() => {
        if (department !== undefined) {
            form.setFieldsValue({ name: department.name });
        }
    }, [department, form]);

    const onCompleted = useCallback((root: GraphQLRoot<number>) => {
        Modal.success({
            title: "Success",
            content: `${department === undefined ? 'Create' : 'Modify'}` +
                `department successfully, the id of new department is ${unwrapRoot(root)}`
        });
        form.resetFields();
    }, []);

    const onError = useCallback((error: ApolloError) => {
        Modal.error({
            title: "Error",
            content: `Failed to ${department === undefined ? 'create' : 'modify'} department`
        });
    }, []);

    const [create, {loading}] = useMutation(
        CREATE_DOCUMENT_NODE,
        {
            onCompleted,
            onError
        }
    );

    const onSave = useCallback(async () => {
        if (await create({
            variables: {
                id: department?.id, 
                name: form.getFieldsValue()['name'] 
            }
        }) !== undefined) {
            onClose(true);
        }
    }, [create, onClose]);

    const onCancel = useCallback(() => {
        onClose(false);
    }, [onClose]);

    return (
        <Modal
        visible={visible}
        title="Create department"
        width={600}
        footer={null}
        onCancel={onCancel}>
            <TypedFrom<{name: string}>
            defination={
                new FormDefination<{name: string}>()
                .item(
                    'name',
                    'Name',
                    <Input autoComplete="off"/>,
                    [ {required: true, message: "Please input the name"} ]
                )
                .footer(
                    (invalid: boolean) => (
                        <div style={{textAlign: 'right'}}>
                            <Button 
                            disabled={loading || invalid}
                            type="primary"
                            onClick={onSave}>
                                { 
                                    loading ? 
                                    <LoadingOutlined/> : 
                                    undefined 
                                }
                                Save
                            </Button>
                        </div>
                    )
                )
            }
            form={form} 
            layout="horizontal" 
            labelCol={{span:8}} 
            wrapperCol={{span:16}}/>
        </Modal>
    );
};

const CREATE_DOCUMENT_NODE: DocumentNode = 
    gql`mutation($name: String!) {
        createDepartment(name: $name)
    }`;