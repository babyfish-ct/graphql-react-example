import React, { useCallback, useEffect } from 'react';
import Modal from 'antd/es/modal';
import Input from 'antd/es/input';
import { TypedFrom, FormDefination } from '../common/TypedForm';
import Button from 'antd/es/button';
import { SaveOutlined, LoadingOutlined } from '@ant-design/icons';
import { useForm } from 'antd/es/form/util';
import { GraphQLRoot, unwrapRoot } from '../model/graphql/GraphQLRoot';
import { Department } from '../model/Department';
import { Case } from '../common/Case';
import { APIErrorView } from '../exception/APIErrorView';
import Spin from 'antd/es/spin';
import { useSkipQuery } from '../common/SkipQueryHooks';
import { useMutation } from 'graphql-hooks';

export const EditDialog: React.FC<{
    visible: boolean,
    id?: number,
    onClose: (saved: boolean) => void
}> = ({visible, id, onClose}) => {

    const [form] = useForm();

    const { loading, error, data: departmentRoot } = useSkipQuery<GraphQLRoot<Department>>(
        `query($id: Long!) {
            department(id: $id) {
                name
            }
        }`,
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

    const [create, {loading: creating}] = useMutation(
        `mutation($name: String!) {
            createDepartment(name: $name)
        }`
    );

    const [modify, {loading: modifying}] = useMutation(
        `mutation($id: Long!, $name: String!) {
            modifyDepartment(id: $id, name: $name)
        }`
    );

    const onSubmit = useCallback(async () => {
        await form.validateFields();
        const { error, data } = await (id === undefined ? create : modify)({
            variables: {
                id, 
                name: form.getFieldsValue()['name'] 
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
                    content: 'Create department successfully, ' +
                    `the id of new department is ${unwrapRoot(data)}`
                });
                form.resetFields();
            } else {
                Modal.success({
                    title: "Success",
                    content: `Modify department successfully`
                });
            }
            if (onClose !== undefined) {
                onClose(true);
            }
        }
    }, [id, form, create, modify,onClose]);

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
                                        <SaveOutlined/> 
                                    }
                                    { id === undefined ? 'Create' : 'Modify'}
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
