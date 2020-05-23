import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Department } from '../model/Department';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import { SelectDialog } from './SelectDialog';
import { DocumentNode } from 'graphql';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { GraphQLRoot, unwrapRoot } from '../model/graphql/GraphQLRoot';
import { Case } from '../common/Case';
import Spin from 'antd/es/spin';

/**
 * The form of ANTD support custom form control
 * that supports 'value' property and 'onChange' event,
 * 
 * In order to work with ANTD from,
 * this custom from control must be a stateful that menege it's state
 */
export const Selector: React.FC<{
    value?: number,
    onChange?: (value?: number) => void
}> = ({value, onChange}) => {

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

    const {loading, error, data: departmentRoot} = useQuery<GraphQLRoot<Department>>(
        GET_BY_ID_DOCUMENT_NODE,
        {
            fetchPolicy: 'no-cache',
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

    return new Case()
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
            <div>
                <Button onClick={onClearClick}>
                    清除
                </Button>
            </div>
            <SelectDialog 
            visible={dialogVisible}
            id={value}
            onClose={onDialogClose}/>
        </div>
    )
}

const GET_BY_ID_DOCUMENT_NODE: DocumentNode = 
    gql`query($id: Long!) {
        department(id: $id) {
            id
            name
        }
    }`;