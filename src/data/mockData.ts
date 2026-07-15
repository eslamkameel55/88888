/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Invoice, Customer, Supplier, MaintenanceTicket, RechargeLog, WalletTransferLog, CashLog, InstaPayLog, Expense, StoreSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'آيفون 13 برو ماكس 256 جيجا رمادي',
    category: 'موبايلات',
    code: 'PH13PM-256',
    barcode: '019425271234',
    buyPrice: 32000,
    sellPrice: 35000,
    quantity: 5,
    minStock: 2,
    supplierName: 'الشروق للتوزيع',
    lastPurchaseDate: '2026-07-10'
  },
  {
    id: 'prod-2',
    name: 'سامسونج جالكسي S23 ألترا 512 جيجا أسود',
    category: 'موبايلات',
    code: 'SGS23U-512',
    barcode: '880609412345',
    buyPrice: 38000,
    sellPrice: 42000,
    quantity: 3,
    minStock: 2,
    supplierName: 'الأندلس للتجارة',
    lastPurchaseDate: '2026-07-08'
  },
  {
    id: 'prod-3',
    name: 'شاحن سريع أنكر 20 وات سلكي',
    category: 'إكسسوارات',
    code: 'CH-ANKER-20W',
    barcode: '084806123456',
    buyPrice: 280,
    sellPrice: 380,
    quantity: 25,
    minStock: 5,
    supplierName: 'النور كابلز',
    lastPurchaseDate: '2026-07-12'
  },
  {
    id: 'prod-4',
    name: 'كابل آيفون شحن سريع تايب سي لايتنينج 1 متر',
    category: 'إكسسوارات',
    code: 'CAB-AP-1M',
    barcode: '019425123456',
    buyPrice: 120,
    sellPrice: 220,
    quantity: 40,
    minStock: 10,
    supplierName: 'النور كابلز',
    lastPurchaseDate: '2026-07-12'
  },
  {
    id: 'prod-5',
    name: 'سماعة بلوتوث لينوفو HT38 بيضاء',
    category: 'إكسسوارات',
    code: 'EAR-LEN-HT38',
    barcode: '692876123456',
    buyPrice: 350,
    sellPrice: 480,
    quantity: 15,
    minStock: 4,
    supplierName: 'الأندلس للتجارة',
    lastPurchaseDate: '2026-07-05'
  },
  {
    id: 'prod-6',
    name: 'شاشة آيفون 11 برو كاملة جودة عالية',
    category: 'قطع غيار',
    code: 'SCR-IP11P',
    barcode: '111122223333',
    buyPrice: 1500,
    sellPrice: 1900,
    quantity: 4,
    minStock: 1,
    supplierName: 'الشروق للتوزيع',
    lastPurchaseDate: '2026-06-28'
  },
  {
    id: 'prod-7',
    name: 'بطارية سامسونج A52 سعة أصلية',
    category: 'قطع غيار',
    code: 'BAT-SAMA52',
    barcode: '222233334444',
    buyPrice: 250,
    sellPrice: 400,
    quantity: 1, // Will trigger alert since it's <= minStock (2)
    minStock: 2,
    supplierName: 'الأندلس للتجارة',
    lastPurchaseDate: '2026-07-01'
  },
  {
    id: 'prod-8',
    name: 'رأس شاحن سامسونج 25 وات شحن فائق السرعة',
    category: 'إكسسوارات',
    code: 'CH-SAM-25W',
    barcode: '880609043210',
    buyPrice: 310,
    sellPrice: 420,
    quantity: 0, // Out of stock!
    minStock: 3,
    supplierName: 'الأندلس للتجارة',
    lastPurchaseDate: '2026-06-15'
  },
  {
    id: 'prod-9',
    name: 'جراب سيلكون مغناطيسي MagSafe آيفون 14 برو ماكس شفاف',
    category: 'جرابات',
    code: 'COV-IP14PM-MAG',
    barcode: '141425000001',
    buyPrice: 70,
    sellPrice: 150,
    quantity: 15,
    minStock: 3,
    supplierName: 'الشروق للتوزيع',
    lastPurchaseDate: '2026-07-13'
  },
  {
    id: 'prod-10',
    name: 'جراب جلد فاخر مقاوم للصدمات سامسونج S24 ألترا أسود',
    category: 'جرابات',
    code: 'COV-S24U-LEA',
    barcode: '242405000002',
    buyPrice: 90,
    sellPrice: 180,
    quantity: 10,
    minStock: 2,
    supplierName: 'الأندلس للتجارة',
    lastPurchaseDate: '2026-07-14'
  },
  {
    id: 'prod-11',
    name: 'جراب حماية بناتي ملون شاومي ريدمي نوت 12',
    category: 'جرابات',
    code: 'COV-XM12-GIRL',
    barcode: '121205000003',
    buyPrice: 40,
    sellPrice: 90,
    quantity: 8,
    minStock: 2,
    supplierName: 'الشروق للتوزيع',
    lastPurchaseDate: '2026-07-12'
  },
  {
    id: 'prod-12',
    name: 'اسكرينة زجاجية 9D آيفون 13/14 مقاومة للكسر',
    category: 'اسكرينات',
    code: 'SCR-IP1314-9D',
    barcode: '131405000004',
    buyPrice: 25,
    sellPrice: 60,
    quantity: 50,
    minStock: 10,
    supplierName: 'النور كابلز',
    lastPurchaseDate: '2026-07-15'
  },
  {
    id: 'prod-13',
    name: 'اسكرينة سيراميك مرنة مطفية ضد اللمس سامسونج A54',
    category: 'اسكرينات',
    code: 'SCR-SMA54-CER',
    barcode: '545405000005',
    buyPrice: 20,
    sellPrice: 50,
    quantity: 30,
    minStock: 8,
    supplierName: 'النور كابلز',
    lastPurchaseDate: '2026-07-15'
  },
  {
    id: 'prod-14',
    name: 'اسكرينة جيلاتين حراري للظهر والشاشة جالكسي S23 ألترا',
    category: 'اسكرينات',
    code: 'SCR-S23U-GEL',
    barcode: '232305000006',
    buyPrice: 35,
    sellPrice: 80,
    quantity: 12,
    minStock: 3,
    supplierName: 'الشروق للتوزيع',
    lastPurchaseDate: '2026-07-11'
  },
  {
    id: 'prod-15',
    name: 'بطارية آيفون 11 أصلية مع شريحة البرمجة',
    category: 'قطع غيار',
    code: 'BAT-IP11-ORG',
    barcode: '110005000007',
    buyPrice: 450,
    sellPrice: 700,
    quantity: 5,
    minStock: 2,
    supplierName: 'الشروق للتوزيع',
    lastPurchaseDate: '2026-07-10'
  },
  {
    id: 'prod-16',
    name: 'بطارية شاومي ريدمي نوت 10 برو سعة 5020 مللي أمبير',
    category: 'قطع غيار',
    code: 'BAT-XM10P-ORG',
    barcode: '100005000008',
    buyPrice: 180,
    sellPrice: 300,
    quantity: 6,
    minStock: 2,
    supplierName: 'الأندلس للتجارة',
    lastPurchaseDate: '2026-07-09'
  },
  {
    id: 'prod-17',
    name: 'رأس شاحن سريع لدنيو LDNIO 65W مع مخارج Type-C & USB',
    category: 'شواحن وبطاريات',
    code: 'CH-LDNIO-65W',
    barcode: '656505000009',
    buyPrice: 420,
    sellPrice: 590,
    quantity: 12,
    minStock: 3,
    supplierName: 'النور كابلز',
    lastPurchaseDate: '2026-07-14'
  },
  {
    id: 'prod-18',
    name: 'شاحن سيارة هوكو مخرجين شحن سريع مع كابل تايب سي',
    category: 'شواحن وبطاريات',
    code: 'CH-HOCO-CAR',
    barcode: '121205000010',
    buyPrice: 130,
    sellPrice: 220,
    quantity: 15,
    minStock: 3,
    supplierName: 'النور كابلز',
    lastPurchaseDate: '2026-07-14'
  },
  {
    id: 'prod-19',
    name: 'باور بنك جوي روم JOYROOM 20000mAh شحن فائق السرعة 22.5W',
    category: 'شواحن وبطاريات',
    code: 'PB-JOY-20K',
    barcode: '202005000011',
    buyPrice: 650,
    sellPrice: 890,
    quantity: 8,
    minStock: 2,
    supplierName: 'الأندلس للتجارة',
    lastPurchaseDate: '2026-07-13'
  },
  {
    id: 'prod-20',
    name: 'سماعة سلكية أصلية آيفون مخرج لايتنينج Apple EarPods',
    category: 'سماعات',
    code: 'EAR-AP-LIG',
    barcode: '191905000012',
    buyPrice: 380,
    sellPrice: 550,
    quantity: 10,
    minStock: 2,
    supplierName: 'الشروق للتوزيع',
    lastPurchaseDate: '2026-07-15'
  },
  {
    id: 'prod-21',
    name: 'سماعة بلوتوث رياضية حول الرقبة لاسلكية شاومي Mi',
    category: 'سماعات',
    code: 'EAR-XM-NECK',
    barcode: '303005000013',
    buyPrice: 220,
    sellPrice: 350,
    quantity: 12,
    minStock: 3,
    supplierName: 'الأندلس للتجارة',
    lastPurchaseDate: '2026-07-12'
  },
  {
    id: 'prod-22',
    name: 'سماعة ايربودز جوي روم Joyroom JR-T03S Pro إلغاء ضوضاء',
    category: 'سماعات',
    code: 'EAR-JOY-T03S',
    barcode: '404005000014',
    buyPrice: 750,
    sellPrice: 1100,
    quantity: 5,
    minStock: 2,
    supplierName: 'الأندلس للتجارة',
    lastPurchaseDate: '2026-07-14'
  },
  {
    id: 'prod-23',
    name: 'فلاش ميموري كينجستون Kingston 64GB USB 3.2 معدنية مقاومة',
    category: 'فلاشات و OTG',
    code: 'FL-KING-64G',
    barcode: '646405000015',
    buyPrice: 140,
    sellPrice: 220,
    quantity: 25,
    minStock: 5,
    supplierName: 'النور كابلز',
    lastPurchaseDate: '2026-07-15'
  },
  {
    id: 'prod-24',
    name: 'فلاشة سانديسك SanDisk Dual Drive 128GB Type-C & USB 3.1',
    category: 'فلاشات و OTG',
    code: 'FL-SAND-128G-C',
    barcode: '128005000016',
    buyPrice: 280,
    sellPrice: 390,
    quantity: 15,
    minStock: 3,
    supplierName: 'النور كابلز',
    lastPurchaseDate: '2026-07-15'
  },
  {
    id: 'prod-25',
    name: 'وصلة OTG معدنية Type-C إلى USB 3.0 عالية السرعة',
    category: 'فلاشات و OTG',
    code: 'OTG-C-METAL',
    barcode: '909005000017',
    buyPrice: 25,
    sellPrice: 50,
    quantity: 40,
    minStock: 10,
    supplierName: 'النور كابلز',
    lastPurchaseDate: '2026-07-15'
  },
  {
    id: 'prod-26',
    name: 'وصلة OTG ميكرو Micro USB للتابلت والهواتف القديمة',
    category: 'فلاشات و OTG',
    code: 'OTG-MICRO-PLUG',
    barcode: '808005000018',
    buyPrice: 15,
    sellPrice: 35,
    quantity: 20,
    minStock: 5,
    supplierName: 'النور كابلز',
    lastPurchaseDate: '2026-07-15'
  },
  {
    id: 'prod-27',
    name: 'ساعة ذكية ريتشارد ميل T800 Ultra شاشة كاملة عالية الدقة',
    category: 'ساعات ذكية',
    code: 'SW-T800-ULTRA',
    barcode: '800005000019',
    buyPrice: 450,
    sellPrice: 650,
    quantity: 15,
    minStock: 3,
    supplierName: 'الشروق للتوزيع',
    lastPurchaseDate: '2026-07-14'
  },
  {
    id: 'prod-28',
    name: 'ساعة ذكية هايلو Haylou Solar Lite مقاومة للماء شاشة دائرية',
    category: 'ساعات ذكية',
    code: 'SW-HAYLOU-LITE',
    barcode: '900005000020',
    buyPrice: 900,
    sellPrice: 1300,
    quantity: 8,
    minStock: 2,
    supplierName: 'الأندلس للتجارة',
    lastPurchaseDate: '2026-07-11'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-1001',
    date: '2026-07-14',
    time: '14:35',
    customerName: 'أحمد محمد علي',
    customerPhone: '01012345678',
    items: [
      {
        productId: 'prod-3',
        name: 'شاحن سريع أنكر 20 وات سلكي',
        category: 'إكسسوارات',
        quantity: 1,
        buyPrice: 280,
        sellPrice: 380,
        discount: 20,
        total: 360
      },
      {
        productId: 'prod-4',
        name: 'كابل آيفون شحن سريع تايب سي لايتنينج 1 متر',
        category: 'إكسسوارات',
        quantity: 2,
        buyPrice: 120,
        sellPrice: 220,
        discount: 0,
        total: 440
      }
    ],
    totalBeforeDiscount: 820,
    discount: 20,
    tax: 0,
    grandTotal: 800,
    paymentMethod: 'نقدي',
    employee: 'عمر',
    notes: 'العميل استلم كابلات باللون الأسود وضمان 6 أشهر على الشاحن.'
  },
  {
    id: 'INV-1002',
    date: '2026-07-15',
    time: '11:20',
    customerName: 'سارة محمود جمال',
    customerPhone: '01234567890',
    items: [
      {
        productId: 'prod-5',
        name: 'سماعة بلوتوث لينوفو HT38 بيضاء',
        category: 'إكسسوارات',
        quantity: 1,
        buyPrice: 350,
        sellPrice: 480,
        discount: 30,
        total: 450
      }
    ],
    totalBeforeDiscount: 480,
    discount: 30,
    tax: 0,
    grandTotal: 450,
    paymentMethod: 'إنستا باي',
    employee: 'خالد',
    notes: 'تم الدفع عن طريق تطبيق إنستا باي وتأكيد استلام المبلغ.'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'أحمد محمد علي',
    phone: '01012345678',
    address: 'شارع الجلاء - المنصورة',
    notes: 'عميل دائم يشتري إكسسوارات وقطع غيار، يفضل الدفع كاش.',
    totalPurchases: 800,
    totalPaid: 800,
    totalRemaining: 0
  },
  {
    id: 'cust-2',
    name: 'سارة محمود جمال',
    phone: '01234567890',
    address: 'حي الجامعة - المنصورة',
    notes: 'مهتمة بالملحقات والسماعات الحديثة، تفضل التحويل الإلكتروني.',
    totalPurchases: 450,
    totalPaid: 450,
    totalRemaining: 0
  },
  {
    id: 'cust-3',
    name: 'محمود عبد الرحمن محمد',
    phone: '01555551234',
    address: 'شارع السكة الجديدة - طنطا',
    notes: 'عميل صيانة أجهزة، لديه متبقي مستحق على إصلاح جهاز شاومي.',
    totalPurchases: 900,
    totalPaid: 600,
    totalRemaining: 300 // Unpaid balance alert
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-1',
    name: 'الشروق للتوزيع',
    phone: '01009988776',
    address: 'العتبة - القاهرة',
    totalBalance: 32000,
    totalPaid: 30000,
    totalRemaining: 2000
  },
  {
    id: 'supp-2',
    name: 'الأندلس للتجارة',
    phone: '01122334455',
    address: 'شارع عبد العزيز - القاهرة',
    totalBalance: 38350,
    totalPaid: 35000,
    totalRemaining: 3350
  },
  {
    id: 'supp-3',
    name: 'النور كابلز',
    phone: '01233445566',
    address: 'باب اللوق - القاهرة',
    totalBalance: 12000,
    totalPaid: 12000,
    totalRemaining: 0
  }
];

