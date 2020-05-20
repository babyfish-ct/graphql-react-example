import React from 'react';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import { CriteriaView } from '../employee/CriteriaView';

export const ManagementView: React.FC = () => {

    return (
        <Row>
            <Col span={12}>
                <div style={{padding: '1rem'}}>
                    <CriteriaView/>      
                </div>
            </Col>
            <Col>
            </Col>
        </Row>
    );
};
