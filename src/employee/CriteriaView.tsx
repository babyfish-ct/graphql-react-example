import React from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Checkbox from 'antd/es/checkbox';
import Select from 'antd/es/select';
import Tree from 'antd/es/tree';
import { 
    GraphQLTreeNode, 
    EMPLOYEE_BASE_TREE_NODES, 
    DEPARTMENT_BASE_TREE_NODES, 
    childGraphQLTreeNodes 
} from '../model/dynamic/GraphQLTreeNode';
import { EmployeeSortedType } from '../model/EmployeeSortedType';

export const CriteriaView: React.FC = () => {
    return (
        <Form
        layout="horizontal"
        labelCol={{span: 8}}
        wrapperCol={{span: 16}}>
            <Form.Item label="Sorted type">
                <Select<EmployeeSortedType>>
                    <Select.Option value="ID">Id</Select.Option>
                    <Select.Option value="NAME">Name</Select.Option>
                    <Select.Option value="SALARY">Salary</Select.Option>
                    <Select.Option value="DEPARTMENT">Department id</Select.Option>
                    <Select.Option value="DEPARTMENT_NAME">Department name</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item label="descending">
                <Checkbox checked={false}/>
            </Form.Item>
            <Form.Item label="GraphQL structure">
                <Tree
                checkable
                treeData={TREE_NODES}
                defaultExpandAll={true}/>
            </Form.Item>
        </Form>
    );
};

const TREE_NODES: GraphQLTreeNode[] = [
    ...EMPLOYEE_BASE_TREE_NODES,
    {
        key: "department",
        title: <span style={{fontWeight: 'bold'}}>Departments(many-to-one association)</span>,
        children: childGraphQLTreeNodes(
            "department", 
            [
                ...DEPARTMENT_BASE_TREE_NODES,
                {
                    key: "avgSalary",
                    title: <span style={{fontWeight: 'bold'}}>Average Slary(aggregation value)</span>
                }
            ],
        )
    },
    { 
        key: "supervisior", 
        title: <span style={{fontWeight: 'bold'}}>Supervisor(many-to-one assciation)</span>,
        children: childGraphQLTreeNodes("supervisior", EMPLOYEE_BASE_TREE_NODES)
    },
    { 
        key: "subordinates", 
        title: <span style={{fontWeight: 'bold'}}>Subordinates(one-to-many association)</span>,
        children: childGraphQLTreeNodes("subordinates", EMPLOYEE_BASE_TREE_NODES)
    }
];