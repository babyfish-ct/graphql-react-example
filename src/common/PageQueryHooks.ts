import { useMemo } from "react";
import { APIError } from 'graphql-hooks';
import { UseSkipQueryOptions, useSkipQuery } from "./SkipQueryHooks";
import { GraphQLRoot, unwrapRoot } from "../model/graphql/GraphQLRoot";
import { Page } from "./Page";

export interface PageResult<TEntity, TGraphQLError = object> {
    readonly skip: boolean;
    readonly loading: boolean;
    readonly error?: APIError<TGraphQLError>;
    readonly page: Page<TEntity> | undefined;
    readonly refetch: () => void;
}

export interface PageQueryArgs<TVariables = object> {
    skip?: boolean,
    countGraphQL: string,
    listGraphQL: string,
    pageNo: number,
    pageSize: number,
    options?: UseSkipQueryOptions<TVariables>,
    limitArgumentName?: string,
    offsetArgumentName?: string
}

/*
 * The server side support two endpoints:
 *     1. Query the total row count
 *     2. Query the rows in a page
 * 
 * This custom hook combine this together
 */
export function usePageQuery<
    TEntity = any, 
    TGraphQLError = object
>({
    skip = false,
    countGraphQL,
    listGraphQL,
    pageNo,
    pageSize,
    options,
    limitArgumentName = "limit",
    offsetArgumentName = "offset"
}: PageQueryArgs): PageResult<TEntity, TGraphQLError> {

    if (pageSize < 1) {
        throw new Error("pageSize cannot be less than 1");
    }

    const countResult = useSkipQuery<GraphQLRoot<number>, object, TGraphQLError>(
        countGraphQL, 
        options
    );
    const rowCount = useMemo<number | undefined>(() => {
        if (skip || countResult.error !== undefined || countResult.loading || countResult.data === undefined) {
            return undefined;
        }
        return unwrapRoot(countResult.data);
    }, [countResult, skip]);
    const pageCount = useMemo<number | undefined>(() => {
        if (skip || rowCount === undefined) {
            return undefined;
        }
        return Math.floor((rowCount + pageSize - 1) / pageSize);
    }, [skip, pageSize, rowCount]);
    const actualPageNo = useMemo<number | undefined>(() => {
        if (pageCount === undefined) {
            return undefined;
        }
        return Math.max(1, Math.min(pageCount, pageNo));
    }, [pageNo, pageCount]);

    const skipList = useMemo<boolean>(() => {
        return skip || actualPageNo === undefined || pageCount === 0
    }, [skip, actualPageNo, pageCount]);
    
    const listGraphQLOptions = useMemo<UseSkipQueryOptions>(() => {
        return {
            ...options,
            skip: skipList,
            variables: {
                ...options?.variables,
                [limitArgumentName]: pageSize,
                [offsetArgumentName]: (actualPageNo! - 1) * pageSize
            }
        };
    }, [skipList, options, limitArgumentName, offsetArgumentName, pageSize, actualPageNo]);
    const listResult = useSkipQuery<GraphQLRoot<TEntity[]>, object, TGraphQLError>(
        listGraphQL,
        listGraphQLOptions
    );

    const list = useMemo<TEntity[] | undefined>(() => {
        if (skip || listResult.error !== undefined || listResult.loading || listResult.data === undefined) {
            return undefined;
        }
        return unwrapRoot(listResult.data);
    }, [listResult, skip]);

    return useMemo<PageResult<TEntity, TGraphQLError>>(() => {
        let page: Page<TEntity> | undefined;
        if (skip || 
            rowCount === undefined || 
            pageCount === undefined || 
            actualPageNo === undefined || 
            list === undefined) {
            page = undefined;
        } else if (pageCount === 0) {
            page = {
                pageNo: 1,
                pageSize,
                rowCount: 0,
                pageCount: 0,
                entities: []
            };
        } else {
            page = {
                pageNo: actualPageNo,
                pageSize,
                rowCount,
                pageCount,
                entities: list
            };
        }
        return {
            skip: countResult.skip || listResult.skip,
            loading: listResult.loading || countResult.loading,
            error: listResult.error ?? countResult.error,
            page,
            refetch: () => {
                countResult.refetch();
                listResult.refetch();     
            }
        };
    }, [countResult, listResult, rowCount, pageCount, list, skip, actualPageNo, pageSize]);
}