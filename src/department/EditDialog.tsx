import React, { useCallback, useEffect } from 'react';
import Modal from 'antd/es/modal';
import Input from 'antd/es/input';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { gql, DocumentNode, ApolloError } from 'apollo-boost';
import { TypedFrom, FormDefination } from '../common/TypedForm';
import Button from 'antd/es/button';
import { LoadingOutlined } from '@ant-design/icons';
import { useForm } from 'antd/es/form/util';
import { GraphQLRoot, unwrapRoot } from '../model/graphql/GraphQLRoot';
import { Department } from '../model/Department';
import { Case } from '../common/Case';
import Spin from 'antd/es/spin';

export const EditDialog: React.FC<{
    visible: boolean,
    id?: number,
    onClose: (saved: boolean) => void
}> = ({visible, id, onClose}) => {

    const [form] = useForm();

    const { loading, error, data: departmentRoot } = useQuery<GraphQLRoot<Department>>(
        GET_BY_ID_DOCUMENT_NODE,
        {
            skip: id === undefined,
            variables: { id }
        }
    );
    useEffect(() => {
        if (!loading && error === undefined && departmentRoot !== undefined) {
            form.setFieldsValue({
                name: unwrapRoot(departmentRoot)?.name ?? ""
            });
        }
    }, [loading, error, departmentRoot, form]);

    const onCreated = useCallback((root: GraphQLRoot<number>) => {
        Modal.success({
            title: "Success",
            content: `Create department successfully, the id of new department is ${unwrapRoot(root)}`
        });
        form.resetFields();
    }, []);
    const onModified = useCallback((root: GraphQLRoot<boolean>) => {
        Modal.success({
            title: "Success",
            content: `Modify department successfully`
        });
    }, []);
    const onError = useCallback((error: ApolloError) => {
        Modal.error({
            title: "Error",
            content: `Failed to ${id === undefined ? 'create' : 'modify'} department`
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
        title={`${id === undefined ? 'Create' : 'Modify'} department`}
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
                                disabled={creating || modifying || invalid}
                                type="primary"
                                onClick={onSubmit}>
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
                }
                form={form} 
                layout="horizontal" 
                labelCol={{span:8}} 
                wrapperCol={{span:16}}/>
            )
        }
        </Modal>
    );
};

const CREATE_DOCUMENT_NODE: DocumentNode = 
    gql`mutation($name: String!) {
        createDepartment(name: $name)
    }`;

const MODIFY_DOCUMENT_NODE: DocumentNode =
    gql`mutation($id: Long!, $name: String!) {
        modifyDepartment(id: $id, name: $name)
    }`;

const GET_BY_ID_DOCUMENT_NODE: DocumentNode = 
    gql`query($id: Long!) {
        department(id: $id) {
            name
        }
    }`;