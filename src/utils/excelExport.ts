/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Product, Invoice, Customer, Supplier, MaintenanceTicket, RechargeLog, CashLog, InstaPayLog, Expense } from '../types';

interface SystemData {
  products: Product[];
  invoices: Invoice[];
  customers: Customer[];
  suppliers: Supplier[];
  maintenance: MaintenanceTicket[];
  recharges: RechargeLog[];
  expenses: Expense[];
  cashLogs: CashLog[];
  instaPayLogs: InstaPayLog[];
}

export function exportAllToExcel(data: SystemData) {
  const wb = XLSX.utils.book_new();

  // 1. Products Sheet (المنتجات)
  const productsData = data.products.map(p => ({
    'اسم المنتج': p.name,
    'الفئة': p.category,
    'الكود الكود': p.code,
    'الباركود': p.barcode,
    'سعر الشراء': p.buyPrice,
    'سعر البيع': p.sellPrice,
    'الربح المتوقع للمنتج الواحد': p.sellPrice - p.buyPrice,
    'الكمية الحالية': p.quantity,
    'الحد الأدنى للمخزون': p.minStock,
    'حالة المخزون': p.quantity === 0 ? 'نفذت الكمية' : p.quantity <= p.minStock ? 'منخفض' : 'متوفر',
    'قيمة المخزون بسعر الشراء': p.quantity * p.buyPrice,
    'قيمة المخزون بسعر البيع': p.quantity * p.sellPrice,
    'المورد': p.supplierName,
    'تاريخ آخر شراء': p.lastPurchaseDate,
  }));
  const wsProducts = XLSX.utils.json_to_sheet(productsData);
  XLSX.utils.book_append_sheet(wb, wsProducts, 'المخزون والمنتجات');

  // 2. Sales Sheet (المبيعات)
  const salesData = data.invoices.flatMap(inv => inv.items.map(item => ({
    'رقم الفاتورة': inv.id,
    'التاريخ': inv.date,
    'الوقت': inv.time,
    'اسم العميل': inv.customerName,
    'رقم الهاتف': inv.customerPhone,
    'اسم المنتج': item.name,
    'الفئة': item.category,
    'الكمية المباعة': item.quantity,
    'سعر الشراء المفرد': item.buyPrice,
    'سعر البيع المفرد': item.sellPrice,
    'الخصم المباشر': item.discount,
    'إجمالي السطر': item.total,
    'إجمالي ربح البند': (item.sellPrice - item.buyPrice - item.discount) * item.quantity,
    'طريقة الدفع': inv.paymentMethod,
    'خصم الفاتورة الكلي': inv.discount,
    'صافي الفاتورة الكلي': inv.grandTotal,
    'الموظف': inv.employee,
    'ملاحظات الفاتورة': inv.notes,
  })));
  const wsSales = XLSX.utils.json_to_sheet(salesData);
  XLSX.utils.book_append_sheet(wb, wsSales, 'المبيعات وحساب الأرباح');

  // 3. Maintenance Sheet (الصيانة)
  const maintenanceData = data.maintenance.map(m => ({
    'رقم الاستلام': m.id,
    'تاريخ الاستلام': m.date,
    'اسم العميل': m.customerName,
    'رقم الهاتف': m.customerPhone,
    'نوع الجهاز': m.deviceType,
    'الموديل': m.deviceModel,
    'IMEI / الرقم التسلسلي': m.imei,
    'العطل المشخص': m.issue,
    'الفني المسؤول': m.technician,
    'تكلفة قطع الغيار': m.sparePartsCost,
    'تكلفة الصيانة (المصنعية)': m.laborCost,
    'إجمالي تكلفة الفاتورة': m.totalCost,
    'المبلغ المدفوع': m.paid,
    'المبلغ المتبقي': m.remaining,
    'موعد التسليم المتوقع': m.deliveryDate,
    'حالة الجهاز الحالية': m.status,
    'أرباح الصيانة الصافية': m.laborCost, // Labor cost is pure service profit
    'ملاحظات': m.notes,
  }));
  const wsMaintenance = XLSX.utils.json_to_sheet(maintenanceData);
  XLSX.utils.book_append_sheet(wb, wsMaintenance, 'أجهزة الصيانة');

  // 4. Customers Sheet (العملاء)
  const customersData = data.customers.map(c => ({
    'اسم العميل': c.name,
    'رقم الهاتف': c.phone,
    'العنوان': c.address,
    'ملاحظات العميل': c.notes,
    'إجمالي المشتريات': c.totalPurchases,
    'إجمالي المدفوع': c.totalPaid,
    'المتبقي في ذمته': c.totalRemaining,
    'حالة المديونية': c.totalRemaining > 0 ? 'عليه مستحقات' : 'خالي من الديون',
  }));
  const wsCustomers = XLSX.utils.json_to_sheet(customersData);
  XLSX.utils.book_append_sheet(wb, wsCustomers, 'حسابات العملاء');

  // 5. Suppliers Sheet (الموردين)
  const suppliersData = data.suppliers.map(s => ({
    'اسم المورد': s.name,
    'رقم الهاتف': s.phone,
    'العنوان': s.address,
    'إجمالي المعاملات': s.totalBalance,
    'إجمالي المدفوع له': s.totalPaid,
    'المتبقي له': s.totalRemaining,
    'حالة الحساب': s.totalRemaining > 0 ? 'له مستحقات' : 'مسدد بالكامل',
  }));
  const wsSuppliers = XLSX.utils.json_to_sheet(suppliersData);
  XLSX.utils.book_append_sheet(wb, wsSuppliers, 'حسابات الموردين');

  // 6. Recharge Sheet (شحن الرصيد)
  const rechargesData = data.recharges.map(r => ({
    'التاريخ': r.date,
    'الوقت': r.time,
    'الشبكة': r.network,
    'رقم الهاتف المشحون له': r.phone,
    'قيمة الشحن': r.amount,
    'أرباح الشحن (العمولة)': r.commission,
    'الموظف': r.employee,
  }));
  const wsRecharges = XLSX.utils.json_to_sheet(rechargesData);
  XLSX.utils.book_append_sheet(wb, wsRecharges, 'شحن الرصيد والعمولات');

  // 7. Cash Logs Sheet (حركة الكاش والدرج)
  const cashData = data.cashLogs.map(c => ({
    'معرف الحركة': c.id,
    'التاريخ': c.date,
    'الوقت': c.time,
    'نوع الحركة': c.type,
    'السبب بالتفصيل': c.reason,
    'المبلغ': c.amount,
    'رصيد الكاش بعد العملية': c.balanceAfter,
  }));
  const wsCash = XLSX.utils.json_to_sheet(cashData);
  XLSX.utils.book_append_sheet(wb, wsCash, 'حركة خزينة الكاش');

  // 8. InstaPay Sheet (إنستا باي)
  const instaData = data.instaPayLogs.map(i => ({
    'التاريخ': i.date,
    'الوقت': i.time,
    'نوع الحركة': i.type,
    'السبب بالتفصيل': i.reason,
    'المبلغ': i.amount,
    'الرصيد بعد العملية': i.balanceAfter,
  }));
  const wsInsta = XLSX.utils.json_to_sheet(instaData);
  XLSX.utils.book_append_sheet(wb, wsInsta, 'حساب إنستا باي الإلكتروني');

  // 9. Expenses Sheet (المصروفات)
  const expensesData = data.expenses.map(e => ({
    'التاريخ': e.date,
    'التصنيف / الفئة': e.category,
    'القيمة': e.amount,
    'السبب / التفاصيل': e.reason,
    'المسجل': e.employee,
  }));
  const wsExpenses = XLSX.utils.json_to_sheet(expensesData);
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'المصروفات والمصاريف العمومية');

  // Write and Save
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `تقرير_برنامج_المحل_الكامل_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
