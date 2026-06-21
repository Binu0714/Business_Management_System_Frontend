export interface InventoryItem {
  id?: string;          // Firestore Document ID
  itemId: string;       // e.g., "I001"
  batchNo: string;      // e.g., "B001"
  expDate: string;      // e.g., "2026-06-19"
  productName: string;  // e.g., "Cashew Bites"
  originalQty: number;  // The original quantity purchased
  stockQty: number;     // The actual available quantity on hand
}