export const INITIAL_MAINTENANCE: MaintenanceTicket[] = [
  {
    id: 'MNT-1001',
    date: '2026-07-10',
    customerName: 'محمود عبد الرحمن محمد',
    customerPhone: '01555551234',
    deviceType: 'شاومي',
    deviceModel: 'Redmi Note 11',
    imei: '863456051234567',
    issue: 'تغيير شاشة مكسورة بالكامل ولمس لا يعمل',
    technician: 'م/ أحمد صبري',
    sparePartsCost: 600,
    laborCost: 300,
    totalCost: 900,
    paid: 600,
    remaining: 300,
    deliveryDate: '2026-07-11',
    status: 'تم التسليم',
    notes: 'تم استبدال الشاشة بأخرى درجة أولى وعليها ضمان 30 يوماً من تاريخ الاستلام.'
  },
  {
    id: 'MNT-1002',
    date: '2026-07-12', // Late ticket (current date is 2026-07-15) - should trigger late warning!
    customerName: 'إسلام جميل كمال',
    customerPhone: '01098765432',
    deviceType: 'آيفون',
    deviceModel: 'iPhone 11',
    imei: '354012345678901',
    issue: 'تغيير بطارية وصيانة سماعة المكالمات الداخلية',
    technician: 'م/ أحمد صبري',
    sparePartsCost: 450,
    laborCost: 200,
    totalCost: 650,
    paid: 300,
    remaining: 350,
    deliveryDate: '2026-07-14', // Expected delivery was yesterday or earlier, but still status is 'جاري الإصلاح' -> Delay Alert!
    status: 'جاري الإصلاح',
    notes: 'يجب التأكد من نظافة الفلتر المعدني للسماعة واختبار كفاءة البطارية.'
  },
  {
    id: 'MNT-1003',
    date: '2026-07-15',
    customerName: 'عمر خالد الشريف',
    customerPhone: '01222334455',
    deviceType: 'سامسونج',
    deviceModel: 'Galaxy A52',
    imei: '358912345678902',
    issue: 'منفذ الشحن لا يستجيب للكهرباء أو يقطع الشحن',
    technician: 'م/ خالد حسن',
    sparePartsCost: 100,
    laborCost: 150,
    totalCost: 250,
    paid: 250,
    remaining: 0,
    deliveryDate: '2026-07-15',
    status: 'جاهز',
    notes: 'تم استبدال فلاتة الشحن بالكامل واختبار الشحن السريع بكفاءة عالية.'
  }
];

