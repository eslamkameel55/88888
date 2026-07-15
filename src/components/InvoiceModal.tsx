/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Printer, X, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { Invoice, MaintenanceTicket, StoreSettings } from '../types';

interface InvoiceModalProps {
  type: 'sale' | 'mnt-intake' | 'mnt-delivery';
  invoiceData?: Invoice;
  ticketData?: MaintenanceTicket;
  settings: StoreSettings;
  onClose: () => void;
}

export default function InvoiceModal({
  type,
  invoiceData,
  ticketData,
  settings,
  onClose
}: InvoiceModalProps) {
  
  // Trigger printing
  const handlePrint = () => {
    window.print();
  };

  // Simulated QR Code SVG for premium appearance (represents Invoice/Ticket Metadata)
  const SimulatedQRCode = () => (
    <div className="flex flex-col items-center justify-center space-y-1.5 p-2 border border-slate-200 bg-white rounded-lg w-24 h-24 mx-auto shadow-xs">
      <QrCode className="w-16 h-16 text-slate-800" />
      <span className="text-[8px] text-slate-400 font-bold font-mono">RING-PHONE-POS</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print" id="print-receipt-modal">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Controller Toolbar */}
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between no-print">
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Printer className="w-4.5 h-4.5 text-blue-500" />
            معاينة وطباعة الفاتورة والإيصال
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              id="modal-print-trigger-btn"
            >
              طباعة الآن
            </button>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE AREA (Will be isolated via print media queries) */}
        <div className="p-6 overflow-y-auto print-card flex-1 bg-white text-slate-800" id="receipt-printable-content">
          <div className="space-y-6 max-w-sm mx-auto text-center" style={{ direction: 'rtl' }}>
            
            {/* 1. Shop Header */}
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{settings.storeName}</h2>
              <p className="text-[10px] text-slate-500 font-bold">{settings.address}</p>
              <p className="text-[10px] text-slate-500 font-mono font-bold">هاتف: {settings.phone}</p>
              {settings.taxNumber && (
                <p className="text-[9px] text-slate-400 font-mono">الرقم الضريبي: {settings.taxNumber}</p>
              )}
            </div>

            {/* 2. Specific Layout Formats */}

            {/* TYPE A: Sales POS Invoice */}
            {type === 'sale' && invoiceData && (
              <div className="space-y-4">
                {/* Meta details */}
                <div className="text-right text-[10px] text-slate-500 font-medium grid grid-cols-2 gap-y-1 bg-slate-50 p-2 rounded-lg font-mono">
                  <div>رقم الفاتورة: <span className="font-bold text-slate-800">{invoiceData.id}</span></div>
                  <div className="text-left">التاريخ: <span className="font-bold text-slate-800">{invoiceData.date}</span></div>
                  <div>الموظف البائع: <span className="font-bold text-slate-800">{invoiceData.employee}</span></div>
                  <div className="text-left">الوقت: <span className="font-bold text-slate-800">{invoiceData.time}</span></div>
                  <div className="col-span-2 border-t border-slate-200/50 pt-1 mt-1 font-sans">
                    العميل المرتبط: <span className="font-bold text-slate-800">{invoiceData.customerName}</span> {invoiceData.customerPhone && <span className="font-mono font-bold text-slate-500">({invoiceData.customerPhone})</span>}
                  </div>
                </div>

                {/* Products Table list */}
                <div className="space-y-1.5 text-right">
                  <div className="grid grid-cols-12 font-bold text-[10px] text-slate-500 border-b border-slate-200 pb-1.5">
                    <div className="col-span-6">الصنف</div>
                    <div className="col-span-2 text-center">الكمية</div>
                    <div className="col-span-2 text-left">السعر</div>
                    <div className="col-span-2 text-left">الصافي</div>
                  </div>
                  <div className="divide-y divide-slate-100 text-[10px] text-slate-700">
                    {invoiceData.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 py-1.5 items-center">
                        <div className="col-span-6 font-semibold truncate leading-tight">
                          {item.name}
                          {item.discount > 0 && (
                            <span className="text-[8px] text-rose-500 block">خصم بند: -{item.discount} ج.م.</span>
                          )}
                        </div>
                        <div className="col-span-2 text-center font-mono font-bold">{item.quantity}</div>
                        <div className="col-span-2 text-left font-mono">{item.sellPrice}</div>
                        <div className="col-span-2 text-left font-mono font-bold">{item.total}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtotals & Taxes */}
                <div className="border-t border-dashed border-slate-300 pt-3 space-y-1.5 text-xs font-mono text-slate-600">
                  <div className="flex justify-between text-[10px]">
                    <span>إجمالي بنود السلع:</span>
                    <span>{invoiceData.totalBeforeDiscount + invoiceData.items.reduce((s,i) => s + (i.discount * i.quantity), 0)} ج.م.</span>
                  </div>
                  {invoiceData.items.reduce((s,i) => s + (i.discount * i.quantity), 0) > 0 && (
                    <div className="flex justify-between text-[10px] text-rose-600">
                      <span>إجمالي خصومات السلع:</span>
                      <span>-{invoiceData.items.reduce((s,i) => s + (i.discount * i.quantity), 0)} ج.م.</span>
                    </div>
                  )}
                  {invoiceData.discount > 0 && (
                    <div className="flex justify-between text-[10px] text-rose-600">
                      <span>الخصم الإضافي على الفاتورة:</span>
                      <span>-{invoiceData.discount} ج.م.</span>
                    </div>
                  )}
                  {invoiceData.tax > 0 && (
                    <div className="flex justify-between text-[10px]">
                      <span>الضريبة المضافة:</span>
                      <span>+{invoiceData.tax} ج.م.</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-200 pt-2 font-sans">
                    <span>الصافي النهائي الفاتورة:</span>
                    <span className="font-mono text-blue-600">{invoiceData.grandTotal} ج.م.</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-sans">
                    <span>طريقة الدفع والتسوية:</span>
                    <span className="font-bold text-slate-600">{invoiceData.paymentMethod === 'نقدي' ? '💵 نقدي (كاش)' : '⚡ إنستا باي (رقمي)'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TYPE B: Maintenance Intake Ticket (إيصال استلام صيانة) */}
            {type === 'mnt-intake' && ticketData && (
              <div className="space-y-4">
                {/* Identification Banner */}
                <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-lg text-blue-800 text-xs font-bold text-center">
                  <span>إيصال استلام هاتف لإجراء الصيانة</span>
                </div>

                {/* Ticket metadata */}
                <div className="text-right text-[10px] text-slate-500 grid grid-cols-2 gap-y-1 bg-slate-50 p-2 rounded-lg font-mono">
                  <div>تذكرة استلام: <span className="font-bold text-slate-800">{ticketData.id}</span></div>
                  <div className="text-left">تاريخ الاستلام: <span className="font-bold text-slate-800">{ticketData.date}</span></div>
                  <div>الفني المعين: <span className="font-bold text-slate-800">{ticketData.technician}</span></div>
                  <div className="text-left">موعد التسليم المتوقع: <span className="font-bold text-slate-800 text-rose-600">{ticketData.deliveryDate}</span></div>
                </div>

                {/* Customer and device details */}
                <div className="text-right space-y-1.5 text-xs border-b border-dashed border-slate-200 pb-3">
                  <div>العميل: <span className="font-bold text-slate-800">{ticketData.customerName}</span></div>
                  {ticketData.customerPhone && (
                    <div>الهاتف: <span className="font-mono font-bold text-slate-500">{ticketData.customerPhone}</span></div>
                  )}
                  <div className="border-t border-slate-100 pt-1.5 mt-1.5">
                    الجهاز المستلم: <span className="font-bold text-slate-900">{ticketData.deviceType} {ticketData.deviceModel}</span>
                  </div>
                  {ticketData.imei && (
                    <div className="font-mono text-[10px] text-slate-400">IMEI: {ticketData.imei}</div>
                  )}
                  <div className="text-rose-600 mt-2">
                    العطل المشخص: <span className="font-semibold underline">{ticketData.issue}</span>
                  </div>
                  {ticketData.notes && (
                    <div className="text-[10px] text-slate-500 italic mt-1 bg-slate-50 p-1.5 rounded">
                      حالة الجهاز والملاحظات: {ticketData.notes}
                    </div>
                  )}
                </div>

                {/* Financial overview */}
                <div className="space-y-1.5 text-xs font-mono text-slate-600">
                  <div className="flex justify-between">
                    <span>التكلفة التقديرية للصيانة:</span>
                    <span>{ticketData.totalCost} ج.م.</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>المبلغ المدفوع مقدماً (العربون):</span>
                    <span>{ticketData.paid} ج.م.</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2">
                    <span>المتبقي عند الاستلام:</span>
                    <span>{ticketData.remaining} ج.م.</span>
                  </div>
                </div>

                {/* Legal intake clause */}
                <div className="text-[8px] text-slate-400 text-justify leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                  * تنبيهات الصيانة: الرجاء إحضار هذا الإيصال عند الاستلام. المحل غير مسؤول عن الأجهزة المتروكة أكثر من 30 يوماً من تاريخ الاستلام المتوقع. ضمان الصيانة يسري فقط على الجزء الذي تم إصلاحه ولا يشمل أي أعطال أخرى تظهر لاحقاً.
                </div>
              </div>
            )}

            {/* TYPE C: Maintenance Delivery Ticket (إيصال تسليم صيانة وضمان) */}
            {type === 'mnt-delivery' && ticketData && (
              <div className="space-y-4">
                {/* Identification Banner */}
                <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>إيصال تسليم صيانة وشهادة الضمان</span>
                </div>

                {/* Ticket metadata */}
                <div className="text-right text-[10px] text-slate-500 grid grid-cols-2 gap-y-1 bg-slate-50 p-2 rounded-lg font-mono">
                  <div>رقم التذكرة: <span className="font-bold text-slate-800">{ticketData.id}</span></div>
                  <div className="text-left">تاريخ التسليم: <span className="font-bold text-slate-800">{new Date().toISOString().slice(0, 10)}</span></div>
                  <div>الفني القائم بالإصلاح: <span className="font-bold text-slate-800">{ticketData.technician}</span></div>
                  <div className="text-left">حالة الإصلاح: <span className="font-extrabold text-emerald-600">تم الإصلاح بنجاح</span></div>
                </div>

                {/* Customer and device details */}
                <div className="text-right space-y-1.5 text-xs border-b border-dashed border-slate-200 pb-3">
                  <div>العميل المستلم: <span className="font-bold text-slate-800">{ticketData.customerName}</span></div>
                  <div>الجهاز المسلّم: <span className="font-bold text-slate-900">{ticketData.deviceType} {ticketData.deviceModel}</span></div>
                  <div className="text-slate-500">العطل الذي تم علاجه: <span className="font-semibold">{ticketData.issue}</span></div>
                </div>

                {/* Costings details table */}
                <div className="space-y-1 text-xs font-mono text-slate-600">
                  <div className="flex justify-between">
                    <span>تكلفة المكونات وقطع الغيار:</span>
                    <span>{ticketData.sparePartsCost} ج.م.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>أجور ومصنعية الورشة:</span>
                    <span>{ticketData.laborCost} ج.م.</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2 text-sm">
                    <span>إجمالي تكلفة الفاتورة:</span>
                    <span>{ticketData.totalCost} ج.م.</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>إجمالي المبلغ المستلم والمسدد:</span>
                    <span>{ticketData.totalCost} ج.م.</span>
                  </div>
                </div>

                {/* Technical Warranty Shield stamp */}
                <div className="border border-dashed border-emerald-200 bg-emerald-50/10 p-3 rounded-lg text-center space-y-1 text-emerald-800">
                  <span className="text-[10px] font-bold block uppercase">🛡️ شهادة ضمان الصيانة المعتمدة</span>
                  <span className="text-[9px] block">يضمن المحل القطعة المستبدلة وعمل الصيانة لمدة <span className="font-bold underline">٣٠ يوماً</span> كاملة ضد عيوب الصناعة من تاريخ التسليم.</span>
                </div>
              </div>
            )}

            {/* 3. QR Code & Footer Terms */}
            <div className="space-y-4 pt-4 border-t border-dashed border-slate-300">
              <SimulatedQRCode />
              
              <div className="text-[8px] text-slate-400 text-center leading-relaxed">
                {settings.receiptFooter}
              </div>
              
              <p className="text-[8px] text-slate-400 font-bold font-mono">نظام إدارة المحال الذكي - رينج فون POS</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
