import React, { useState, useCallback, ChangeEvent } from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Checkbox, { CheckboxChangeEvent } from 'antd/es/checkbox';
import Select from 'antd/es/select';
import Tree from 'antd/es/tree';
import { 
    GraphQLTreeNode, 
    DEPARTMENT_BASE_TREE_NODES, 
    EMPLOYEE_BASE_TREE_NODES, 
    childGraphQLTreeNodes 
} from '../model/dynamic/GraphQLTreeNode';
import { DepartmentSortedType } from '../model/DepartmentSortedType';
import { DepartmentSpecification } from '../model/DepartmentSpecification';
import { Key } from 'antd/es/table/interface';

export const CriteriaView: React.FC<{
    value: DepartmentSpecification,
    onChange: (value: DepartmentSpecification) => void
}> = ({value, onChange}) => {

    const onNameChanged = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const trimedValue = e.target.value.trim();
        onChange({
            ...value,
            name: trimedValue === "" ? undefined : trimedValue
        });
    }, [value, onchange]);

    const onSortedTypeChange = useCallback((sortedType: DepartmentSortedType) => {
        onChange({
            ...value,
            sortedType
        });
    }, [value, onChange]);

    const onDescendingChange = useCallback((e: CheckboxChangeEvent) => {
        onChange({
            ...value,
            descending: e.target.checked
        });
    }, [value, onChange]);

    const onGraphQLPathChange = useCallback((checkedInfo: {checked: Key[]} | Key[]) => {
        const keys = checkedInfo instanceof Array ?
            checkedInfo as string[] :
            checkedInfo.checked as string[]
        onChange({
            ...value,
            graphQLPaths: keys
        });
    }, [value, onChange]);

    return (
        <Form 
        layout="horizontal"
        labelCol={{span: 8}}
        wrapperCol={{span: 16}}>
            <Form.Item label="Name">
                <Input value={value.name} onChange={onNameChanged}/>
            </Form.Item>
            <Form.Item label="Sorted type">
                <Select<DepartmentSortedType> 
                value={value.sortedType} 
                onChange={onSortedTypeChange}>
                    <Select.Option value="ID">Id</Select.Option>
                    <Select.Option value="NAME">Name</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item label="descending">
                <Checkbox checked={value.descending} onChange={onDescendingChange}/>
            </Form.Item>
            <Form.Item label="GraphQL structure">
                <Tree 
                checkable 
                treeData={TREE_NODES} 
                defaultExpandAll={true}
                checkedKeys={value.graphQLPaths}
                onCheck={onGraphQLPathChange}/>
            </Form.Item>
        </Form>
    );
};

const TREE_NODES: GraphQLTreeNode[] = [
    ...DEPARTMENT_BASE_TREE_NODES,
    {
        key: "avgSalary",
        title: <span style={{fontWeight: 'bold'}}>Average Slary(aggregation value)</span>
    },
    { 
        key: "employees", 
        title: <span style={{fontWeight: 'bold'}}>Employees(one-to-many assoication)</span>,
        children: [
            ...childGraphQLTreeNodes("employees", EMPLOYEE_BASE_TREE_NODES),
            { 
                key: "employees.supervisor", 
                title: <span style={{fontWeight: 'bold'}}>Supervisor(many-to-one assciation)</span>,
                children: childGraphQLTreeNodes("employees.supervisor", EMPLOYEE_BASE_TREE_NODES)
            },
            { 
                key: "employees.subordinates", 
                title: <span style={{fontWeight: 'bold'}}>Subordinates(one-to-many association)</span>,
                children: childGraphQLTreeNodes("employees.subordinates", EMPLOYEE_BASE_TREE_NODES)
            }
        ]
    },
];
