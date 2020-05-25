import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Employee } from '../model/Employee';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import { SelectDialog } from './SelectDialog';
import { GraphQLRoot, unwrapRoot } from '../model/graphql/GraphQLRoot';
import { Case } from '../common/Case';
import Spin from 'antd/es/spin';
import { ClearOutlined } from '@ant-design/icons'; 
import { useSkipQuery } from '../common/SkipQueryHooks';

/**
 * The form of ANTD support custom form control
 * that supports 'value' property and 'onChange' event,
 * 
 * In order to work with ANTD from,
 * this custom from control must be a stateful that menege it's state
 */
export const Selector: React.FC<{
    value?: number,
    required?: boolean,
    onChange?: (value?: number) => void
}> = ({value, required = false, onChange}) => {

    // the state of the custom control
    const [id, setId] = useState<number>();

    useEffect(() => {
        setId(value);
    }, [value]);
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const onInputClick = useCallback(() => {
        setDialogVisible(true);
    }, []);
    const onDialogClose = useCallback((newId?: number) => {
        setDialogVisible(false);
        if (id !== newId) {
            setId(newId);
            if (onChange !== undefined) {
                onChange(newId);
            }
        }
    }, [id, onChange]);
    const onClearClick = useCallback(() => {
        setId(undefined);
        if (onChange !== undefined) {
            onChange(undefined);
        }
    }, [onChange]);

    const {loading, error, data: employeeRoot} = useSkipQuery<GraphQLRoot<Employee>>(
        `query($id: Long!) {
            employee(id: $id) {
                id
                name
            }
        }`,
        {
            skip: id === undefined,
            variables: { id }
        }
    );
    const employee = useMemo<Employee | undefined>(() => {
        if (id === undefined || loading || error !== undefined || employeeRoot === undefined) {
            return undefined;
        }
        return unwrapRoot(employeeRoot);
    }, [loading, error, employeeRoot, id]);

    return (
        <div>
            {
                new Case()
                .when(
                    loading,
                    <Spin>Loading...</Spin>
                )
                .when(
                    error !== undefined,
                    <div>Load failed</div>
                )
                .otherwise(
                    <div style={{display: 'flex'}}>
                        <div style={{flex: 1}}>
                            <Input readOnly value={employee?.name} onClick={onInputClick}/>
                        </div>
                        {
                            required ?
                            undefined : 
                            <div>
                                <Button onClick={onClearClick} disabled={id === undefined}>
                                    <ClearOutlined />Clear
                                </Button>
                            </div>
                        }
                        <SelectDialog 
                        visible={dialogVisible}
                        id={value}
                        onClose={onDialogClose}/>
                    </div>
                )
            }
        </div>
    )
}
