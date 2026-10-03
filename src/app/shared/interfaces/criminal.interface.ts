export interface IPaymentReceipt{
  key: string;
  invoice_id: string;
  status: any;
  isDelete: boolean;
  created_at: any;
  created_by: any;
  paid_at?: any;
  paid_by?: any;
  paid_online?: boolean,
  paid_bank?: any,
  paid_remark?: any,

  updated_at: any;

  date_key?: any;
  page_key?: any;

  urgent_obj: any;
  criminal_language: any;
  apply_from: any;
  isStudent: any;
  bank_option: any; //bank services
  national_application?: any;
  total_amount: number;
  payment_option: any;
  criminalRef: string;
}
