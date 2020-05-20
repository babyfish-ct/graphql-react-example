import { Gender } from "./Gender";
import { Department } from "./Department";
import {GraphQLRequired, GraphQLOptional} from './graphql/GraphQLField';

export interface Employee {
    readonly id: GraphQLRequired<number>;
    readonly name: GraphQLRequired<string>;
    readonly gender: GraphQLRequired<Gender>;
    readonly salary: GraphQLRequired<number>;
    readonly department: GraphQLRequired<Department>;
    readonly supervisor: GraphQLOptional<Employee>;
    readonly subordinates: GraphQLRequired<Employee[]>;
}