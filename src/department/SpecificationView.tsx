import React, { useCallback } from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Checkbox from 'antd/es/checkbox';
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
import { useInputChange, useCheckboxChange } from '../common/Input';

export const SpecificationView: React.FC<{
    specification: DepartmentSpecification,
    onChange: (value: DepartmentSpecification) => void
}> = ({specification, onChange}) => {

    const onNameChange = useInputChange((v: string | undefined) => {
        onChange({
            ...specification,
            name: v
        });
    });

    const onSortedTypeChange = useCallback((sortedType: DepartmentSortedType) => {
        onChange({
            ...specification,
            sortedType
        });
    }, [specification, onChange]);

    const onDescendingChange = useCheckboxChange((v: boolean) => {
        onChange({
            ...specification,
            descending: v
        });
    });

    const onGraphQLPathChange = useCallback((checkedInfo: {checked: Key[]} | Key[]) => {
        const keys = checkedInfo instanceof Array ?
            checkedInfo as string[] :
            checkedInfo.checked as string[]
        onChange({
            ...specification,
            graphQLPaths: keys
        });
    }, [specification, onChange]);

    return (
        <Form 
        layout="horizontal"
        labelCol={{span: 8}}
        wrapperCol={{span: 16}}>
            <Form.Item label="Name">
                <Input value={specification.name} onChange={onNameChange}/>
            </Form.Item>
            <Form.Item label="Sorted type">
                <Select<DepartmentSortedType> 
                value={specification.sortedType} 
                onChange={onSortedTypeChange}>
                    <Select.Option value="ID">Id</Select.Option>
                    <Select.Option value="NAME">Name</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item label="descending">
                <Checkbox checked={specification.descending} onChange={onDescendingChange}/>
            </Form.Item>
            <Form.Item label="GraphQL structure">
                <Tree 
                checkable 
                treeData={TREE_NODES} 
                defaultExpandAll={true}
                checkedKeys={specification.graphQLPaths}
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
