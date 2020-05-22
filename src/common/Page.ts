import { useMemo } from "react";
import { DocumentNode } from "graphql";
import { gql, ApolloError } from "apollo-boost";
import { BaseQueryOptions } from '@apollo/react-common';
import { useQuery, QueryHookOptions } from '@apollo/react-hooks';
import { GraphQLRoot, unwrapRoot } from "../model/graphql/GraphQLRoot";

export interface Page<E> {
    readonly pageNo: number;
    readonly pageSize: number;
    readonly rowCount: number;
    readonly pageCount: number;
    readonly entities: E[];
}

export interface PageResult<TEntity> {
    readonly page: Page<TEntity> | undefined;
    readonly error?: ApolloError;
    readonly loading: boolean;
    readonly called: boolean;
}

export interface PageQueryArgs {
    skip?: boolean,
    countGraphQL: string,
    listGraphQL: string,
    pageNo: number,
    pageSize: number,
    options?: BaseQueryOptions,
    limitArgumentName?: string,
    offsetArgumentName?: string
}

export function usePageQuery<TEntity = any>({
    skip = false,
    countGraphQL,
    listGraphQL,
    pageNo,
    pageSize,
    options,
    limitArgumentName = "limit",
    offsetArgumentName = "offset"
}: PageQueryArgs): PageResult<TEntity> {

    if (pageSize < 1) {
        throw new Error("pageSize cannot be less than 1");
    }

    const countGraphQLNode = useMemo<DocumentNode>(() => {
        return gql(countGraphQL)
    }, [countGraphQL]);
    const countGraphQLOptions = useMemo<QueryHookOptions<GraphQLRoot<number>>>(() => {
        return { ...options, skip };
    }, [skip, options]);
    const countResult = useQuery<GraphQLRoot<number>>(
        countGraphQLNode, 
        countGraphQLOptions
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

    const listGraphQLNode = useMemo<DocumentNode>(() => {
        return gql(listGraphQL);
    }, [listGraphQL]);
    const listGraphQLOptions = useMemo<QueryHookOptions<GraphQLRoot<TEntity[]>>>(() => {
        return {
            ...options,
            skip: skip || actualPageNo === undefined || pageCount === 0,
            variables: {
                ...options?.variables,
                [limitArgumentName]: pageSize,
                [offsetArgumentName]: (actualPageNo! - 1) * pageSize
            }
        };
    }, [skip, options, limitArgumentName, offsetArgumentName, pageSize, pageCount, actualPageNo]);
    const listResult = useQuery<GraphQLRoot<TEntity[]>>(
        listGraphQLNode,
        listGraphQLOptions
    );

    const list = useMemo<TEntity[] | undefined>(() => {
        if (skip || listResult.error !== undefined || listResult.loading || listResult.data === undefined) {
            return undefined;
        }
        return unwrapRoot(listResult.data);
    }, [listResult, skip]);

    return useMemo<PageResult<TEntity>>(() => {
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
            page,
            error: listResult.error ?? countResult.error,
            loading: listResult.loading || countResult.loading,
            called: listResult.called
        };
    }, [countResult, listResult, rowCount, pageCount, list, skip, actualPageNo, pageSize]);
}

export const DEFAULT_LIST_PAGE_SIZE = 5;