import { OperationVariables, DocumentNode } from 'apollo-boost';
import { QueryHookOptions, useQuery } from '@apollo/react-hooks';
import { QueryResult } from '@apollo/react-common';
import { useEffect } from 'react';

/**
 * Make sure the query can get the newest data 
 */
export function useNewQuery<TData = any, TVariables = OperationVariables>(
    query: DocumentNode, 
    options?: QueryHookOptions<TData, TVariables>
): QueryResult<TData, TVariables> {
    const result = useQuery(query, options);
    const skip = options?.skip === true;
    const refetch = result.refetch;
    useEffect(() => {
        if (!skip) {
            refetch();
        }
    }, [skip, refetch]);
    return result;
}
