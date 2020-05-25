import { useManualQuery, UseQueryOptions, UseQueryResult, UseClientRequestResult } from 'graphql-hooks';
import { useEffect, useMemo } from 'react';

export function useSkipQuery<
    TResponseData = any,
    TVariables = object,
    TGraphQLError = object
>(
    query: string,
    options?: UseSkipQueryOptions<TVariables>
): UseSkipQueryResult<TResponseData, TVariables, TGraphQLError> {
    const skip = options?.skip === true;
    const [refetch, { loading, cacheHit, data, error }] = useManualQuery<TResponseData, TVariables, TGraphQLError>(query, options);
    useEffect(() => {
        if (!skip) {
            refetch();
        }
    }, [skip, refetch]);
    return useMemo<UseSkipQueryResult<TResponseData, TVariables, TGraphQLError>>(() => {
        if (skip) {
            return {
                skip,
                loading: false,
                cacheHit: false,
                data: undefined,
                refetch: nopRefetch
            }
        }
        return {
            skip,
            loading,
            cacheHit,
            data: loading || error !== undefined ? undefined : data,
            error,
            refetch
        };
    }, [skip, loading, cacheHit, data, error, refetch]);
}

export interface UseSkipQueryOptions<
    TVariables = object
> extends UseQueryOptions<TVariables> {
    readonly skip?: boolean;
}

export interface UseSkipQueryResult<
    TResponseData,
    TVariables = object,
    TGraphQLError = object
> extends UseQueryResult<TResponseData | undefined, TVariables, TGraphQLError> {
    readonly skip: boolean
}

async function nopRefetch<
    TResponseData,
    TVariables = object,
    TGraphQLError = object
>(
    options?: UseQueryOptions<TVariables>
): Promise<UseClientRequestResult<TResponseData | undefined, TGraphQLError>> {
    return {
        loading: false,
        cacheHit: false,
        data: undefined
    };
}