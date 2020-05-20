import React from 'react';
import {Route, Switch} from 'wouter';
import { DEPARTMENTS, EMPLOYEES } from './Constants';
import { ManagementView as DepartmentManagmentView} from '../department/ManagementView';
import { ManagementView as EmployeeManagmentView } from '../employee/ManagmentView';

export const ContentView: React.FC = () => {
    return (
        <div>
            <Switch>
                <Route path="/" component={DepartmentManagmentView} />
                <Route path={DEPARTMENTS} component={DepartmentManagmentView} />
                <Route path={EMPLOYEES} component={EmployeeManagmentView}/>
            </Switch>
        </div>
    );
};