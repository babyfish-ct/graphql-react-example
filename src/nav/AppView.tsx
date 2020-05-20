import './AppView.css';
import React from 'react';
import Layout from 'antd/es/layout';
import { MenuView } from './MenuView';
import { ContentView } from './ContentView';

export const AppView: React.FC = () => {
    return (
        <Layout>
                <Layout.Header style={{backgroundColor: 'white'}}>
                    <div className="header">
                        <div>GraphQL React Example</div>
                        <MenuView/>
                    </div>
                </Layout.Header>
                <Layout.Content>
                    <ContentView/>
                </Layout.Content>
            </Layout>
    );
};