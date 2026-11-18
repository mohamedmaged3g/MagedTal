import { OrderStage, ProfileCategory, WorkshopTool } from '../types.ts';

export const FACEBOOK_PAGE_ID = '61596916040640';
export const FACEBOOK_PAGE_URL = 'https://www.facebook.com/profile.php?id=61596916040640';

export const PROFILE_TYPES: { id: ProfileCategory; label: string }[] = [
  { id: 'aluminum', label: 'ألومنيوم' },
  { id: 'upvc', label: 'UPVC' },
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
