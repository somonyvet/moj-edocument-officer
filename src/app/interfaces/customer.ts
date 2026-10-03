export interface ICustomer {
    key: string;
    name: string
    email: string;
    address: string;
    country: any;
    postal_code: string;
    telephone_number: string;
    fax_number: string;
    discount_percentage: number;
    discount_amount: number;
    credit_Limit: number;
    account_name: string;
    status: any;
    isDelete: boolean;
    created_at: Date;
    created_by: any;
    updated_by?: any;
    updated_at?: any;
    deleted_by?: any;
    deleted_at?: any;
    date_key?: any;
    page_key?: any;
    keyword: any;
}