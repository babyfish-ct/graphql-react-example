import { Employee } from './Employee';
import {GraphQLRequired, GraphQLOptional} from './graphql/GraphQLField';
import { GraphQLInt } from 'graphql';

export interface Department {
    readonly id: GraphQLRequired<number>;
    readonly name: GraphQLRequired<string>;
    readonly avgSalary: GraphQLOptional<number>;
    readonly employees: GraphQLRequired<Employee[]>;
}