import {
  EstimatorOption,
  EstimatorPricingConfig,
  OrderStage,
  ProfileCategory,
  WorkshopTool,
} from '../types.ts';

export const FACEBOOK_PAGE_ID = '61596916040640';
export const FACEBOOK_PAGE_URL = 'https://www.facebook.com/profile.php?id=61596916040640';

export const PROFILE_TYPES: { id: ProfileCategory; label: string }[] = [
  { id: 'aluminum', label: 'ألومنيوم' },
  { id: 'upvc', label: 'UPVC' },
];

export interface ProfileSystemOption {
  id: string;
  name: string;
  origin: string;
  summary: string;
}

export const UPVC_PROFILE_SYSTEMS: ProfileSystemOption[] = [
  {
    id: 'wintech',
    name: 'وينتك (Wintech)',
    origin: 'تركي',
    summary: 'متعدد الغرف بعزل حراري وصوتي ممتاز للأنظمة الجرار والمفصلية',
  },
  {
    id: 'pimapen',
    name: 'بيمابن (Pimapen)',
    origin: 'تركي',
    summary: 'لحام حراري محكم ومقاومة عالية للعوامل الجوية والأتربة',
  },
  {
    id: 'kompen',
    name: 'كومبين (Kompen)',
    origin: 'تركي',
    summary: 'قطاع عملي متوازن للغرف والواجهات السكنية والتجارية',
  },
  {
    id: 'egepen',
    name: 'إيجيبن (Egepen)',
    origin: 'تركي · مجموعة ديكونينك',
    summary: 'ثبات عالٍ مع تدعيم صلب مجلفن وزجاج دبل جلاس',
  },
  {
    id: 'adopen',
    name: 'أدوبن (Adopen)',
    origin: 'تركي',
    summary: 'خيار اقتصادي موثوق لعزل الضوضاء والأمطار',
  },
  {
    id: 'deceuninck',
    name: 'ديكونينك (Deceuninck)',
    origin: 'بلجيكي / أوروبي',
    summary: 'عزل حراري وصوتي فائق بتصميم أوروبي للفتحات الواسعة',
  },
  {
    id: 'rehau',
    name: 'ريهاو (Rehau)',
    origin: 'ألماني',
    summary: 'قطاع ألماني فاخر متعدد الغرف للفلل والمباني الراقية',
  },
  {
    id: 'kommerling',
    name: 'كوميرلينج (Kömmerling)',
    origin: 'ألماني',
    summary: 'أقصى إحكام ضد الضوضاء والحرارة مع دعم زجاج دبل وتريبل جلاس',
  },
];

export const ALUMINUM_PROFILE_SYSTEMS: ProfileSystemOption[] = [
  {
    id: 'ps-small',
    name: 'PS صغير',
    origin: 'مصري / إيطالي',
    summary: 'عملي للغرف الصغيرة والمطابخ والحمامات',
  },
  {
    id: 'ps-large',
    name: 'PS كبير',
    origin: 'مصري / إيطالي',
    summary: 'عزل جيد للصوت والأتربة للغرف والواجهات',
  },
  {
    id: 'jumbo',
    name: 'جامبو (Jumbo)',
    origin: 'ثقيل',
    summary: 'مخصص لأبواب البلكونات والفتحات الواسعة ودبل جلاس 24 مم',
  },
  {
    id: 'tango',
    name: 'تانجو (Tango)',
    origin: 'معماري ثقيل',
    summary: 'انسيابية حركة وعزل فائق للواجهات الرئيسية',
  },
  {
    id: 'cladding-kitchen',
    name: 'مطابخ كلادينج',
    origin: 'ألواح مركبة',
    summary: 'مقاومة كاملة للرطوبة والحرارة بألوان عصرية',
  },
  {
    id: 'khashmonium-kitchen',
    name: 'مطابخ خشمونيوم',
    origin: 'ألومنيوم ديكور خشبي',
    summary: 'مظهر خشبي دافئ بمتانة الألومنيوم المعالج',
  },
];

export function getProfileTypeLabel(profileType?: ProfileCategory): string {
  return profileType === 'upvc' ? 'UPVC' : 'ألومنيوم';
}

