import React, { useCallback } from 'react';
import { Employee } from '../model/Employee';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import { Value, hasValue } from '../common/Value';
import List from 'antd/es/list';
import { DepartmentView } from '../department/DepartmentView';
import { Case } from '../common/Case';
import Card from 'antd/es/card';

export const EmployeeView: React.FC<{
    value: Employee,
    depth?: number
}> = ({value, depth = 1}) => {

    const renderEmployee = useCallback((employee: Employee, index: number) => {
        return (
            <List.Item>
                <EmployeeView value={employee} depth={depth + 1}/>
            </List.Item>
        );
    }, []);

    return (
        <div style={{flex:1}}>
            <Card title={`Employee(Level-${depth})`}>
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
                        <Col span={LABEL_SPAN}>Gender</Col>
                        <Col span={VALUE_SPAN}><Value value={value.gender}/></Col>
                    </Row>
                    <Row>
                        <Col span={LABEL_SPAN}>Salary</Col>
                        <Col span={VALUE_SPAN}><Value value={value.salary}/></Col>
                    </Row>
                    <Row>
                        <Col span={hasValue(value.department) ? 24 : LABEL_SPAN}>Department</Col>
                        <Col span={hasValue(value.department) ? 24 : VALUE_SPAN}>
                            <Value value={value.department}>
                                <div style={{paddingLeft: '2rem'}}>
                                    <DepartmentView value={value.department!} depth={depth + 1}/>
                                </div>
                            </Value>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={hasValue(value.supervisor) ? 24 : LABEL_SPAN}>Supervisor</Col>
                        <Col span={hasValue(value.supervisor) ? 24 : VALUE_SPAN}>
                            <Value value={value.supervisor}>
                                <div style={{paddingLeft: '2rem'}}>
                                    <EmployeeView value={value.supervisor!} depth={depth + 1}/>
                                </div>
                            </Value>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={hasValue(value.subordinates) ? 24 : LABEL_SPAN}>Subordinates</Col>
                        <Col span={hasValue(value.subordinates) ? 24 : VALUE_SPAN}>
                            <Value value={value.subordinates}>
                                <div style={{paddingLeft: '2rem'}}>
                                    <List<Employee>
                                    dataSource={value.subordinates}
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
const VALUE_SPAN = 24 - LABEL_SPAN;