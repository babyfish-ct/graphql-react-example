import './AppView.css';
import React, { useCallback } from 'react';
import Layout from 'antd/es/layout';
import { MenuView } from './MenuView';
import { ContentView } from './ContentView';
import Button from 'antd/es/button';
import { LoginOutlined, LogoutOutlined } from '@ant-design/icons';

export const AppView: React.FC<{
    online: boolean,
    onAuthorizationChanging: (online: boolean) => void
}> = ({online, onAuthorizationChanging}) => {

    const onAuthorizationClick = useCallback(() => {
        onAuthorizationChanging(!online);
    }, [online, onAuthorizationChanging]);

    return (
        <Layout>
            <Layout.Header style={{backgroundColor: 'white'}}>
                <div className="header" style={{display: 'flex'}}>
                    <div style={{width: 496}}>GraphQL React Example</div>
                    <div style={{flex: 1}}>
                        <MenuView/>
                    </div>
                    <div>
                        <Button onClick={onAuthorizationClick}>
                            {
                                online ?
                                <LogoutOutlined/> :
                                <LoginOutlined/>
                            }
                            { online ? "Logout" : "Login" }
                        </Button>
                    </div>
                </div>
            </Layout.Header>
            <Layout.Content>
                <ContentView/>
            </Layout.Content>
        </Layout>
    );
};