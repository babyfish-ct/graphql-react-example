import React, { useCallback } from 'react';
import Modal from 'antd/es/modal';
import { useForm } from 'antd/es/form/util';
import { FormDefination, TypedForm } from '../common/TypedForm';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import Divider from 'antd/es/divider';
import { useManualQuery } from 'graphql-hooks';
import { APIErrorView } from '../exception/APIErrorView';
import { LoginOutlined, LoadingOutlined } from '@ant-design/icons';
import { unwrapRoot, GraphQLRoot } from '../model/graphql/GraphQLRoot';

export const LoginDialog: React.FC<{
    visible: boolean,
    onClose?: (token: string | undefined) => void
}> = ({visible, onClose}) => {

    const [form] = useForm();

    const [login, { loading }] = useManualQuery<GraphQLRoot<any>>(
        `query($loginName: String!, $password: String!) {
            login(loginName: $loginName, password: $password) {
                token
            }
        }`
    );

    const onLoginClick = useCallback(async () => {
        await form.validateFields();
        const loginForm = form.getFieldsValue() as LoginForm;
        const { error, data } = await login({
            variables: loginForm
        });
        if (error !== undefined) {
            Modal.error({
                title: "Error",
                content: (
                    <div>
                        Login failed
                        <APIErrorView error={error}/>
                    </div>
                )
            });
        } else {
            Modal.success({
                title: "Success",
                content: "Login sucess"
            });
            if (onClose !== undefined) {
                onClose(unwrapRoot(data)["token"]);
            }
        }
    }, [form, login, onClose]);

    const onCancel = useCallback(() => {
        if (onClose !== undefined) {
            onClose(undefined);
        }
    }, [onClose]);

    return (
        <Modal 
        visible={visible}
        width={600}
        title="Login"
        onCancel={onCancel}
        footer={null}>
            <TypedForm<LoginForm>
            form={form}
            layout="horizontal"
            labelCol={{span: 8}}
            wrapperCol={{span:16}}
            defination={
                new FormDefination<LoginForm>()
                .item(
                    "loginName",
                    "Login Name",
                    <Input autoComplete='new-password'/>,
                    [{required: true, message: 'Login name must be specified'}]
                )
                .item(
                    "password",
                    "Password",
                    <Input type="password" autoComplete='new-password'/>,
                    [{required: true, message: 'Password must be specified'}]
                )
                .footer(
                    (invalid: boolean) => (
                        <div style={{textAlign: 'right'}}>
                            <Button disabled={invalid || loading} onClick={onLoginClick}>
                                {
                                    loading ?
                                    <LoadingOutlined/> :
                                    <LoginOutlined/>
                                }
                                Login
                            </Button>
                        </div>
                    )
                )
            }/>
            <Divider/>
            <div style={{color: 'gray', textAlign: 'right'}}>
                Login name: admin, password: 123
            </div>
        </Modal>
    );   
}

interface LoginForm {
    readonly loginName: string;
    readonly password: string;
}