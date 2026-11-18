import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  ImagePlus,
  Layers,
  Lock,
  Mail,
  Menu,
  MessageCircle,
  Moon,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';
import { FACEBOOK_PAGE_URL } from '../data/tools.ts';
import type { ToolId } from '../types.ts';
import type { ActiveTab } from './Sidebar.tsx';

interface WebsiteViewProps {
  theme: 'light' | 'dark';
  isAuthenticated: boolean;
  onToggleTheme: (next: 'light' | 'dark') => void;
  onEnterDashboard: (tab?: ActiveTab, toolId?: ToolId) => void;
  onSubmitQuoteRequest: (payload: {
    customerName: string;
    customerPhone: string;
    projectInterest: string;
    initialMessage: string;
    attachmentName?: string;
    attachmentDataUrl?: string;
  }) => Promise<void>;
}

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle: string;
}

const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-500 dark:text-slate-400 p-6 text-center ${className}`}
      >
        <Layers className="w-8 h-8 mb-2 opacity-60" />
        <span className="text-xs font-medium">{fallbackTitle}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

interface EstimatorOption {
  id: string;
  label: string;
  formInterest: string;
  unitLabel: string;
  minRate: number;
  maxRate: number;
  defaultQty: number;
  minQty: number;
  maxQty: number;
}

const ESTIMATOR_OPTIONS: EstimatorOption[] = [
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
];

const PORTFOLIO_ITEMS = [
  {
    id: 'p1',
    title: 'مطبخ كلادينج مودرن مع جزيرة وسطية',
    category: 'مطابخ كلادينج',
    specs: 'قطاعات ثقيلة · مفصلات هيدروليك · إضاءة مخفية',
    image: '/src/assets/images/hero_aluminum_kitchen_1794999241476.jpg',
    alt: 'مطبخ ألومنيوم وكلادينج حديث من تنفيذ ورشة ماجدتال',
  },
  {
    id: 'p2',
    title: 'واجهة بلكونة جرار دبل جلاس عازل',
    category: 'جامبو وتانجو',
    specs: 'زجاج مزدوج 24 مم · عزل صوت وأتربة · كاوتش EPDM',
    image: '/src/assets/images/modern_balcony_aluminum_door_1795000004618.jpg',
    alt: 'باب وشباك بلكونة ألومنيوم جرار دبل جلاس أسود مط',
  },
  {
    id: 'p3',
    title: 'شبابيك PS مفصلية وجرار تشطيب أنودايزد',
    category: 'شبابيك ألومنيوم',
    specs: 'زوايا تجميع 45 درجة · إكسسوارات أصلية · سلك بليسيه',
    image: '/src/assets/images/aluminum_window_craft_1794999241439.jpg',
    alt: 'تفاصيل زوايا وتجميع شبابيك ألومنيوم عازلة للصوت والحرارة',
  },
  {
    id: 'p4',
    title: 'خط تقطيع وتخصيم رقمي داخل الورشة',
    category: 'دقة التصنيع',
    specs: 'قوائم قص رقمية بالملليمتر · فحص جودة قبل التركيب',
    image: '/src/assets/images/workshop_precision_fabrication_1794999242742.jpg',
    alt: 'ورشة تصنيع وتجهيز قطاعات الألومنيوم والمطابخ',
  },
];

const CUSTOMER_PILLARS = [
  {
    step: '01',
    title: 'تصميم ثلاثي الأبعاد قبل القص',
    description:
      'تشاهد توزيع مطبخك وألوان الضلف ومساحة الحركة بشكل واقعي قبل البدء في قص أي لوح، مع إمكانية التعديل الفوري.',
  },
  {
    step: '02',
    title: 'تخصيم هندسي بالملليمتر',
    description:
      'نحسب مقاسات العلب والضلف والزجاج عبر برامج تخصيم متخصصة تمنع أخطاء التركيب وتحافظ على اتزان المفصلات والمجاري.',
  },
  {
    step: '03',
    title: 'تفصيل شفاف للخامات والتكلفة',
    description:
      'مقايسة واضحة تفصل أمتار الألومنيوم ونوع الزجاج والإكسسوارات والعمالة دون بنود مخفية أو زيادات مفاجئة.',
  },
  {
    step: '04',
    title: 'جودة تجميع وإكسسوارات أصلية',
    description:
      'استخدام قطاعات ألومنيوم معتمدة ومفصلات ومجاري سوفت كلوز وكاوتش عزل معمر لثبات طويل الأمد.',
  },
  {
    step: '05',
    title: 'التزام بالمواعيد وضمان مكتوب',
    description:
      'متابعة كل أمر شغل من المعاينة حتى التركيب النهائي في الموقع مع ضمان وصيانة ما بعد التسليم.',
  },
];

const CLIENT_REVIEWS = [
  {
    name: 'م. محمود سعيد',
    project: 'مطبخ كلادينج + 6 شبابيك PS',
    quote:
      'أكثر ما أعجبني هو معاينة التصميم 3D قبل التنفيذ؛ ما شاهدناه على الشاشة هو ما تم تركيبه بالضبط دون أي تعديل في الموقع.',
  },
  {
    name: 'أ. سارة عبد الرحمن',
    project: 'مطبخ خشمونيوم كامل',
    quote:
      'التشطيب ممتاز والمجاري والمفصلات الهيدروليك سلسة جداً، والمقايسة كانت واضحة من البداية وتم التسليم في الموعد المحدد.',
  },
  {
    name: 'أ. طارق حسن',
    project: 'واجهات بلكونة جامبو دبل جلاس',
    quote:
      'فرق واضح في عزل الصوت والأتربة بعد تركيب الدبل جلاس، والتزام تام في رفع المقاسات والتقفيل النهائي.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'كم تستغرق مدة تصنيع وتركيب المطبخ أو الشبابيك؟',
    a: 'تستغرق الشبابيك عادةً من 5 إلى 10 أيام عمل بعد تأكيد المقاسات النهائية، بينما تستغرق المطابخ من 10 إلى 18 يوم عمل حسب المساحة ونوع التشطيب والتصميم المعتمد.',
  },
  {
    q: 'كيف تتم المعاينة ورفع المقاسات؟',
    a: 'تبدأ بإرسال المقاسات التقريبية أو صورة للمكان عبر نموذج المقايسة في الموقع، فنجهز لك تقديراً مبدئياً وتصوراً 3D، ثم يتم تحديد موعد للمعاينة الفعلية بالليزر قبل التقطيع.',
  },
  {
    q: 'ما الفرق بين مطابخ الكلادينج والخشمونيوم والألوميتال العادي؟',
    a: 'الكلادينج يتميز بألواح مركبة مقاومة للحرارة والرطوبة وسهلة التنظيف بألوان عصرية، والخشمونيوم يمنح مظهر الخشب الطبيعي مع متانة الألومنيوم وعدم التأثر بالماء أو الحشرات.',
  },
  {
    q: 'هل الشبابيك الألومنيوم عازلة فعلاً للصوت والأتربة؟',
    a: 'نعم، عند اختيار قطاعات PS كبير أو جامبو/تانجو مع زجاج مزدوج (دبل جلاس) وكاوتش عزل مزدوج، يتم تقليل الضوضاء والأتربة وتسرب الهواء بشكل كبير.',
  },
  {
    q: 'هل يوجد ضمان على التركيب والإكسسوارات؟',
    a: 'نعم، تقدم ورشة ماجدتال ضماناً لمدة 5 سنوات على عيوب التصنيع والتركيب واتزان المفصلات والمجاري، مع خدمة صيانة وضبط ما بعد التركيب.',
  },
];

export const WebsiteView: React.FC<WebsiteViewProps> = ({
  theme,
  isAuthenticated,
  onToggleTheme,
  onEnterDashboard,
  onSubmitQuoteRequest,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Estimator state
  const [estTypeId, setEstTypeId] = useState<string>('cladding');
  const [estQty, setEstQty] = useState<number>(5);
  const [estTier, setEstTier] = useState<'standard' | 'premium'>('standard');

  // Quote Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [projectInterest, setProjectInterest] = useState('مطبخ كلادينج / ألوميتال');
  const [dimensionsText, setDimensionsText] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentDataUrl, setAttachmentDataUrl] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const selectedEst =
    ESTIMATOR_OPTIONS.find((opt) => opt.id === estTypeId) || ESTIMATOR_OPTIONS[0];
  const tierMultiplier = estTier === 'premium' ? 1.15 : 1;
  const clampedQty = Math.max(selectedEst.minQty, Math.min(selectedEst.maxQty, estQty));
  const estMinTotal = Math.round((clampedQty * selectedEst.minRate * tierMultiplier) / 100) * 100;
  const estMaxTotal = Math.round((clampedQty * selectedEst.maxRate * tierMultiplier) / 100) * 100;

  const handleEstimatorCategoryChange = (nextId: string) => {
    setEstTypeId(nextId);
    const nextOpt = ESTIMATOR_OPTIONS.find((o) => o.id === nextId);
    if (nextOpt) {
      setEstQty(nextOpt.defaultQty);
    }
  };

  const handleApplyEstimateToForm = () => {
    setProjectInterest(selectedEst.formInterest);
    const tierLabel = estTier === 'premium' ? 'مستوى ممتاز (سوفت كلوز / إكسسوار مستورد)' : 'مستوى قياسي معتمد';
    const summaryLine = `تقدير مبدئي من الحاسبة: ${selectedEst.label} - الكمية: ${clampedQty} (${selectedEst.unitLabel}) - ${tierLabel} - النطاق التقديري: ${estMinTotal.toLocaleString('en-US')} إلى ${estMaxTotal.toLocaleString('en-US')} ج.م`;
    setDimensionsText((prev) => (prev.trim() ? `${summaryLine}\n${prev}` : summaryLine));
    const el = document.getElementById('quote-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError(null);

    if (!file.type.startsWith('image/')) {
      setFormError('يرجى اختيار ملف صورة صالح (JPG أو PNG أو WEBP).');
      return;
    }

    setProcessingImage(true);
    const reader = new FileReader();
    reader.onload = () => {
      const rawUrl = typeof reader.result === 'string' ? reader.result : null;
      if (!rawUrl) {
        setProcessingImage(false);
        setFormError('تعذر قراءة الصورة المختارة.');
        return;
      }

      const img = new Image();
      img.onload = () => {
        const maxDim = 1400;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setAttachmentDataUrl(compressed);
        } else {
          setAttachmentDataUrl(rawUrl);
        }
        setAttachmentName(file.name);
        setProcessingImage(false);
      };
      img.onerror = () => {
        setProcessingImage(false);
        setFormError('تعذر معالجة ملف الصورة.');
      };
      img.src = rawUrl;
    };
    reader.onerror = () => {
      setProcessingImage(false);
      setFormError('تعذر قراءة ملف الصورة.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachmentName(null);
    setAttachmentDataUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmittedSuccess(false);

    const cleanName = customerName.trim();
    const cleanPhone = customerPhone.trim();
    const cleanNotes = dimensionsText.trim();

    if (cleanName.length < 2) {
      setFormError('يرجى إدخال الاسم الكامل.');
      return;
    }
    if (cleanPhone.length < 8) {
      setFormError('يرجى إدخال رقم هاتف صحيح للتواصل.');
      return;
    }
    if (!cleanNotes && !attachmentDataUrl) {
      setFormError('يرجى كتابة المقاسات التقريبية أو إرفاق صورة للمقاسات.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitQuoteRequest({
        customerName: cleanName,
        customerPhone: cleanPhone,
        projectInterest,
        initialMessage: cleanNotes
          ? `طلب مقايسة من الموقع: ${cleanNotes}`
          : 'طلب مقايسة من الموقع (مرفق صورة للمقاسات والتفاصيل)',
        attachmentName: attachmentName || undefined,
        attachmentDataUrl: attachmentDataUrl || undefined,
      });
      setCustomerName('');
      setCustomerPhone('');
      setDimensionsText('');
      handleRemoveAttachment();
      setSubmittedSuccess(true);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'تعذر إرسال الطلب حالياً، حاول مرة أخرى.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const navLinks = [
    { href: '#services', label: 'خدماتنا' },
    { href: '#portfolio', label: 'أعمالنا' },
    { href: '#estimator', label: 'حاسبة السعر' },
    { href: '#faq', label: 'الأسئلة الشائعة' },
    { href: '#quote-form', label: 'طلب مقايسة' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Bar: Brand + Single-line Navigation + Primary Quote Action + Theme & Admin Gate */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1280px] mx-auto h-full px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label="فتح قائمة التنقل"
              aria-expanded={mobileNavOpen}
              className="md:hidden p-2 -mr-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <a
              href="#top"
              className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
            >
              <span className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 flex items-center justify-center text-sm font-mono font-bold">
                M
              </span>
              <span>ماجدتال</span>
            </a>
          </div>

          <nav
            aria-label="التنقل الرئيسي بالموقع"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label={theme === 'light' ? 'التبديل للوضع الداكن' : 'التبديل للوضع الفاتح'}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onEnterDashboard('overview')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isAuthenticated ? 'لوحة الإدارة' : 'بوابة الإدارة'}</span>
            </button>

            <a
              href="#quote-form"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              اطلب مقايسة
            </a>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-2 shadow-lg">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  onEnterDashboard('overview');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAuthenticated ? 'لوحة الإدارة' : 'بوابة الإدارة'}</span>
              </button>
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-700 dark:text-blue-400"
              >
                <span>صفحة فيسبوك</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </header>

      <main id="top" className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Hero Copy */}
              <div className="lg:col-span-5 flex flex-col justify-between py-2">
                <div>
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                    ماجدتال للألومنيوم والمطابخ الحديثة · هندسة وتصنيع متكامل
                  </p>
                  <h1 className="mt-4 text-[clamp(2rem,3.6vw,3.15rem)] font-bold leading-[1.2] tracking-tight text-slate-900 dark:text-slate-100 text-balance">
                    تصميم وتصنيع المطابخ والشبابيك الألومنيوم بدقة هندسية
                  </h1>
                  <p className="mt-5 text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                    نجمع بين المعاينة ثلاثية الأبعاد قبل التصنيع، وحسابات التخصيم الدقيقة بالملليمتر، وتسعير الخامات والعمالة بشفافية تامة من لحظة رفع المقاس حتى التركيب النهائي.
                  </p>
                </div>

                <div className="mt-8 space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href="#quote-form"
                      className="px-5 py-3 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      اطلب مقايسة مجانية
                    </a>
                    <a
                      href="#estimator"
                      className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      <Calculator className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                      <span>احسب التكلفة التقديرية</span>
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>ضمان 5 سنوات على التركيب والإكسسوارات</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                      <span>تصميم 3D قبل التقطيع</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Hero 16:9 Architectural Photography */}
              <div className="lg:col-span-7">
                <div className="h-full min-h-[280px] sm:min-h-[400px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                  <ResilientImage
                    src="/src/assets/images/hero_aluminum_kitchen_1794999241476.jpg"
                    alt="مطبخ ألومنيوم وكلادينج حديث من تنفيذ ورشة ماجدتال"
                    fallbackTitle="معرض مطابخ الألومنيوم والكلادينج"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* 4-Column Capability Strip below Hero Split */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500">01</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                  معاينة 3D قبل التصنيع
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  مشاهدة توزيع الوحدات والألوان والزوايا بشكل واقعي قبل قص أي لوح.
                </p>
              </div>
              <div>
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500">02</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                  تخصيم رقمي بالمليمتر
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  قوائم تقطيع آلية للمطابخ والشبابيك تمنع أخطاء المقاسات وتخفض الهدر.
                </p>
              </div>
              <div>
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500">03</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                  تسعير خامات شفاف
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  حساب دقيق لأمتار القطاعات والزجاج والإكسسوارات وتكلفة التنفيذ.
                </p>
              </div>
              <div>
                <p className="font-mono text-xs text-slate-400 dark:text-slate-500">04</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                  متابعة مباشرة من الطلب للتسليم
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  استقبال طلبات الموقع ورسائل فيسبوك مع جدول تنفيذ منظم وضمان ما بعد التركيب.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services & Craftsmanship Asymmetric Bento Grid */}
        <section id="services" className="py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="max-w-2xl mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 text-balance">
                تخصصات الورشة ومواصفات القطاعات
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                كل مرحلة في الورشة مدعومة بنظام حسابي وتصميمي مخصص لضمان ثبات القطاعات وسلاسة الحركة لعمر طويل.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Wide Feature Card 01 */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="aspect-[4/3] sm:aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <ResilientImage
                    src="/src/assets/images/aluminum_window_craft_1794999241439.jpg"
                    alt="تفاصيل زوايا وتجميع شبابيك ألومنيوم عازلة للصوت والحرارة"
                    fallbackTitle="أنظمة الشبابيك والأبواب الألومنيوم"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      01 · أنظمة الشبابيك والواجهات
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                      شبابيك وأبواب ألومنيوم عازلة (جرار · مفصلي · قلاب)
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      تنفيذ قطاعات PS صغير وكبير وقطاعات التانجو والجامبو مع زجاج مزدوج (دبل جلاس) عازل للأتربة والضوضاء والحرارة، وتخصيم آلي يضمن إحكام الغلق.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Card 02 */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <ResilientImage
                    src="/src/assets/images/workshop_precision_fabrication_1794999242742.jpg"
                    alt="ورشة تصنيع وتجهيز قطاعات الألومنيوم والمطابخ"
                    fallbackTitle="ورشة التصنيع والتخصيم الهندسي"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      02 · المطابخ والتجهيز المعماري
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                      مطابخ كلادينج وألوميتال مقاومة للرطوبة
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      تصميم وتنفيذ مطابخ ألومنيوم وكلادينج وخشمونيوم بمفصلات هيدروليك ومجاري سوفت كلوز مع تخطيط ثلاثي الأبعاد للعميل قبل البدء بالتقطيع.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Specs Strip */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <p className="text-xs font-mono text-blue-700 dark:text-blue-400">قطاعات PS</p>
                <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                  PS صغير وكبير عازل
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  مناسب للغرف والمناور بجرار سلس أو مفصلي محكم مع كاوتش عزل مزدوج.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <p className="text-xs font-mono text-blue-700 dark:text-blue-400">جامبو وتانجو</p>
                <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                  واجهات وأبواب بلكونات ثقيلة
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  قدرة تحمل عالية للمساحات الكبيرة مع زجاج دبل جلاس 24 مم لعزل الحرارة والضوضاء.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <p className="text-xs font-mono text-blue-700 dark:text-blue-400">مطابخ كلادينج</p>
                <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                  كلادينج وخشمونيوم ضد الماء
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  هيكل ألومنيوم متين مقاوم للرطوبة والحشرات وسهل التنظيف مع ألوان ثابتة.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <p className="text-xs font-mono text-blue-700 dark:text-blue-400">الإكسسوارات</p>
                <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                  سوفت كلوز ومفصلات هيدروليك
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  مفصلات ومقابض أصلية ومجاري أدراج تتحمل الأوزان اليومية بضمان 5 سنوات.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Showcase Gallery */}
        <section
          id="portfolio"
          className="py-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  نماذج من أعمالنا ومعايير التنفيذ
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                  اهتمام بأدق تفاصيل التقفيل، زوايا التجميع، تناسق الألوان، وجودة الزجاج والإكسسوار في كل مشروع.
                </p>
              </div>
              <a
                href="#quote-form"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline"
              >
                <span>اطلب معاينة لمشروعك المماثل</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {PORTFOLIO_ITEMS.map((item) => (
                <article
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col"
                >
                  <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <ResilientImage
                      src={item.image}
                      alt={item.alt}
                      fallbackTitle={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] font-mono text-blue-700 dark:text-blue-400">
                        {item.category}
                      </p>
                      <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {item.title}
                      </h3>
                    </div>
                    <p className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                      {item.specs}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Quick Cost Estimator */}
        <section
          id="estimator"
          className="py-16 border-t border-slate-200 dark:border-slate-800"
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <p className="text-xs font-mono text-blue-700 dark:text-blue-400">
                      تقدير فوري مبدئي
                    </p>
                    <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                      حاسبة التكلفة التقديرية
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      اختر نوع العمل وأدخل الأمتار التقريبية لمعرفة نطاق الميزانية المتوقع قبل طلب المقايسة الدقيقة.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      1. اختر نوع المشروع
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {ESTIMATOR_OPTIONS.map((opt) => {
                        const active = opt.id === selectedEst.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleEstimatorCategoryChange(opt.id)}
                            className={`text-right px-3.5 py-3 rounded-lg border text-xs font-medium transition-colors ${
                              active
                                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 border-slate-900 dark:border-slate-100'
                                : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <label
                          htmlFor="estimator-qty-range"
                          className="font-semibold text-slate-700 dark:text-slate-300"
                        >
                          2. {selectedEst.unitLabel}
                        </label>
                        <span className="font-mono font-bold tabular-nums text-blue-700 dark:text-blue-400">
                          {clampedQty} م
                        </span>
                      </div>
                      <input
                        id="estimator-qty-range"
                        type="range"
                        min={selectedEst.minQty}
                        max={selectedEst.maxQty}
                        value={clampedQty}
                        onChange={(e) => setEstQty(Number(e.target.value))}
                        className="w-full accent-blue-700 dark:accent-blue-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-400 mt-1">
                        <span>{selectedEst.minQty}</span>
                        <span>{selectedEst.maxQty}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        3. مستوى الإكسسوارات والتشطيب
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setEstTier('standard')}
                          className={`px-3 py-2.5 text-xs font-medium rounded-lg border transition-colors ${
                            estTier === 'standard'
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-800 dark:text-blue-300'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          قياسي معتمد
                        </button>
                        <button
                          type="button"
                          onClick={() => setEstTier('premium')}
                          className={`px-3 py-2.5 text-xs font-medium rounded-lg border transition-colors ${
                            estTier === 'premium'
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-800 dark:text-blue-300'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          ممتاز سوفت كلوز
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estimator Output Panel */}
                <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      نطاق التكلفة التقديري المتوقع
                    </p>
                    <p className="mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {estMinTotal.toLocaleString('en-US')} – {estMaxTotal.toLocaleString('en-US')}{' '}
                      <span className="text-sm font-sans font-semibold text-slate-600 dark:text-slate-400">
                        ج.م
                      </span>
                    </p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      * هذا الرقم استرشادي ويتحدد السعر النهائي بدقة بعد مراجعة المقاسات ونوع الزجاج والإكسسوارات المختارة في المعاينة.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                    <button
                      type="button"
                      onClick={handleApplyEstimateToForm}
                      className="w-full px-4 py-3 text-xs sm:text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors"
                    >
                      اعتماد التقدير وإرساله في طلب المقايسة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer-Focused Precision Workflow Section */}
        <section
          id="programs"
          className="py-16 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  كيف تضمن لك تقنيات ماجدتال الدقة قبل التصنيع؟
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                  ندير كل مشروع عبر منظومة هندسية متكاملة تربط الرسم ثلاثي الأبعاد بحسابات التخصيم والتكلفة لضمان أعلى جودة في التنفيذ.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEnterDashboard('overview')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>دخول فريق الورشة للبرامج</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {CUSTOMER_PILLARS.map((pillar) => (
                <div
                  key={pillar.step}
                  className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <p className="font-mono text-xs text-blue-700 dark:text-blue-400">
                      {pillar.step}
                    </p>
                    <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-slate-100">
                      {pillar.title}
                    </h3>
                    <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Client Reviews & FAQ Section */}
        <section
          id="faq"
          className="py-16 border-b border-slate-200 dark:border-slate-800"
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-14">
            {/* Client Reviews */}
            <div>
              <div className="max-w-2xl mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  انطباعات عملائنا بعد التسليم
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  الالتزام بالمواصفات والموعد هو المعيار الأهم في كل مشروع ننفذه.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {CLIENT_REVIEWS.map((review) => (
                  <blockquote
                    key={review.name}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between"
                  >
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      «{review.quote}»
                    </p>
                    <footer className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {review.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {review.project}
                      </p>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>

            {/* Interactive FAQ Accordion */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  الأسئلة الشائعة
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  إجابات مختصرة عن مواعيد التنفيذ، رفع المقاسات، والفرق بين القطاعات والضمان.
                </p>
              </div>

              <div className="lg:col-span-8 space-y-3">
                {FAQ_ITEMS.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={item.q}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-right font-semibold text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <span>{item.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Quote / Customer Request Form */}
        <section id="quote-form" className="py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-5">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 text-balance">
                    اطلب مقايسة ومعاينة لمطبخك أو شبابيكك
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    أرسل المقاسات التقريبية أو صورة للمكان، وسيصل طلبك فوراً لفريق الورشة للبدء في التصميم ثلاثي الأبعاد وحساب التكلفة بدقة.
                  </p>
                </div>

                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    قنوات التواصل المباشر
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <a
                      href={FACEBOOK_PAGE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>مراسلة صفحة ماجدتال على فيسبوك</span>
                    </a>
                    <a
                      href="mailto:mohamedmaged_3@yahoo.com"
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span dir="ltr">mohamedmaged_3@yahoo.com</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8">
                {submittedSuccess && (
                  <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-lg flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-sm font-medium text-emerald-900 dark:text-emerald-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>تم استلام طلبك بنجاح، وسيتواصل معك فريق ماجدتال قريباً.</span>
                    </div>
                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={() => onEnterDashboard('facebook')}
                        className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 underline whitespace-nowrap"
                      >
                        عرض في صندوق الوارد
                      </button>
                    )}
                  </div>
                )}

                {formError && (
                  <div className="mb-5 p-3 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        الاسم بالكامل *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="مثال: أحمد علي"
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        رقم الهاتف / واتساب *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="01000000000"
                        className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      نوع الطلب
                    </label>
                    <select
                      value={projectInterest}
                      onChange={(e) => setProjectInterest(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="مطبخ كلادينج / ألوميتال">
                        مطبخ كلادينج / ألوميتال
                      </option>
                      <option value="شبابيك وأبواب ألومنيوم">
                        شبابيك وأبواب ألومنيوم
                      </option>
                      <option value="تصميم مطبخ 3D ومقايسة">
                        تصميم مطبخ 3D ومقايسة
                      </option>
                      <option value="تجهيز واجهة أو شقة كاملة">
                        تجهيز واجهة أو شقة كاملة
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      المقاسات التقريبية والتفاصيل *
                    </label>
                    <textarea
                      rows={4}
                      required={!attachmentDataUrl}
                      value={dimensionsText}
                      onChange={(e) => setDimensionsText(e.target.value)}
                      placeholder="اكتب مساحة المطبخ أو عدد الشبابيك والمنطقة والملاحظات المطلوبة..."
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-950"
                    />

                    <div className="mt-2.5">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="sr-only"
                        id="dimensions-image-upload"
                      />

                      {!attachmentDataUrl ? (
                        <label
                          htmlFor="dimensions-image-upload"
                          className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer transition-colors"
                        >
                          <span className="inline-flex items-center gap-2">
                            <ImagePlus className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                            <span>
                              {processingImage
                                ? 'جاري تجهيز الصورة...'
                                : 'إرفاق صورة للمقاسات أو رسم كروكي أو صورة الموقع (اختياري)'}
                            </span>
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                            JPG / PNG
                          </span>
                        </label>
                      ) : (
                        <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={attachmentDataUrl}
                              alt={attachmentName || 'معاينة صورة المقاسات'}
                              className="w-12 h-12 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                                {attachmentName}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                سيتم إرسال الصورة مع طلب المقايسة
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleRemoveAttachment}
                            aria-label="إزالة الصورة المرفقة"
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
                    >
                      {submitting ? 'جاري إرسال الطلب...' : 'إرسال طلب المقايسة'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              ماجدتال للألومنيوم والمطابخ
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              تصميم ثلاثي الأبعاد · تخصيم دقيق · تصنيع وتركيب بضمان 5 سنوات
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600 dark:text-slate-400">
            <a
              href="/privacy"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              سياسة الخصوصية
            </a>
            <a
              href="/data-deletion"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              حذف البيانات
            </a>
            <button
              type="button"
              onClick={() => onEnterDashboard('overview')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
            >
              بوابة الإدارة
            </button>

            <div
              className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
              role="group"
              aria-label="تبديل المظهر"
            >
              <button
                type="button"
                onClick={() => onToggleTheme('light')}
                aria-pressed={theme === 'light'}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                  theme === 'light'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>فاتح</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleTheme('dark')}
                aria-pressed={theme === 'dark'}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-900 text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>داكن</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