export const INITIAL_RECHARGE: RechargeLog[] = [
  {
    id: 'REC-1001',
    date: '2026-07-15',
    time: '09:15',
    network: 'فودافون',
    phone: '01011122233',
    amount: 100,
    commission: 5,
    employee: 'عمر'
  },
  {
    id: 'REC-1002',
    date: '2026-07-15',
    time: '10:30',
    network: 'اتصالات',
    phone: '01144455566',
    amount: 50,
    commission: 2.5,
    employee: 'خالد'
  },
  {
    id: 'REC-1003',
    date: '2026-07-15',
    time: '12:45',
    network: 'وي',
    phone: '01522233344',
    amount: 200,
    commission: 10,
    employee: 'عمر'
  }
];

export const INITIAL_CASH_LOGS: CashLog[] = [
  {
    id: 'CSH-1001',
    type: 'دخول كاش',
    reason: 'رصيد افتتاحي للدرج اليومي',
    amount: 5000,
    date: '2026-07-15',
    time: '08:00',
    balanceAfter: 5000
  },
  {
    id: 'CSH-1002',
    type: 'دخول كاش',
    reason: 'تحصيل فاتورة مبيعات نقداً INV-1001',
    amount: 800,
    date: '2026-07-15',
    time: '14:35',
    balanceAfter: 5800
  },
  {
    id: 'CSH-1003',
    type: 'دخول كاش',
    reason: 'تحصيل دفعة صيانة مقدمة MNT-1003',
    amount: 250,
    date: '2026-07-15',
    time: '15:40',
    balanceAfter: 6050
  }
];

