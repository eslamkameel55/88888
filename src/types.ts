/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string; // Internal id
  name: string; // اسم المنتج
  category: string; // الفئة (موبايل، إكسسوارات، قطع غيار، إلخ)
  code: string; // الكود
  barcode: string; // الباركود
  buyPrice: number; // سعر الشراء
  sellPrice: number; // سعر البيع
  quantity: number; // الكمية الحالية
  minStock: number; // الحد الأدنى للمخزون
  supplierName: string; // المورد
  lastPurchaseDate: string; // تاريخ آخر شراء
}

export interface SaleItem {
  productId: string;
  name: string;
  category: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  discount: number; // الخصم على مستوى المنتج
  total: number; // (سعر البيع - الخصم) * الكمية
}

export interface Invoice {
  id: string; // رقم الفاتورة (مثلاً INV-1001)
  date: string; // التاريخ
  time: string; // الوقت
  customerName: string; // اسم العميل
  customerPhone: string; // رقم الهاتف
  items: SaleItem[]; // المنتجات
  totalBeforeDiscount: number; // الإجمالي قبل الخصم
  discount: number; // الخصم الإضافي على الفاتورة
  tax: number; // الضريبة
  grandTotal: number; // الصافي النهائي
  paymentMethod: 'نقدي' | 'إنستا باي'; // طريقة الدفع
  employee: string; // الموظف
  notes: string; // ملاحظات
}

export interface Customer {
  id: string;
  name: string; // الاسم
  phone: string; // الهاتف
  address: string; // العنوان
  notes: string; // الملاحظات
  totalPurchases: number; // إجمالي المشتريات
  totalPaid: number; // إجمالي المدفوع
  totalRemaining: number; // المتبقي
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  date: string;
  type: 'شراء فاتورة' | 'دفعة نقدية' | 'صيانة جهاز';
  referenceId: string; // Invoice ID or Maintenance ID
  amount: number;
  paid: number;
  remaining: number;
  notes: string;
}

export interface Supplier {
  id: string;
  name: string; // الاسم
  phone: string; // الهاتف
  address: string; // العنوان
  totalBalance: number; // الرصيد الكلي للمورد
  totalPaid: number; // إجمالي المدفوع له
  totalRemaining: number; // المتبقي عليه أو له
}

export interface SupplierTransaction {
  id: string;
  supplierId: string;
  date: string;
  type: 'شراء بضاعة' | 'دفع نقدي';
  amount: number;
  paid: number;
  remaining: number;
  notes: string;
}

export type MaintenanceStatus = 'جديد' | 'جاري الإصلاح' | 'جاهز' | 'تم التسليم';

export interface MaintenanceTicket {
  id: string; // رقم الاستلام (تلقائي مثلاً MNT-1001)
  date: string; // التاريخ
  customerName: string; // اسم العميل
  customerPhone: string; // الهاتف
  deviceType: string; // نوع الجهاز (مثلاً سامسونج، آيفون)
  deviceModel: string; // الموديل
  imei: string; // الرقم التسلسلي أو IMEI
  issue: string; // العطل
  technician: string; // الفني
  sparePartsCost: number; // تكلفة قطع الغيار
  laborCost: number; // تكلفة الصيانة (المصنعية)
  totalCost: number; // إجمالي التكلفة = قطع الغيار + المصنعية
  paid: number; // المدفوع
  remaining: number; // المتبقي
  deliveryDate: string; // موعد التسليم المتوقع
  status: MaintenanceStatus; // حالة الجهاز
  notes: string; // ملاحظات
}

export interface RechargeLog {
  id: string;
  date: string; // التاريخ
  time: string; // الوقت
  network: 'فودافون' | 'أورنج' | 'اتصالات' | 'وي'; // الشبكة
  phone: string; // رقم الهاتف المشحون له
  amount: number; // قيمة الشحن
  commission: number; // العمولة (أرباح الشحن)
  employee: string; // الموظف
}

export interface WalletTransferLog {
  id: string;
  date: string; // التاريخ
  time: string; // الوقت
  type: 'إيداع' | 'سحب'; // إيداع كاش للمحفظة أو سحب كاش من المحفظة
  walletType: 'فودافون كاش' | 'اتصالات كاش' | 'أورنج كاش' | 'وي باي' | 'محفظة أخرى';
  phone: string; // رقم المحفظة المستهدفة
  amount: number; // مبلغ التحويل
  fee: number; // الرسوم المدفوعة من العميل
  commission: number; // ربح المحل من العملية
  employee: string; // الموظف المسؤول
  notes: string; // الملاحظات ورقم العملية
}

export interface CashLog {
  id: string;
  type: 'دخول كاش' | 'خروج كاش'; // حركة واردة أو صادر
  reason: string; // السبب
  amount: number; // المبلغ
  date: string; // التاريخ
  time: string; // الوقت
  balanceAfter: number; // الرصيد بعد العملية
}

export interface InstaPayLog {
  id: string;
  type: 'دخول' | 'خروج'; // وارد أو صادر
  reason: string; // السبب
  amount: number; // المبلغ
  date: string; // التاريخ
  time: string; // الوقت
  balanceAfter: number; // الرصيد الحالي بعد العملية
}

export interface Expense {
  id: string;
  date: string; // التاريخ
  category: string; // نوع المصروف (إيجار، كهرباء، رواتب، بوفيه، إعلانات، صيانة عامة، أخرى)
  amount: number; // القيمة
  reason: string; // السبب بالتفصيل
  employee: string; // الموظف المسؤول
}

export interface StoreSettings {
  storeName: string;
  phone: string;
  address: string;
  logoUrl: string;
  taxNumber: string;
  receiptFooter: string;
}
