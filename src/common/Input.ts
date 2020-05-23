import { useCallback, ChangeEvent } from "react";
import { CheckboxChangeEvent } from "antd/es/checkbox";

export function useInputChange(setter: (
    value: string | undefined) => void, 
    trim: boolean = true
): (e: ChangeEvent<HTMLInputElement>) => void {
    return useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const trimedValue = trim ? value.trim() : value;
        if (trimedValue === "") {
            setter(undefined);
        } else {
            setter(trimedValue);
        }
    }, [setter, trim]);
}

export function useCheckboxChange(
    setter: (value: boolean) => void
): (e: CheckboxChangeEvent) => void {
    return useCallback((e: CheckboxChangeEvent) => {
        setter(e.target.checked);
    }, [setter]);
}