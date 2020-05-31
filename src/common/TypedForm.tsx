import React, { ReactNode, useState, useEffect } from 'react';
import Form, { FormProps, Rule } from 'antd/es/form';

export class FormDefination<T> {
    
    itemMap: { [key: string]: Item } = {};

    footerCreator: ((invalid: boolean) => ReactNode) | undefined;
    
    item(name: keyof T, label: string, node: ReactNode, rules?: Rule[]): this {
        this.itemMap[name.toString()] = { label, node, rules };
        return this;
    }

    footer(creator: (invalid: boolean) => ReactNode): this {
        this.footerCreator = creator;
        return this;
    }
}

interface Item {
    readonly label: string;
    readonly node: ReactNode;
    readonly rules?: Rule[];
}

export interface TypedFromProps<T> extends Omit<FormProps, 'children'> {
    defination: FormDefination<T>
}

export function TypedForm<T>({defination, ...formProps}: TypedFromProps<T>): JSX.Element {
    const { footerCreator } = defination;
    const { form } = formProps;

    const [, forceUpdate] = useState<boolean>(false);

    // force update the <Form.Item shouldUpate={true}> after mounted
    useEffect(() => {
        if (footerCreator !== undefined && form !== undefined) {
            forceUpdate(true);
        }
    }, [form, footerCreator, forceUpdate]); 

    return (
        <Form {...formProps}>
            {
                Object.keys(defination.itemMap).map((name: string) => {
                    const {node, label, rules} = defination.itemMap[name];
                    return (
                        <Form.Item key={name} name={name} label={label} rules={rules}>
                            {node}
                        </Form.Item>
                    );
                })
            }
            {
                footerCreator === undefined ?
                undefined :
                <Form.Item shouldUpdate={form !== undefined} wrapperCol={{span:24}}>
                    {
                        form === undefined ?
                        () => footerCreator(false) :
                        () => footerCreator(
                            form.getFieldsError().filter(
                                ({errors}) => errors.length
                            ).length !== 0
                        )
                    }
                </Form.Item>
            }
        </Form>
    );
}