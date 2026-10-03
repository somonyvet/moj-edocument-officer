export interface IChartAccount {
    key: string;
    status: any;
    created_at: any;
    created_by: any;
    updated_by?: any;
    updated_at?: any;
    date_key?: any;
    page_key?: any;
    keyword: string[];
    company: any;

    //analysis
    index: number;
    level: any;
    node: any;
    order: any;
    parent: any;
    totalChild: any;
    path: any;
    accountKeys: any[];

    //fields
    name: string;
    nameKey: string;
    accountType: any;
    detailAccount: any;
    description: string;
    subOfAccount: any;

    openingBalance?: number;
    openingBalance_at?: any;

    balance?: number;
    bankBalance?: number;
    //display
    displayBalance?: string;
    displayBankBalance?: string;
    endingBalance?: string;
}

export interface AccountNode {
    item: IChartAccount;
    children?: AccountNode[];
}
export interface AccountFlatNode {
    item: IChartAccount;
    children?: AccountNode[];
    expandable: boolean;
    level: number;
}
