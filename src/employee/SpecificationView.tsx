import React, { useCallback, ChangeEvent } from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Checkbox, { CheckboxChangeEvent } from 'antd/es/checkbox';
import Select from 'antd/es/select';
import Tree from 'antd/es/tree';
import InputNumber from 'antd/es/input-number';
import { 
    GraphQLTreeNode, 
    EMPLOYEE_BASE_TREE_NODES, 
    DEPARTMENT_BASE_TREE_NODES, 
    childGraphQLTreeNodes 
} from '../model/dynamic/GraphQLTreeNode';
import { EmployeeSortedType } from '../model/EmployeeSortedType';
import { EmployeeSpecification } from '../model/EmployeeSpecification';
import { Key } from 'antd/es/table/interface';
import { Gender } from '../model/Gender';
import { numberOf } from '../common/Number';

export const SpecificationView: React.FC<{
    value: EmployeeSpecification,
    onChange: (value: EmployeeSpecification) => void
}> = ({value, onChange}) => {

    const onNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const trimedValue = e.target.value.trim();
        onChange({
            ...value,
            criteria: {
                ...value.criteria,
                name: trimedValue === "" ? undefined : trimedValue
            }
        });
    }, [value, onChange]);

    const onGenderChange = useCallback((v: string) => {
        const gender: Gender | undefined = 
            (v === "MALE" || v === "FEMALE") ?
            v as Gender :
            undefined;
        onChange({
            ...value,
            criteria: {
                ...value.criteria,
                gender
            }
        });
    }, [value, onChange]);

    const onMinSalaryChange = useCallback((v: number | string | undefined) => {
        onChange({
            ...value,
            criteria: {
                ...value.criteria,
                minSalary: numberOf(v)
            }
        });
    }, [value, onChange]);

    const onMaxSalaryChange = useCallback((v: number | string | undefined) => {
        onChange({
            ...value,
            criteria: {
                ...value.criteria,
                maxSalary: numberOf(v)
            }
        });
    }, [value, onChange]);

    const onSortedTypeChange = useCallback((sortedType: EmployeeSortedType) => {
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
                <Input value={value.criteria?.name} onChange={onNameChange}/>
            </Form.Item>
            <Form.Item label="Gender">
                <Select<string>
                value={value.criteria?.gender ?? "ANY"}
                onChange={onGenderChange}>
                    <Select.Option value="ANY">--Any--</Select.Option>
                    <Select.Option value="MALE">Male</Select.Option>
                    <Select.Option value="FEMALE">Female</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item label="Min Salary">
                <InputNumber min={0} value={value.criteria?.minSalary} onChange={onMinSalaryChange}/>
            </Form.Item>
            <Form.Item label="Max Salary">
                <InputNumber min={0} value={value.criteria?.maxSalary} onChange={onMaxSalaryChange}/>
            </Form.Item>
            <Form.Item label="Sorted type">
                <Select<EmployeeSortedType> value={value.sortedType} onChange={onSortedTypeChange}>
                    <Select.Option value="ID">Id</Select.Option>
                    <Select.Option value="NAME">Name</Select.Option>
                    <Select.Option value="SALARY">Salary</Select.Option>
                    <Select.Option value="DEPARTMENT_ID">Department Id</Select.Option>
                    <Select.Option value="DEPARTMENT_NAME">Department Name</Select.Option>
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
                onCheck={onGraphQLPathChange}/>
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
        key: "supervisor", 
        title: <span style={{fontWeight: 'bold'}}>Supervisor(many-to-one assciation)</span>,
        children: childGraphQLTreeNodes("supervisor", EMPLOYEE_BASE_TREE_NODES)
    },
    { 
        key: "subordinates", 
        title: <span style={{fontWeight: 'bold'}}>Subordinates(one-to-many association)</span>,
        children: childGraphQLTreeNodes("subordinates", EMPLOYEE_BASE_TREE_NODES)
    }
];