export const INITIAL_INSTAPAY_LOGS: InstaPayLog[] = [
  {
    id: 'INS-1001',
    type: 'دخول',
    reason: 'دفعة فاتورة إلكترونية INV-1002',
    amount: 450,
    date: '2026-07-15',
    time: '11:20',
    balanceAfter: 450
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'EXP-1001',
    date: '2026-07-12',
    category: 'إيجار',
    amount: 4000,
    reason: 'إيجار المحل الشهري لشهر يوليو ٢٠٢٦',
    employee: 'المدير'
  },
  {
    id: 'EXP-1002',
    date: '2026-07-15',
    category: 'بوفيه',
    amount: 80,
    reason: 'شراء شاي وسكر وبن ومشروبات ضيافة للمحل',
    employee: 'خالد'
  }
];

export const INITIAL_WALLET_TRANSFERS: WalletTransferLog[] = [
  {
    id: 'TRF-1001',
    date: '2026-07-15',
    time: '10:00',
    type: 'إيداع',
    walletType: 'فودافون كاش',
    phone: '01012345678',
    amount: 1000,
    fee: 10,
    commission: 8,
    employee: 'عمر',
    notes: 'إيداع رصيد بمحفظة العميل محمود واستلام المبلغ كاش'
  },
  {
    id: 'TRF-1002',
    date: '2026-07-15',
    time: '11:45',
    type: 'سحب',
    walletType: 'اتصالات كاش',
    phone: '01198765432',
    amount: 500,
    fee: 5,
    commission: 5,
    employee: 'خالد',
    notes: 'سحب العميل من محفظته للشركة وتسليمه نقدية باليد'
  }
];

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'رينج فون لخدمات المحمول والصيانة',
  phone: '01002003004 / 050221144',
  address: 'المنصورة - شارع الجمهورية - أمام فرع بنك مصر الرئيسي',
  logoUrl: '',
  taxNumber: '123-456-789',
  receiptFooter: 'شكراً لزيارتكم وثقتكم بنا! البضاعة المباعة ترد أو تستبدل خلال 14 يوماً من تاريخ الفاتورة مع ضرورة إحضار أصل الفاتورة وأن تكون البضاعة بحالتها الأصلية دون خدش أو تلف.'
};
