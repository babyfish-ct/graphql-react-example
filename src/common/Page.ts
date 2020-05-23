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
    readonly refetch: () => void;
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

/*
 * The server side support two endpoints:
 *     1. Query the total row count
 *     2. Query the rows in a page
 * 
 * This custom hook combine this together
 */
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

    const skipList = useMemo<boolean>(() => {
        return skip || actualPageNo === undefined || pageCount === 0
    }, [skip, actualPageNo, pageCount]);
    const listGraphQLNode = useMemo<DocumentNode>(() => {
        if (skip) {}
        return gql(listGraphQL);
    }, [listGraphQL, skip]);
    const listGraphQLOptions = useMemo<QueryHookOptions<GraphQLRoot<TEntity[]>>>(() => {
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
        const refetch = () => {

            /*
             * The wrapper refetch method don't invoke the 
             * target refetch methods if skip attribute is true
             * 
             * @apollo/react-hooks has a problem:
             * When  
             *     1. skip is true
             *     2. use dynamic graphql(like this demo)
             * refetch method will cause an exception to tell the
             * developer cannot change the graphql string of existing query.
             * 
             * Please read 
             * https://github.com/apollographql/apollo-feature-requests/issues/77
             * to know more
             * 
             * You needn't to do it like this in real business projects,
             * because graphql query string is static in those projects.
             * This demo need to do it like this because this demo uses
             * dynamic graphql query that won't be used in real business projects
             */
            if (!skip && countResult.refetch !== undefined) {
                countResult.refetch();
            }
            if (!skipList && listResult.refetch !== undefined) {
                listResult.refetch();
            }
        };
        return {
            page,
            error: listResult.error ?? countResult.error,
            loading: listResult.loading || countResult.loading,
            called: listResult.called,
            refetch
        };
    }, [countResult, listResult, rowCount, pageCount, list, skip, skipList, actualPageNo, pageSize]);
}

export const DEFAULT_LIST_PAGE_SIZE = 5;