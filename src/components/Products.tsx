/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Barcode, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Layers,
  ArrowUpRight,
  UserPlus
} from 'lucide-react';
import { Product, Supplier } from '../types';

interface ProductsProps {
  products: Product[];
  suppliers: Supplier[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export default function Products({
  products,
  suppliers,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}: ProductsProps) {
  // Inventory UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('الكل');
  const [stockStatusFilter, setStockStatusFilter] = useState('الكل');

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('إكسسوارات');
  const [code, setCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [buyPrice, setBuyPrice] = useState<number | ''>('');
  const [sellPrice, setSellPrice] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>('');
  const [supplierName, setSupplierName] = useState('');
  const [lastPurchaseDate, setLastPurchaseDate] = useState('');

  // Categories
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ['موبايلات', 'إكسسوارات', 'قطع غيار', 'خدمات', 'أخرى', ...Array.from(list)];
  }, [products]);

  // Inventory Summary stats
  const stats = useMemo(() => {
    const totalItems = products.length;
    const totalCapital = products.reduce((sum, p) => sum + (p.buyPrice * p.quantity), 0);
    const totalRetailValue = products.reduce((sum, p) => sum + (p.sellPrice * p.quantity), 0);
    const outOfStock = products.filter(p => p.quantity === 0).length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length;
    return { totalItems, totalCapital, totalRetailValue, outOfStock, lowStock };
  }, [products]);

  // Filtered Inventory
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.barcode.includes(searchQuery);
      const matchCat = categoryFilter === 'الكل' || p.category === categoryFilter;
      
      let matchStock = true;
      if (stockStatusFilter === 'نفذ') {
        matchStock = p.quantity === 0;
      } else if (stockStatusFilter === 'منخفض') {
        matchStock = p.quantity > 0 && p.quantity <= p.minStock;
      } else if (stockStatusFilter === 'متوفر') {
        matchStock = p.quantity > p.minStock;
      }

      return matchQuery && matchCat && matchStock;
    });
  }, [products, searchQuery, categoryFilter, stockStatusFilter]);

  // Handle open modal for new
  const handleOpenAdd = () => {
    setEditProduct(null);
    setName('');
    setCategory('إكسسوارات');
    setCode('');
    setBarcode('');
    setBuyPrice('');
    setSellPrice('');
    setQuantity('');
    setMinStock(2);
    setSupplierName(suppliers[0]?.name || 'الشروق للتوزيع');
    setLastPurchaseDate(new Date().toISOString().slice(0, 10));
    setShowModal(true);
  };

  // Handle open modal for edit
  const handleOpenEdit = (p: Product) => {
    setEditProduct(p);
    setName(p.name);
    setCategory(p.category);
    setCode(p.code);
    setBarcode(p.barcode);
    setBuyPrice(p.buyPrice);
    setSellPrice(p.sellPrice);
    setQuantity(p.quantity);
    setMinStock(p.minStock);
    setSupplierName(p.supplierName);
    setLastPurchaseDate(p.lastPurchaseDate);
    setShowModal(true);
  };

  // Save/Update Form handler
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || buyPrice === '' || sellPrice === '' || quantity === '') {
      alert('خطأ: الرجاء تعبئة جميع الحقول الإلزامية!');
      return;
    }

    if (sellPrice < buyPrice) {
      if (!window.confirm('ملاحظة: سعر البيع أقل من سعر الشراء! هل تريد الحفظ على أي حال؟')) return;
    }

    const cleanProduct: Product = {
      id: editProduct ? editProduct.id : `prod-${Date.now()}`,
      name,
      category,
      code,
      barcode: barcode || code, // Use code as barcode fallback if empty
      buyPrice: Number(buyPrice),
      sellPrice: Number(sellPrice),
      quantity: Number(quantity),
      minStock: Number(minStock || 0),
      supplierName: supplierName || 'الشروق للتوزيع',
      lastPurchaseDate: lastPurchaseDate || new Date().toISOString().slice(0, 10)
    };

    if (editProduct) {
      onUpdateProduct(cleanProduct);
    } else {
      onAddProduct(cleanProduct);
    }
    setShowModal(false);
  };

  // Quick Refill buttons inline (إعادة تعبئة سريعة للمخزون)
  const adjustQuantityInline = (product: Product, delta: number) => {
    const updated = {
      ...product,
      quantity: Math.max(0, product.quantity + delta),
      lastPurchaseDate: new Date().toISOString().slice(0, 10)
    };
    onUpdateProduct(updated);
  };

  // Delete product with safety warning
  const handleDelete = (p: Product) => {
    if (window.confirm(`هل أنت متأكد من حذف المنتج "${p.name}" نهائياً من السيستم؟`)) {
      onDeleteProduct(p.id);
    }
  };

  return (
    <div className="space-y-6" id="products-view">
      {/* 1. Inventory Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="inventory-summary-bar">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs text-center">
          <span className="text-xs text-slate-400 block font-semibold">إجمالي عدد المنتجات</span>
          <span className="text-xl font-bold text-slate-700 block mt-2 font-mono">{stats.totalItems}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs text-center">
          <span className="text-xs text-slate-400 block font-semibold">رأس المال بالمخزن (تكلفة)</span>
          <span className="text-xl font-bold text-blue-600 block mt-2 font-mono">{stats.totalCapital.toLocaleString('ar-EG')} ج.م.</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs text-center">
          <span className="text-xs text-slate-400 block font-semibold">القيمة البيعية الكلية</span>
          <span className="text-xl font-bold text-emerald-600 block mt-2 font-mono">{stats.totalRetailValue.toLocaleString('ar-EG')} ج.م.</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-50 text-center bg-rose-50/20">
          <span className="text-xs text-rose-500 block font-bold">سلع منتهية الكمية</span>
          <span className="text-xl font-extrabold text-rose-600 block mt-2 font-mono">{stats.outOfStock}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-50 text-center bg-amber-50/20">
          <span className="text-xs text-amber-500 block font-bold">سلع كميتها منخفضة</span>
          <span className="text-xl font-extrabold text-amber-600 block mt-2 font-mono">{stats.lowStock}</span>
        </div>
      </div>

      {/* 2. Control Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-2.5 text-slate-400 w-4.5 h-4.5" />
            <input 
              type="text" 
              placeholder="البحث بالاسم، الكود، الباركود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pr-9 pl-3 py-2 border border-slate-200 rounded-lg"
              id="product-search-bar"
            />
          </div>

          {/* Category Dropdown Filter */}
          <select 
            aria-label="الفئة"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-600 font-medium"
            id="category-filter"
          >
            <option value="الكل">جميع الفئات</option>
            {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>

          {/* Stock Level Dropdown Filter */}
          <select 
            aria-label="حالة المخزون"
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-600 font-medium"
            id="stock-status-filter"
          >
            <option value="الكل">كل الكميات</option>
            <option value="متوفر">متوفر بالكامل</option>
            <option value="منخفض">منخفض ومقارب للنفاد</option>
            <option value="نفذ">نفذت الكمية (صفر)</option>
          </select>
        </div>

        {/* Add Product Trigger Button */}
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
          id="add-new-product-btn"
        >
          <Plus className="w-4 h-4" />
          إضافة منتج جديد للمخزن
        </button>
      </div>

      {/* 3. Products Inventory Grid Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden" id="products-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right divide-y divide-slate-100" id="products-main-table">
            <thead className="bg-slate-50 text-slate-500 font-bold text-xs">
              <tr>
                <th scope="col" className="p-3.5">المنتج والكود</th>
                <th scope="col" className="p-3.5">الفئة</th>
                <th scope="col" className="p-3.5 text-left">سعر الشراء</th>
                <th scope="col" className="p-3.5 text-left">سعر البيع</th>
                <th scope="col" className="p-3.5 text-center">الكمية الحالية</th>
                <th scope="col" className="p-3.5">المورد الرئيسي</th>
                <th scope="col" className="p-3.5 text-center">إعادة تعبئة</th>
                <th scope="col" className="p-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 italic">
                    لا توجد منتجات مسجلة بالمخزن تطابق الفلاتر الحالية.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => {
                  const outOfStock = p.quantity === 0;
                  const lowStock = p.quantity > 0 && p.quantity <= p.minStock;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name / Code / Barcode */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{p.name}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                          <span>كود: {p.code}</span>
                          <span className="text-slate-200">|</span>
                          <span className="flex items-center gap-0.5">
                            <Barcode className="w-3 h-3 text-slate-400" />
                            {p.barcode}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold">
                          {p.category}
                        </span>
                      </td>

                      {/* Buy Price */}
                      <td className="p-3.5 text-left font-semibold font-mono text-slate-600">
                        {p.buyPrice.toLocaleString('ar-EG')} ج.م.
                      </td>

                      {/* Sell Price */}
                      <td className="p-3.5 text-left font-bold font-mono text-blue-600">
                        {p.sellPrice.toLocaleString('ar-EG')} ج.م.
                      </td>

                      {/* Stock Quantity Column */}
                      <td className="p-3.5 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-sm font-extrabold font-mono ${
                            outOfStock 
                              ? 'text-rose-600 underline' 
                              : lowStock 
                                ? 'text-amber-600' 
                                : 'text-slate-800'
                          }`}>
                            {p.quantity} قِطعة
                          </span>
                          
                          {/* Alert Badge */}
                          {outOfStock ? (
                            <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1 py-0.5 rounded mt-1 flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              منفذ تماماً
                            </span>
                          ) : lowStock ? (
                            <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-1 py-0.5 rounded mt-1 flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              شبه منفذ
                            </span>
                          ) : (
                            <span className="text-[9px] font-medium text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded mt-1">
                              متوفر بالمخزن
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="p-3.5 text-xs font-semibold text-slate-500">
                        {p.supplierName}
                      </td>

                      {/* Inline Refill Adjustment */}
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => adjustQuantityInline(p, -1)}
                            className="w-7 h-7 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded flex items-center justify-center transition-colors font-bold cursor-pointer"
                            title="خصم قطعة من المخزن"
                          >
                            -
                          </button>
                          <button 
                            onClick={() => adjustQuantityInline(p, 5)}
                            className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-extrabold font-mono transition-colors cursor-pointer"
                            title="إضافة 5 قطع للمخزن"
                          >
                            +5
                          </button>
                          <button 
                            onClick={() => adjustQuantityInline(p, 1)}
                            className="w-7 h-7 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 rounded flex items-center justify-center transition-colors font-bold cursor-pointer"
                            title="إضافة قطعة واحدة للمخزن"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Edit / Delete Buttons */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="تعديل تفاصيل المنتج"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(p)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="حذف المنتج من المخزن"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Product Modal Sheet form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="product-form-modal">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">
                {editProduct ? 'تعديل بيانات منتج مخزني' : 'إضافة منتج جديد للمستودع والمخزن'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProduct} className="p-5 space-y-4">
              <div className="space-y-1">
                <label htmlFor="product-name-input" className="text-xs font-bold text-slate-500 block">اسم المنتج بالكامل *</label>
                <input 
                  id="product-name-input"
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: شاحن سريع أنكر 20 وات"
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="product-category-select" className="text-xs font-bold text-slate-500 block">فئة وتصنيف المنتج *</label>
                  <select 
                    id="product-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg font-medium text-slate-700"
                  >
                    <option value="موبايلات">📱 موبايلات وهواتف</option>
                    <option value="إكسسوارات">🔌 إكسسوارات وملحقات</option>
                    <option value="قطع غيار">🔧 قطع غيار صيانة</option>
                    <option value="خدمات">⚙️ خدمات تقنية وشحن</option>
                    <option value="أخرى">📦 أخرى</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="product-code-input" className="text-xs font-bold text-slate-500 block">كود الصنف الفريد (كود داخلي) *</label>
                  <input 
                    id="product-code-input"
                    type="text" 
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="مثال: CH-ANKER-20W"
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg text-slate-800 font-mono text-left"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="product-barcode-input" className="text-xs font-bold text-slate-500 block">رقم الباركود (يمكن مسحه بالاسكانر)</label>
                  <input 
                    id="product-barcode-input"
                    type="text" 
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="مثال: 084806123456"
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg text-slate-800 font-mono text-left"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="product-supplier-select" className="text-xs font-bold text-slate-500 block">المورد الافتراضي</label>
                  <select 
                    id="product-supplier-select"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg font-medium text-slate-700"
                  >
                    {suppliers.map((s, i) => (
                      <option key={i} value={s.name}>{s.name}</option>
                    ))}
                    {suppliers.length === 0 && (
                      <>
                        <option value="الشروق للتوزيع">الشروق للتوزيع</option>
                        <option value="الأندلس للتجارة">الأندلس للتجارة</option>
                        <option value="النور كابلز">النور كابلز</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="product-buyprice-input" className="text-xs font-bold text-slate-500 block">سعر الشراء (التكلفة) *</label>
                  <div className="relative">
                    <input 
                      id="product-buyprice-input"
                      type="number" 
                      required
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(Number(e.target.value))}
                      placeholder="0"
                      className="w-full text-xs p-2.5 pl-10 border border-slate-200 bg-slate-50/50 rounded-lg font-mono text-left"
                    />
                    <span className="absolute left-3 top-3 text-[10px] text-slate-400 font-bold">ج.م.</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="product-sellprice-input" className="text-xs font-bold text-slate-500 block">سعر البيع الافتراضي *</label>
                  <div className="relative">
                    <input 
                      id="product-sellprice-input"
                      type="number" 
                      required
                      value={sellPrice}
                      onChange={(e) => setSellPrice(Number(e.target.value))}
                      placeholder="0"
                      className="w-full text-xs p-2.5 pl-10 border border-slate-200 bg-slate-50/50 rounded-lg font-mono text-left"
                    />
                    <span className="absolute left-3 top-3 text-[10px] text-slate-400 font-bold">ج.م.</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="product-qty-input" className="text-xs font-bold text-slate-500 block">الكمية الافتتاحية للمخزن *</label>
                  <input 
                    id="product-qty-input"
                    type="number" 
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    placeholder="0"
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg font-mono text-left"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="product-min-input" className="text-xs font-bold text-slate-500 block">الحد الأدنى لتنبيه نقص المخزون</label>
                  <input 
                    id="product-min-input"
                    type="number" 
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    placeholder="2"
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg font-mono text-left"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  إلغاء الأمر
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  {editProduct ? 'حفظ التحديثات' : 'إدراج الصنف ومزامنة المخزن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
