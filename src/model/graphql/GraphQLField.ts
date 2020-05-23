/*
 * GraphQL model field
 *
 * undefined:
 *     Not loaded.
 *     This field is not queried by GraphQL, its value is unknown
 * 
 * null:
 *     No data.
 *     This field is already queried by GraphQL, but there is no value
 */

export type GraphQLRequired<T> = T | undefined;

export type GraphQLOptional<T> = T | null | undefined;