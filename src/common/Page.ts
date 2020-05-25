export interface Page<E> {
    readonly pageNo: number;
    readonly pageSize: number;
    readonly rowCount: number;
    readonly pageCount: number;
    readonly entities: E[];
}

export const DEFAULT_LIST_PAGE_SIZE = 5;