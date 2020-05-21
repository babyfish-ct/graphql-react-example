import React, { useCallback, ReactNode } from 'react';
import { Department } from '../model/Department';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import { Value, hasValue } from '../common/Value';
import { Employee } from '../model/Employee';
import List from 'antd/es/list';
import Card from 'antd/es/card';
import { EmployeeView } from '../employee/EmployeeView';

export const DepartmentView: React.FC<{
    value: Department,
    depth?: number
}> = ({value, depth = 1}) => {

    const renderEmployee = useCallback((employee: Employee, index: number): React.ReactNode => {
        return (
            <List.Item key={index}>
                <EmployeeView value={employee} depth={depth + 1}/>
            </List.Item>
        );
    }, [depth]);

    return (
        <div style={{flex: 1}}>
            <Card title={`Department(Level-${depth})`}>
                <div className={`object-view-${depth}`}>
                    <Row>
                        <Col span={LABEL_SPAN}>Id</Col>
                        <Col span={VALUE_SPAN}><Value value={value.id}/></Col>
                    </Row>
                    <Row>
                        <Col span={LABEL_SPAN}>Name</Col>
                        <Col span={VALUE_SPAN}><Value value={value.name}/></Col>
                    </Row>
                    <Row>
                        <Col span={LABEL_SPAN}>Average salary</Col>
                        <Col span={VALUE_SPAN}><Value value={value.avgSalary}/></Col>
                    </Row>
                    <Row>
                        <Col span={hasValue(value.employees) ? 24 : LABEL_SPAN}>Employees</Col>
                        <Col span={hasValue(value.employees) ? 24 : VALUE_SPAN}>
                            <Value value={value.employees}>
                                <div style={{paddingLeft: '2rem'}}>
                                    <List<Employee>
                                    dataSource={value.employees}
                                    renderItem={renderEmployee}/>
                                </div>
                            </Value>
                        </Col>
                    </Row>
                </div>
            </Card>
        </div>
    );
};

const LABEL_SPAN = 8;
const VALUE_SPAN = 16;