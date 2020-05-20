import React, { useMemo, useCallback } from 'react';
import Menu, { ClickParam } from 'antd/es/menu';
import { useLocation } from 'wouter';
import { DEPARTMENTS, EMPLOYEES } from './Constants';

export const MenuView: React.FC = () => {

    const [path, goto] = useLocation();

    const selectedKey = path === "/" ? DEPARTMENTS : path;

    const onMenuClick = useCallback((param: ClickParam) => {
        goto(param.key);
    }, [goto]);

    return (
        <Menu 
        mode="horizontal"
        selectedKeys={[selectedKey]}
        onClick={onMenuClick}>
            <Menu.Item key={DEPARTMENTS}>
                Department Management
            </Menu.Item>
            <Menu.Item key={EMPLOYEES}>
                Employee Management
            </Menu.Item>
        </Menu>
    );
};
