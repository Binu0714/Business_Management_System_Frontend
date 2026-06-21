export interface SaleItem {
  itemId: string;
  itemName: string;
  sellingPrice: number;
  qty: number;
  total: number;
}

export interface SaleRecord {
  id?: string;
  repId: string;
  repName: string;
  shopId: string;
  shopName: string;
  date: string;
  items: SaleItem[];
  grandTotal: number;
  amountPaid: number;      // Amount paid on hand
  outstanding: number;     // Remaining credit (GrandTotal - AmountPaid)
  status: 'paid' | 'partial' | 'unpaid';
  remarks?: string;        // FIX: Added optional remarks
  shopPhone?: string;      // FIX: Added optional shop contact number
  createdAt?: string;
}