export const WORKSHOP_TOOLS: WorkshopTool[] = [
  {
    id: 'kitchen-3d-studio',
    name: 'استوديو الرسم والتصميم 3D',
    shortName: 'الرسم 3D',
    englishName: 'Kitchen 3D Studio',
    category: 'تصميم ومعاينة',
    description: 'تصميم المطابخ والوحدات بشكل ثلاثي الأبعاد ومعاينة الألوان والزوايا مع العميل قبل التصنيع.',
    url: 'https://kitchen-3d-studio.vercel.app/',
    stageLabel: 'المرحلة 01 · التصميم',
    recommendedStage: 'design_3d',
  },
  {
    id: 'takhseem-pro',
    name: 'تخصيمات الشبابيك (ألومنيوم وUPVC)',
    shortName: 'تخصيم الشبابيك',
    englishName: 'Takhseem Pro',
    category: 'تقطيع وتخصيم',
    description: 'حساب مقاسات التخصيم بدقة للشبابيك والأبواب الألومنيوم وقطاعات UPVC وتجهيز قوائم التقطيع للورشة.',
    url: 'https://takhseem-pro.vercel.app/',
    stageLabel: 'المرحلة 02 · التخصيم',
    recommendedStage: 'takhseem',
  },
  {
    id: 'kitchen-workshop',
    name: 'تخصيمات المطابخ',
    shortName: 'تخصيم المطابخ',
    englishName: 'Kitchen Workshop',
    category: 'تقطيع وتخصيم',
    description: 'تخصيم علب المطابخ الألومنيوم والألواح والضلف والإكسسوارات بدقة عالية وتقليل الهدر.',
    url: 'https://kitchen-workshop-swart.vercel.app/',
    stageLabel: 'المرحلة 02 · التخصيم',
    recommendedStage: 'takhseem',
  },
  {
    id: 'workshop-manager',
    name: 'حسابات التكلفة والخامات والعمالة',
    shortName: 'التكلفة والحسابات',
    englishName: 'Workshop Manager',
    category: 'تكلفة وتسعير',
    description: 'تحديد تكلفة قطاعات الألومنيوم وUPVC والزجاج والإكسسوارات والعمالة بدقة لإصدار عرض السعر النهائي.',
    url: 'https://workshop-manager-taupe.vercel.app/',
    stageLabel: 'المرحلة 03 · التسعير',
    recommendedStage: 'costing',
  },
  {
    id: 'shop-manager',
    name: 'إدارة المحل والمبيعات والمخزون',
    shortName: 'إدارة المحل',
    englishName: 'Shop Manager',
    category: 'مبيعات وتشغيل',
    description: 'متابعة حسابات العملاء والتحصيل والمصروفات اليومية وحركة المخزون داخل المعرض والورشة.',
    url: 'https://shopmanager-one.vercel.app/',
    stageLabel: 'المرحلة 04 · التشغيل والتسليم',
    recommendedStage: 'delivery',
  },
];

export const ORDER_STAGES: { id: OrderStage; label: string; toolId: WorkshopTool['id'] }[] = [
  { id: 'design_3d', label: 'معاينة وتصميم 3D', toolId: 'kitchen-3d-studio' },
  { id: 'takhseem', label: 'تخصيم ومقاسات', toolId: 'takhseem-pro' },
  { id: 'costing', label: 'حساب التكلفة والتسعير', toolId: 'workshop-manager' },
  { id: 'fabrication', label: 'تصنيع بالورشة', toolId: 'kitchen-workshop' },
  { id: 'delivery', label: 'تسليم وتحصيل', toolId: 'shop-manager' },
];

export const DEFAULT_ESTIMATOR_OPTIONS: EstimatorOption[] = [
  {
    id: 'cladding',
    label: 'مطبخ كلادينج ألومنيوم',
    formInterest: 'مطبخ كلادينج / ألوميتال',
    unitLabel: 'أمتار طولية (علوي + سفلي)',
    minRate: 4200,
    maxRate: 5400,
    defaultQty: 5,
    minQty: 2,
    maxQty: 20,
  },
  {
    id: 'khashmonium',
    label: 'مطبخ خشمونيوم / ديكور خشبي',
    formInterest: 'مطبخ كلادينج / ألوميتال',
    unitLabel: 'أمتار طولية (علوي + سفلي)',
    minRate: 4600,
    maxRate: 6000,
    defaultQty: 5,
    minQty: 2,
    maxQty: 20,
  },
  {
    id: 'ps_window',
    label: 'شبابيك ألومنيوم PS (جرار / مفصلي)',
    formInterest: 'شبابيك وأبواب ألومنيوم',
    unitLabel: 'المساحة الإجمالية بالمتر المربع (م²)',
    minRate: 3200,
    maxRate: 4300,
    defaultQty: 8,
    minQty: 1,
    maxQty: 40,
  },
  {
    id: 'jumbo_double',
    label: 'واجهات وأبواب جامبو / تانجو دبل جلاس',
    formInterest: 'تجهيز واجهة أو شقة كاملة',
    unitLabel: 'المساحة الإجمالية بالمتر المربع (م²)',
    minRate: 4500,
    maxRate: 6200,
    defaultQty: 10,
    minQty: 2,
    maxQty: 50,
  },
  {
    id: 'upvc',
    label: 'شبابيك وأبواب UPVC (Wintech / Pimapen / Kompen / Rehau)',
    formInterest: 'شبابيك وأبواب UPVC',
    unitLabel: 'المساحة الإجمالية بالمتر المربع (م²)',
    minRate: 4400,
    maxRate: 6000,
    defaultQty: 8,
    minQty: 1,
    maxQty: 45,
  },
];

export const DEFAULT_ESTIMATOR_PRICING: EstimatorPricingConfig = {
  items: DEFAULT_ESTIMATOR_OPTIONS,
  premiumIncreasePercent: 15,
};

