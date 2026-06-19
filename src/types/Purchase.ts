export interface PurchaseItem {
  itemId: string;
  itemName: string;
  price: number;
  sellingPrice: number;
  qty: number;
  total: number;
}

export interface PurchaseOrder {
  id?: string;
  supplierId: string;
  supplierName: string;
  date: string;
  batchNo: string;  
  expDate: string;  
  remarks: string;
  items: PurchaseItem[];
  grandTotal: number;
  createdAt?: string;
}