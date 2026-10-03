export interface ICriminalFlow {
    key: string;
    created_at: any;
    created_by: any;
    updated_by?: any;
    updated_at?: any;

    flowNo: number;
    department: any;
    canSkipByCategory: boolean;
    category: any;
}

