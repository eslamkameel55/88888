/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  Barcode, 
  User, 
  DollarSign, 
  Tag, 
  FileText, 
  Printer, 
  AlertCircle,
  RefreshCw,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Product, Invoice, SaleItem, Customer } from '../types';

interface CashierSalesProps {
  products: Product[];
  invoices: Invoice[];
  customers: Customer[];
  onSaveInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onPrintInvoice: (invoice: Invoice) => void;
  onUpdateProductsQuantity: (items: SaleItem[], isRefund: boolean) => void;
}

export default function CashierSales({
  products,
  invoices,
  customers,
  onSaveInvoice,
  onDeleteInvoice,
  onPrintInvoice,
  onUpdateProductsQuantity
}: CashierSalesProps) {
  // POS States
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  
  // Checkout States
  const [customerSearch, setCustomerSearch] = useState('');
  const [linkedCustomerName, setLinkedCustomerName] = useState('زبون عام');
  const [linkedCustomerPhone, setLinkedCustomerPhone] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0); // e.g. 0% by default, customizable
  const [paymentMethod, setPaymentMethod] = useState<'نقدي' | 'إنستا باي'>('نقدي');
  const [employee, setEmployee] = useState('المدير');
  const [invoiceNotes, setInvoiceNotes] = useState('');

  // Barcode input focus helper
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Focus barcode input on load
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Distinct categories
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ['الكل', ...Array.from(list)];
  }, [products]);

  // Filtered products catalog
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'الكل' || p.category === selectedCategory;
      const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.barcode.includes(searchQuery);
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // 1. Add to cart
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.productId === product.id);
      if (existing) {
        // Warning if exceeding stock
        if (existing.quantity >= product.quantity) {
          alert(`تنبيه: الكمية المطلوبة تزيد عن المتوفر بالمخزون (${product.quantity})!`);
        }
        return prevCart.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.sellPrice - item.discount) * (item.quantity + 1) }
            : item
        );
      } else {
        if (product.quantity <= 0) {
          const proceed = window.confirm('تنبيه: هذا المنتج نافد من المخزون. هل تريد إضافته للبيع على أي حال؟');
          if (!proceed) return prevCart;
        }
        return [
          ...prevCart,
          {
            productId: product.id,
            name: product.name,
            category: product.category,
            quantity: 1,
            buyPrice: product.buyPrice,
            sellPrice: product.sellPrice,
            discount: 0,
            total: product.sellPrice
          }
        ];
      }
    });
  };

  // Barcode enter handler (simulating scanner sweep)
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;

    const matchedProduct = products.find(p => p.barcode === barcodeQuery.trim() || p.code === barcodeQuery.trim());
    if (matchedProduct) {
      addToCart(matchedProduct);
      setBarcodeQuery('');
    } else {
      alert(`عذراً، لم يتم العثور على أي منتج يطابق الباركود أو الكود: ${barcodeQuery}`);
      setBarcodeQuery('');
    }
  };

  // Adjust Cart line item
  const updateCartItemQuantity = (productId: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.productId === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return {
            ...item,
            quantity: newQty,
            total: (item.sellPrice - item.discount) * newQty
          };
        }
        return item;
      });
    });
  };

  const updateCartItemDiscount = (productId: string, discount: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.productId === productId) {
          const cleanDiscount = Math.max(0, Math.min(item.sellPrice, discount));
          return {
            ...item,
            discount: cleanDiscount,
            total: (item.sellPrice - cleanDiscount) * item.quantity
          };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  // Totals calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.sellPrice * item.quantity), 0);
  }, [cart]);

  const cartTotalItemDiscounts = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.discount * item.quantity), 0);
  }, [cart]);

  const totalBeforeGlobalDiscount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  }, [cart]);

  const grandTotal = useMemo(() => {
    const afterDiscount = Math.max(0, totalBeforeGlobalDiscount - discountAmount);
    const taxValue = afterDiscount * (taxRate / 100);
    return Math.round(afterDiscount + taxValue);
  }, [totalBeforeGlobalDiscount, discountAmount, taxRate]);

  // Fast customer link
  const handleCustomerSelect = (customer: Customer) => {
    setLinkedCustomerName(customer.name);
    setLinkedCustomerPhone(customer.phone);
    setCustomerSearch('');
  };

  // Clear Cart
  const handleNewInvoice = () => {
    if (cart.length > 0) {
      if (!window.confirm('هل تريد مسح السلة وبدء فاتورة جديدة؟')) return;
    }
    setCart([]);
    setLinkedCustomerName('زبون عام');
    setLinkedCustomerPhone('');
    setDiscountAmount(0);
    setTaxRate(0);
    setInvoiceNotes('');
    setPaymentMethod('نقدي');
  };

  // Complete & Save Invoice
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('خطأ: سلة المشتريات فارغة!');
      return;
    }

    const nextInvoiceId = `INV-${1001 + invoices.length}`;
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const formattedTime = today.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false });

    const newInvoice: Invoice = {
      id: nextInvoiceId,
      date: formattedDate,
      time: formattedTime,
      customerName: linkedCustomerName,
      customerPhone: linkedCustomerPhone,
      items: cart,
      totalBeforeDiscount: totalBeforeGlobalDiscount,
      discount: discountAmount,
      tax: Math.round(totalBeforeGlobalDiscount * (taxRate / 100)),
      grandTotal: grandTotal,
      paymentMethod: paymentMethod,
      employee: employee,
      notes: invoiceNotes
    };

    // Save
    onSaveInvoice(newInvoice);

    // Prompt to print immediately
    onPrintInvoice(newInvoice);

    // Clear cart
    setCart([]);
    setLinkedCustomerName('زبون عام');
    setLinkedCustomerPhone('');
    setDiscountAmount(0);
    setTaxRate(0);
    setInvoiceNotes('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="cashier-pos-container">
      {/* LEFT COLUMN: Shopping Cart & Checkout Form (Span 5) */}
      <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between min-h-[620px]" id="pos-checkout-section">
        <div className="space-y-4">
          {/* Cart Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="text-blue-500 w-5 h-5" />
              سلة مبيعات الكاشير
            </h2>
            <button 
              onClick={handleNewInvoice}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2.5 py-1 rounded transition-colors cursor-pointer"
            >
              فاتورة جديدة
            </button>
          </div>

          {/* Cart Items Area */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 no-scrollbar min-h-48 flex flex-col" id="cart-items-list">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10 text-center">
                <Barcode className="w-10 h-10 text-slate-300 stroke-1 mb-2 animate-pulse" />
                <span className="text-sm">سلة المشتريات فارغة حالياً</span>
                <span className="text-xs text-slate-300 mt-1">امسح باركود أو اختر منتجاً من اليسار لإضافته</span>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100/80 flex items-start justify-between gap-2 text-sm">
                  <div className="space-y-1 flex-1">
                    <span className="font-semibold text-slate-800 block line-clamp-1">{item.name}</span>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="font-mono">{item.sellPrice} ج.م.</span>
                      <span className="bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-600 text-[10px]">{item.category}</span>
                    </div>
                  </div>

                  {/* Quantity Controls & Line Item Discount */}
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => updateCartItemQuantity(item.productId, -1)}
                        className="w-6 h-6 bg-white border border-slate-200 rounded flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <span className="w-8 text-center font-bold font-mono text-slate-800">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartItemQuantity(item.productId, 1)}
                        className="w-6 h-6 bg-white border border-slate-200 rounded flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-500" />
                      <input 
                        type="number" 
                        placeholder="خصم"
                        value={item.discount || ''}
                        onChange={(e) => updateCartItemDiscount(item.productId, Number(e.target.value))}
                        className="w-14 text-center text-xs p-0.5 border border-slate-200 rounded font-mono"
                      />
                      <button 
                        onClick={() => removeFromCart(item.productId)}
                        className="text-slate-400 hover:text-rose-500 p-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Net line price */}
                  <div className="text-right pl-1 shrink-0 font-semibold text-slate-800 font-mono self-center">
                    {item.total} ج.م.
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Linked Customer Section */}
          <div className="border-t border-slate-100 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">بيانات العميل المرتبط:</span>
              <span className="text-xs font-bold text-blue-600 font-mono">{linkedCustomerName}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="اسم العميل..."
                  value={linkedCustomerName === 'زبون عام' ? '' : linkedCustomerName}
                  onChange={(e) => setLinkedCustomerName(e.target.value || 'زبون عام')}
                  className="w-full text-xs p-2 border border-slate-200 rounded"
                />
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="رقم الهاتف..."
                  value={linkedCustomerPhone}
                  onChange={(e) => setLinkedCustomerPhone(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded font-mono"
                />
              </div>
            </div>

            {/* Existing Customers Quick Dropdown Search */}
            <div className="relative">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2 py-1">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="بحث سريع برقم أو اسم عميل مسجل..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full text-xs bg-transparent border-none p-0 focus:ring-0"
                />
              </div>
              {customerSearch && (
                <div className="absolute right-0 left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-36 overflow-y-auto text-xs divide-y divide-slate-100">
                  {customers
                    .filter(c => c.name.includes(customerSearch) || c.phone.includes(customerSearch))
                    .map((c, i) => (
                      <button 
                        key={i}
                        onClick={() => handleCustomerSelect(c)}
                        className="w-full text-right p-2 hover:bg-blue-50 font-medium text-slate-700 flex justify-between cursor-pointer"
                      >
                        <span>{c.name}</span>
                        <span className="font-mono text-slate-400">{c.phone}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Invoice Totals Calculator */}
          <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-sm border border-slate-100">
            <div className="flex justify-between text-slate-500">
              <span>إجمالي السلع:</span>
              <span className="font-mono">{cartSubtotal} ج.م.</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>خصومات البنود الفردية:</span>
              <span className="font-mono text-rose-500">-{cartTotalItemDiscounts} ج.م.</span>
            </div>
            <div className="flex justify-between text-slate-500 items-center">
              <span>خصم إضافي على الفاتورة:</span>
              <div className="relative flex items-center gap-1">
                <input 
                  type="number" 
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                  className="w-16 p-1 border border-slate-300 rounded text-center font-mono text-xs"
                />
                <span className="text-xs text-slate-400">ج.م.</span>
              </div>
            </div>
            <div className="flex justify-between text-slate-500 items-center">
              <span>نسبة ضريبية مضافة:</span>
              <div className="relative flex items-center gap-1">
                <input 
                  type="number" 
                  value={taxRate || ''}
                  onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                  className="w-16 p-1 border border-slate-300 rounded text-center font-mono text-xs"
                />
                <span className="text-xs text-slate-400">%</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-slate-800 text-base pt-2 border-t border-slate-200">
              <span>الصافي النهائي الفاتورة:</span>
              <span className="font-mono text-blue-600 text-lg">{grandTotal} ج.م.</span>
            </div>
          </div>

          {/* Payment & Employee */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label htmlFor="pay-method-select" className="font-bold text-slate-500">طريقة الدفع:</label>
              <select 
                id="pay-method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'نقدي' | 'إنستا باي')}
                className="w-full p-2 border border-slate-200 bg-white rounded font-medium text-slate-700"
              >
                <option value="نقدي">💵 نقدي (كاش للدرج)</option>
                <option value="إنستا باي">⚡ إنستا باي (رقمي)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="employee-select" className="font-bold text-slate-500">الموظف البائع:</label>
              <select 
                id="employee-select"
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                className="w-full p-2 border border-slate-200 bg-white rounded font-medium text-slate-700"
              >
                <option value="المدير">المدير المسؤول</option>
                <option value="عمر">عمر (الكاشير)</option>
                <option value="خالد">خالد (فني صيانة)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <input 
              type="text" 
              placeholder="كتابة أي ملاحظات على الفاتورة..."
              value={invoiceNotes}
              onChange={(e) => setInvoiceNotes(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded"
            />
          </div>
        </div>

        {/* Checkout Trigger */}
        <button 
          onClick={handleCheckout}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm text-sm"
          id="checkout-btn"
        >
          <Printer className="w-4.5 h-4.5" />
          حفظ الفاتورة وطباعة الإيصال
        </button>
      </div>

      {/* RIGHT COLUMN: Product Catalog, Quick Categories, Barcode Scanner Simulation (Span 7) */}
      <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col gap-4" id="pos-catalog-section">
        
        {/* Top Scanner & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Barcode Quick Scan form */}
          <form onSubmit={handleBarcodeSubmit} className="md:col-span-5 relative">
            <div className="absolute right-3 top-2.5 text-slate-400">
              <Barcode className="w-5 h-5" />
            </div>
            <input 
              ref={barcodeInputRef}
              type="text"
              placeholder="محاكاة الباركود / الكود واضغط Enter..."
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              className="w-full text-xs pr-10 pl-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 font-mono"
              id="barcode-input"
            />
          </form>

          {/* Normal Search */}
          <div className="md:col-span-7 relative">
            <div className="absolute right-3 top-2.5 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text"
              placeholder="البحث عن منتج بالاسم، الكود، أو الباركود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pr-10 pl-3 py-2.5 border border-slate-200 rounded-lg"
              id="catalog-search"
            />
          </div>
        </div>

        {/* Categories Pills Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar" id="catalog-categories-row">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Grid Area */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[550px] pr-1" id="products-catalog-grid">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto stroke-1 mb-2" />
              <span>لم يتم العثور على أي منتج يطابق خيارات البحث الحالية.</span>
            </div>
          ) : (
            filteredProducts.map((p, idx) => {
              const outOfStock = p.quantity <= 0;
              const lowStock = p.quantity <= p.minStock && !outOfStock;
              
              return (
                <button
                  key={idx}
                  onClick={() => addToCart(p)}
                  className={`p-3 rounded-xl border border-slate-200/80 hover:border-blue-500 hover:shadow-md transition-all text-right flex flex-col justify-between h-36 bg-white cursor-pointer relative group`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      {/* Category Label */}
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                        {p.category}
                      </span>
                      {/* Quantity alert tag */}
                      {outOfStock ? (
                        <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                          منتهي
                        </span>
                      ) : lowStock ? (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          {p.quantity} قِطع
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-slate-500 font-mono">
                          {p.quantity} متوفر
                        </span>
                      )}
                    </div>
                    {/* Name */}
                    <span className="font-bold text-slate-800 text-xs line-clamp-2 mt-1 group-hover:text-blue-600 transition-colors">
                      {p.name}
                    </span>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-end justify-between mt-2">
                    <span className="text-[9px] text-slate-400 font-mono">
                      كود: {p.code}
                    </span>
                    <span className="font-mono font-bold text-sm text-blue-600">
                      {p.sellPrice} ج.م.
                    </span>
                  </div>

                  {/* Hover visual cue */}
                  <div className="absolute inset-0 bg-blue-50/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              );
            })
          )}
        </div>

        {/* Recent Invoices History Section */}
        <div className="border-t border-slate-100 pt-4" id="recent-invoices-section">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-3">
            <Clock className="w-4.5 h-4.5 text-slate-500" />
            سجل آخر الفواتير المحفوظة اليوم
          </h3>

          <div className="border border-slate-200/60 rounded-lg overflow-hidden text-xs" id="recent-invoices-table">
            <div className="grid grid-cols-12 bg-slate-50 p-2.5 font-bold text-slate-500 border-b border-slate-200">
              <div className="col-span-2">الفاتورة</div>
              <div className="col-span-3">العميل</div>
              <div className="col-span-2">طريقة الدفع</div>
              <div className="col-span-2 text-left">الصافي</div>
              <div className="col-span-3 text-center">الإجراءات</div>
            </div>
            <div className="divide-y divide-slate-100 bg-white max-h-40 overflow-y-auto no-scrollbar">
              {invoices.length === 0 ? (
                <div className="p-4 text-center text-slate-400 italic">لا توجد فواتير تم إصدارها اليوم بعد.</div>
              ) : (
                [...invoices].reverse().slice(0, 5).map((inv, idx) => (
                  <div key={idx} className="grid grid-cols-12 p-2.5 items-center text-slate-700 hover:bg-slate-50">
                    <div className="col-span-2 font-mono font-bold text-blue-600">{inv.id}</div>
                    <div className="col-span-3 font-semibold truncate">{inv.customerName}</div>
                    <div className="col-span-2 text-slate-500">{inv.paymentMethod}</div>
                    <div className="col-span-2 text-left font-bold font-mono text-slate-800">{inv.grandTotal} ج.م.</div>
                    <div className="col-span-3 flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => onPrintInvoice(inv)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="إعادة طباعة الفاتورة"
                      >
                        <Printer className="w-3 h-3" />
                        طباعة
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف وإلغاء الفاتورة ${inv.id}؟ سيتم إرجاع البضائع للمخزون تلقائياً.`)) {
                            onDeleteInvoice(inv.id);
                          }
                        }}
                        className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-2 py-1 rounded font-bold transition-all cursor-pointer"
                        title="إلغاء وحذف الفاتورة"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
