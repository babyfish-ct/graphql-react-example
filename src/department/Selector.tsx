import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Department } from '../model/Department';
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

    const {loading, error, data: departmentRoot} = useSkipQuery<GraphQLRoot<Department>>(
        `query($id: Long!) {
            department(id: $id) {
                id
                name
            }
        }`,
        {
            skip: id === undefined,
            variables: { id }
            
        }
    );
    const department = useMemo<Department | undefined>(() => {
        if (id === undefined || loading || error !== undefined || departmentRoot === undefined) {
            return undefined;
        }
        return unwrapRoot(departmentRoot);
    }, [loading, error, departmentRoot, id]);

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
                            <Input readOnly value={department?.name} onClick={onInputClick}/>
                        </div>
                        {
                            required ?
                            undefined :
                            <div>
                                <Button onClick={onClearClick} disabled={id === undefined}>
                                    <ClearOutlined/>Clear
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
    );
}
