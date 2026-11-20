import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  ImagePlus,
  Layers,
  Lock,
  Mail,
  Menu,
  MessageCircle,
  Moon,
  Printer,
  Search,
  ShieldCheck,
  Sun,
  User,
  X,
  ZoomIn,
} from 'lucide-react';
import {
  ALUMINUM_PROFILE_SYSTEMS,
  DEFAULT_ESTIMATOR_PRICING,
  FACEBOOK_PAGE_URL,
  UPVC_PROFILE_SYSTEMS,
} from '../data/tools.ts';
import type {
  CustomerProfile,
  EstimatorPricingConfig,
  FacebookInquiry,
  ProfileCategory,
  QuoteTrackingResult,
  ToolId,
} from '../types.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import type { ActiveTab } from './Sidebar.tsx';

interface WebsiteViewProps {
  theme: 'light' | 'dark';
  isAuthenticated: boolean;
  pricingConfig?: EstimatorPricingConfig;
  googleProfile?: CustomerProfile | null;
  googleAuthLoading?: boolean;
  googleAuthError?: string | null;
  userQuotesCount?: number;
  trackPrefillCode?: string | null;
  onConsumeTrackPrefill?: () => void;
  onGoogleSignIn?: () => Promise<void>;
  onOpenCustomerAccount?: () => void;
  onToggleTheme: (next: 'light' | 'dark') => void;
  onEnterDashboard: (tab?: ActiveTab, toolId?: ToolId) => void;
  onSubmitQuoteRequest: (payload: {
    customerName: string;
    customerPhone: string;
    profileType?: ProfileCategory;
    profileSystem?: string;
    projectInterest: string;
    initialMessage: string;
    attachmentName?: string;
    attachmentDataUrl?: string;
  }) => Promise<FacebookInquiry | unknown>;
}

const GoogleMark: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.56-5.15 3.56-8.65z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.29v3.1A12 12 0 0 0 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.38-2.29V6.61H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.39l3.99-3.1z"
    />
    <path
      fill="#EA4335"
      d="M12 4.76c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.29 6.61l3.99 3.1c.95-2.84 3.6-4.95 6.72-4.95z"
    />
  </svg>
);

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

function formatMoneyRange(min: number, max: number): string {
  const safeMin = Math.max(0, Math.round(min));
  const safeMax = Math.max(safeMin, Math.round(max));
  if (safeMin === safeMax) {
    return safeMin.toLocaleString('en-US');
  }
  return `${safeMin.toLocaleString('en-US')} – ${safeMax.toLocaleString('en-US')}`;
}

const FINISH_SWATCHES = [
  {
    id: 'matte-black',
    name: 'أسود مط أنودايزد',
    code: '#1E293B',
    surfaceClass: 'bg-slate-800',
  },
  {
    id: 'anodized-silver',
    name: 'فضي معدني',
    code: '#CBD5E1',
    surfaceClass: 'bg-slate-300',
  },
  {
    id: 'warm-champagne',
    name: 'شمبانيا دافئ',
    code: '#C2B280',
    surfaceClass: 'bg-[#C2B280]',
  },
  {
    id: 'walnut-wood',
    name: 'خشبي جوزي (خشمونيوم)',
    code: '#6F4E37',
    surfaceClass: 'bg-[#6F4E37]',
  },
  {
    id: 'graphite-cladding',
    name: 'رمادي جرافيت كلادينج',
    code: '#475569',
    surfaceClass: 'bg-slate-600',
  },
  {
    id: 'gloss-white',
    name: 'أبيض ألومنيوم لامع',
    code: '#F8FAFC',
    surfaceClass: 'bg-slate-50 border border-slate-300',
  },
];

const PROFILE_COMPARISON = [
  {
    name: 'قطاع PS صغير',
    insulation: 'جيد للأتربة والمياه (كاوتش أحادي/مزدوج)',
    glazing: 'زجاج سنجل 6 مم أو مصنفر',
    bestUse: 'الغرف الصغيرة والمطابخ والحمامات',
    tier: 'اقتصادي عملي',
  },
  {
    name: 'قطاع PS كبير',
    insulation: 'عزل عالٍ للصوت والغبار والحرارة',
    glazing: 'زجاج سنجل أو دبل جلاس حتى 18 مم',
    bestUse: 'غرف النوم والمعيشة والواجهات الهادئة',
    tier: 'متوسط متوازن',
  },
  {
    name: 'جامبو / تانجو',
    insulation: 'أعلى عزل حراري وصوتي وإحكام إغلاق',
    glazing: 'زجاج مزدوج دبل جلاس 24 مم (عاكس/شفاف)',
    bestUse: 'أبواب البلكونات والواجهات الواسعة والريسبشن',
    tier: 'معماري فائق',
  },
  {
    name: 'UPVC تركي (Wintech · Pimapen · Kompen · Egepen · Adopen)',
    insulation: 'عزل حراري وصوتي ممتاز بلحام حراري محكم وتدعيم صلب مجلفن',
    glazing: 'زجاج دبل جلاس 20–24 مم (شفاف / عاكس)',
    bestUse: 'الشبابيك المفصلية والقلاب والجرار للغرف والبلكونات',
    tier: 'تركي عالي العزل',
  },
  {
    name: 'UPVC أوروبي (Rehau · Deceuninck · Kömmerling)',
    insulation: 'أقصى عزل صوتي وحراري متعدد الغرف (5–6 غرف عزل)',
    glazing: 'زجاج دبل أو تريبل جلاس مع حقن غاز أرجون',
    bestUse: 'الفلل والواجهات المشمسة والشوارع الرئيسية الصاخبة',
    tier: 'ألماني / أوروبي فاخر',
  },
  {
    name: 'مطابخ كلادينج',
    insulation: 'مقاومة كاملة للماء والبخار والحشرات',
    glazing: 'ألواح كلادينج مزدوجة + شاسيه ألومنيوم',
    bestUse: 'المطابخ العصرية سهلة التنظيف بألوان متعددة',
    tier: 'عصري معمر',
  },
  {
    name: 'مطابخ خشمونيوم',
    insulation: 'مقاوم للرطوبة بمظهر خشبي دافئ',
    glazing: 'قطاعات خشبية معالجة حرارياً + فيبر/كلادينج',
    bestUse: 'محبو الطابع الخشبي مع متانة الألومنيوم',
    tier: 'تشطيب فاخر',
  },
];

type PortfolioFilter = 'all' | 'kitchens' | 'windows' | 'facades';

interface PortfolioItem {
  id: string;
  filter: Exclude<PortfolioFilter, 'all'>;
  title: string;
  category: string;
  formInterest: string;
  specs: string;
  details: string;
  image: string;
  alt: string;
}

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'p1',
    filter: 'kitchens',
    title: 'مطبخ كلادينج مودرن مع جزيرة وسطية',
    category: 'مطابخ كلادينج',
    formInterest: 'مطبخ كلادينج / ألوميتال',
    specs: 'قطاعات ثقيلة · مفصلات هيدروليك · إضاءة مخفية',
    details:
      'تصميم حرف L مع جزيرة عملية، شاسيه ألومنيوم معالج للرطوبة، ومجاري أدراج سوفت كلوز تتحمل الأوزان الثقيلة.',
    image: '/src/assets/images/hero_aluminum_kitchen_1794999241476.jpg',
    alt: 'مطبخ ألومنيوم وكلادينج حديث من تنفيذ ورشة ماجدتال',
  },
  {
    id: 'p2',
    filter: 'facades',
    title: 'واجهة بلكونة جرار دبل جلاس عازل',
    category: 'جامبو وتانجو',
    formInterest: 'تجهيز واجهة أو شقة كاملة',
    specs: 'زجاج مزدوج 24 مم · عزل صوت وأتربة · كاوتش EPDM',
    details:
      'قطاع ثقيل بمسارات حركة سلسة وزجاج دبل جلاس عاكس معالج لعزل الضوضاء وأشعة الشمس في الواجهات المفتوحة.',
    image: '/src/assets/images/modern_balcony_aluminum_door_1795000004618.jpg',
    alt: 'باب وشباك بلكونة ألومنيوم جرار دبل جلاس أسود مط',
  },
  {
    id: 'p3',
    filter: 'windows',
    title: 'شبابيك PS مفصلية وجرار تشطيب أنودايزد',
    category: 'شبابيك ألومنيوم',
    formInterest: 'شبابيك وأبواب ألومنيوم',
    specs: 'زوايا تجميع 45 درجة · إكسسوارات أصلية · سلك بليسيه',
    details:
      'تجميع ميكانيكي محكم للزوايا مع فرشة عزل مزدوجة ومفصلات وسكاكات أصلية ومجرى سلك بليسيه مدمج.',
    image: '/src/assets/images/aluminum_window_craft_1794999241439.jpg',
    alt: 'تفاصيل زوايا وتجميع شبابيك ألومنيوم عازلة للصوت والحرارة',
  },
  {
    id: 'p4',
    filter: 'facades',
    title: 'خط تقطيع وتخصيم رقمي داخل الورشة',
    category: 'دقة التصنيع',
    formInterest: 'تصميم مطبخ 3D ومقايسة',
    specs: 'قوائم قص رقمية بالملليمتر · فحص جودة قبل التركيب',
    details:
      'مراجعة كل قطعة على قوائم التخصيم الآلية قبل خروجها للموقع لضمان سرعة التركيب ودقة المقاسات بدون تعديلات.',
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
    q: 'هل الشبابيك الألومنيوم وUPVC عازلة فعلاً للصوت والأتربة؟',
    a: 'نعم، عند اختيار قطاعات UPVC بلحام حراري أو قطاعات PS كبير وجامبو/تانجو مع زجاج مزدوج (دبل جلاس) وكاوتش عزل مزدوج، يتم تقليل الضوضاء والأتربة والحرارة بشكل ملحوظ.',
  },
  {
    q: 'ما أشهر أسماء قطاعات UPVC المتوفرة لديكم ومتى أختارها؟',
    a: 'ننفذ أشهر قطاعات UPVC التركية والأوروبية مثل وينتك (Wintech) وبيمابن (Pimapen) وكومبين (Kompen) وإيجيبن (Egepen) وأدوبن (Adopen)، بالإضافة للقطاعات الألمانية والأوروبية مثل ريهاو (Rehau) وديكونينك (Deceuninck) وكوميرلينج (Kömmerling). يُفضل UPVC في الواجهات المشمسة أو الشوارع المزدحمة لأقصى عزل حراري وصوتي، بينما يمتاز الألومنيوم (PS وجامبو وتانجو) بتنوع أكبر في الألوان المعدنية وقدرة تحمّل ممتازة للفتحات الكبيرة.',
  },
  {
    q: 'هل يوجد ضمان على التركيب والإكسسوارات؟',
    a: 'نعم، تقدم ورشة ماجدتال ضماناً لمدة 5 سنوات على عيوب التصنيع والتركيب واتزان المفصلات والمجاري، مع خدمة صيانة وضبط ما بعد التركيب.',
  },
];

export const WebsiteView: React.FC<WebsiteViewProps> = ({
  theme,
  isAuthenticated,
  pricingConfig = DEFAULT_ESTIMATOR_PRICING,
  googleProfile = null,
  googleAuthLoading = false,
  googleAuthError = null,
  userQuotesCount = 0,
  trackPrefillCode = null,
  onConsumeTrackPrefill,
  onGoogleSignIn,
  onOpenCustomerAccount,
  onToggleTheme,
  onEnterDashboard,
  onSubmitQuoteRequest,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Portfolio state
  const [portfolioFilter, setPortfolioFilter] = useState<PortfolioFilter>('all');
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);

  const estimatorOptions =
    pricingConfig.items && pricingConfig.items.length > 0
      ? pricingConfig.items
      : DEFAULT_ESTIMATOR_PRICING.items;

  // Estimator & Swatch state
  const [estTypeId, setEstTypeId] = useState<string>(estimatorOptions[0]?.id || 'cladding');
  const [estQty, setEstQty] = useState<number>(estimatorOptions[0]?.defaultQty || 5);
  const [estTier, setEstTier] = useState<'standard' | 'premium'>('standard');
  const [selectedSwatchId, setSelectedSwatchId] = useState<string>('matte-black');

  // Quote Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [projectInterest, setProjectInterest] = useState('مطبخ كلادينج / ألوميتال');
  const [profileSystem, setProfileSystem] = useState('');
  const [dimensionsText, setDimensionsText] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentDataUrl, setAttachmentDataUrl] = useState<string | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedRefCode, setSubmittedRefCode] = useState<string | null>(null);
  const [copiedRefCode, setCopiedRefCode] = useState(false);

  // Tracking lookup state
  const [trackInput, setTrackInput] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [trackingResult, setTrackingResult] = useState<QuoteTrackingResult | null>(null);

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Auto-fill quote form name & phone when signed in with Google
  useEffect(() => {
    if (!googleProfile) return;
    if (googleProfile.displayName) {
      setCustomerName((prev) => (prev.trim() ? prev : googleProfile.displayName));
    }
    if (googleProfile.phone) {
      setCustomerPhone((prev) => (prev.trim() ? prev : googleProfile.phone || ''));
    }
  }, [googleProfile]);

  const performTrackLookup = async (rawCode: string) => {
    setTrackingError(null);
    setTrackingResult(null);
    const code = rawCode.trim().toUpperCase();
    if (code.length < 4) {
      setTrackingError('أدخل رقم المتابعة مثل MT-1001');
      return;
    }

    setTrackingLoading(true);
    try {
      const res = await fetch(
        `/api/quotes/track?code=${encodeURIComponent(code)}`
      );
      const data = (await res.json()) as {
        tracking?: QuoteTrackingResult;
        error?: string;
      };
      if (!res.ok || !data.tracking) {
        setTrackingError(data.error || 'لم يتم العثور على الطلب');
      } else {
        setTrackingResult(data.tracking);
      }
    } catch {
      setTrackingError('تعذر الاتصال بالخادم حالياً.');
    } finally {
      setTrackingLoading(false);
    }
  };

  useEffect(() => {
    if (!trackPrefillCode) return;
    setTrackInput(trackPrefillCode);
    document.getElementById('track-order')?.scrollIntoView({ behavior: 'smooth' });
    void performTrackLookup(trackPrefillCode);
    onConsumeTrackPrefill?.();
  }, [trackPrefillCode, onConsumeTrackPrefill]);

  const selectedEst =
    estimatorOptions.find((opt) => opt.id === estTypeId) || estimatorOptions[0];
  const selectedSwatch =
    FINISH_SWATCHES.find((s) => s.id === selectedSwatchId) || FINISH_SWATCHES[0];
  const premiumPercent = Number.isFinite(pricingConfig.premiumIncreasePercent)
    ? pricingConfig.premiumIncreasePercent
    : 15;
  const tierMultiplier = estTier === 'premium' ? 1 + premiumPercent / 100 : 1;
  const clampedQty = Math.max(selectedEst.minQty, Math.min(selectedEst.maxQty, estQty));
  const activeUnitMinRate = Math.round(selectedEst.minRate * tierMultiplier);
  const activeUnitMaxRate = Math.round(selectedEst.maxRate * tierMultiplier);
  const estMinTotal = Math.round((clampedQty * activeUnitMinRate) / 100) * 100;
  const estMaxTotal = Math.round((clampedQty * activeUnitMaxRate) / 100) * 100;

  const filteredPortfolio =
    portfolioFilter === 'all'
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter((item) => item.filter === portfolioFilter);

  const handleEstimatorCategoryChange = (nextId: string) => {
    setEstTypeId(nextId);
    const nextOpt = estimatorOptions.find((o) => o.id === nextId);
    if (nextOpt) {
      setEstQty(nextOpt.defaultQty);
    }
  };

  const handleApplyEstimateToForm = () => {
    setProjectInterest(selectedEst.formInterest);
    const tierLabel =
      estTier === 'premium'
        ? `مستوى ممتاز (سوفت كلوز / إكسسوار مستورد +${premiumPercent}%)`
        : 'مستوى قياسي معتمد';
    const totalLabel = formatMoneyRange(estMinTotal, estMaxTotal);
    const summaryLine = `تقدير مبدئي: ${selectedEst.label} | الكمية: ${clampedQty} (${selectedEst.unitLabel}) | سعر المتر: ${formatMoneyRange(activeUnitMinRate, activeUnitMaxRate)} ج.م | اللون المفضل: ${selectedSwatch.name} | ${tierLabel} | التكلفة المتوقعة: ${totalLabel} ج.م`;
    setDimensionsText((prev) =>
      prev.trim() ? `${summaryLine}\n${prev}` : summaryLine
    );
    document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRequestSimilarFromPortfolio = (item: PortfolioItem) => {
    setProjectInterest(item.formInterest);
    setDimensionsText((prev) =>
      prev.trim()
        ? prev
        : `أرغب في طلب مقايسة وتصميم مماثل لنموذج: ${item.title} (${item.specs}) - اللون المفضل: ${selectedSwatch.name}`
    );
    setLightboxItem(null);
    document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' });
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
    setSubmittedRefCode(null);

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

    const inferredProfileType: ProfileCategory =
      /upvc|يو\s*بي\s*في\s*سي/i.test(`${projectInterest} ${cleanNotes}`)
        ? 'upvc'
        : 'aluminum';

    setSubmitting(true);
    try {
      const profileNote = profileSystem ? ` · القطاع: ${profileSystem}` : '';
      const created = (await onSubmitQuoteRequest({
        customerName: cleanName,
        customerPhone: cleanPhone,
        profileType: inferredProfileType,
        profileSystem: profileSystem || undefined,
        projectInterest,
        initialMessage: cleanNotes
          ? `طلب مقايسة من الموقع (${selectedSwatch.name}${profileNote}): ${cleanNotes}`
          : `طلب مقايسة من الموقع (مرفق صورة للمقاسات · اللون: ${selectedSwatch.name}${profileNote})`,
        attachmentName: attachmentName || undefined,
        attachmentDataUrl: attachmentDataUrl || undefined,
      })) as FacebookInquiry | undefined;

      const refCode = created?.referenceCode || 'MT-NEW';
      setSubmittedRefCode(refCode);
      if (created?.referenceCode) {
        setTrackInput(created.referenceCode);
      }
      setCustomerName('');
      setCustomerPhone('');
      setProfileSystem('');
      setDimensionsText('');
      handleRemoveAttachment();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'تعذر إرسال الطلب حالياً، حاول مرة أخرى.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyRefCode = async () => {
    if (!submittedRefCode) return;
    try {
      await navigator.clipboard.writeText(submittedRefCode);
      setCopiedRefCode(true);
      setTimeout(() => setCopiedRefCode(false), 2000);
    } catch {
      // Ignore clipboard API failure
    }
  };

  const handleTrackLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    await performTrackLookup(trackInput);
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
      {/* Formal Printable Estimate Sheet (Visible only during window.print()) */}
      <div className="hidden print:block p-8 bg-white text-slate-900" dir="rtl">
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/image_3de2cff6.png"
              alt="شعار ماجدتال"
              className="w-14 h-14 rounded-lg bg-white p-0.5 object-contain border border-slate-200 shrink-0"
            />
            <div>
              <h1 className="text-2xl font-bold">ماجدتال للألومنيوم وUPVC والمطابخ</h1>
              <p className="text-sm text-slate-600 mt-1">
                ملخص تقدير مقايسة مبدئية من الموقع الرسمي
              </p>
            </div>
          </div>
          <div className="text-left text-xs font-mono text-slate-600">
            <p>https://maged-tal.vercel.app</p>
            <p>{new Date().toLocaleDateString('ar-EG')}</p>
          </div>
        </div>
        <div className="space-y-3 text-sm border border-slate-300 rounded-lg p-5">
          <p>
            <strong>نوع العمل:</strong> {selectedEst.label}
          </p>
          <p>
            <strong>الكمية التقديرية:</strong> {clampedQty} ({selectedEst.unitLabel})
          </p>
          <p>
            <strong>اللون / التشطيب المختار:</strong> {selectedSwatch.name}
          </p>
          <p>
            <strong>مستوى الإكسسوارات:</strong>{' '}
            {estTier === 'premium' ? 'ممتاز سوفت كلوز' : 'قياسي معتمد'}
          </p>
          <p>
            <strong>سعر المتر المعتمد:</strong>{' '}
            {formatMoneyRange(activeUnitMinRate, activeUnitMaxRate)} ج.م
          </p>
          <p className="text-lg font-bold pt-3 border-t border-slate-200">
            التكلفة المتوقعة: {formatMoneyRange(estMinTotal, estMaxTotal)} ج.م
          </p>
        </div>
        <p className="mt-4 text-xs text-slate-600">
          ملاحظة: هذا التقدير استرشادي ويتأكد السعر النهائي بعد المعاينة الفعلية وتحديد نوع الزجاج والإكسسوارات.
          للتواصل: mohamedmaged_3@yahoo.com
        </p>
      </div>

      {/* Top Bar */}
      <header className="print:hidden sticky top-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
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
              <img
                src="/assets/aistudio/image_3de2cff6.png"
                alt="شعار ماجدتال"
                className="w-10 h-10 rounded-lg bg-white p-0.5 object-contain border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
              />
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
            <div className="hidden sm:block">
              <PWAInstallButton compact />
            </div>

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

            {googleProfile ? (
              <button
                type="button"
                onClick={onOpenCustomerAccount}
                className="inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {googleProfile.photoURL ? (
                  <img
                    src={googleProfile.photoURL}
                    alt={googleProfile.displayName}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="max-w-[96px] truncate hidden sm:inline">
                  {googleProfile.displayName}
                </span>
                {userQuotesCount > 0 && (
                  <span className="font-mono text-[11px] text-blue-700 dark:text-blue-400">
                    ({userQuotesCount})
                  </span>
                )}
              </button>
            ) : (
              onGoogleSignIn && (
                <button
                  type="button"
                  disabled={googleAuthLoading}
                  onClick={() => void onGoogleSignIn()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <GoogleMark className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">
                    {googleAuthLoading ? 'جاري الدخول...' : 'دخول بجوجل'}
                  </span>
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => onEnterDashboard('overview')}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isAuthenticated ? 'لوحة الإدارة' : 'بوابة الإدارة'}</span>
            </button>

            <a
              href="#quote-form"
              className="px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
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
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              {googleProfile ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    onOpenCustomerAccount?.();
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>حسابي ({googleProfile.displayName})</span>
                </button>
              ) : (
                onGoogleSignIn && (
                  <button
                    type="button"
                    disabled={googleAuthLoading}
                    onClick={() => {
                      setMobileNavOpen(false);
                      void onGoogleSignIn();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    <GoogleMark className="w-3.5 h-3.5" />
                    <span>التسجيل والدخول بحساب جوجل</span>
                  </button>
                )
              )}
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
              <PWAInstallButton compact />
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-700 dark:text-blue-400"
              >
                <span>فيسبوك</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </header>

      <main id="top" className="print:hidden flex-1">
        {/* Hero Section */}
        <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
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

            {/* 4-Column Capability Strip */}
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
                  متابعة برقم مرجعي للطلب
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  يحصل كل عميل على رقم متابعة لمعرفة حالة الطلب من التصميم حتى التسليم.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services & Profile Comparison */}
        <section id="services" className="py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="max-w-2xl mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 text-balance">
                تخصصات الورشة ومقارنة القطاعات
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                كل مرحلة في الورشة مدعومة بنظام حسابي وتصميمي مخصص لضمان ثبات القطاعات وسلاسة الحركة لعمر طويل.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                      شبابيك وأبواب ألومنيوم وUPVC عازلة (جرار · مفصلي · قلاب)
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      تنفيذ قطاعات الألومنيوم (PS صغير وكبير، التانجو والجامبو)، وقطاعات UPVC العازلة بالحام الحراري (Wintech · Pimapen · Kompen · Egepen · Adopen · Deceuninck · Rehau · Kömmerling) مع زجاج دبل جلاس لعزل الأتربة والضوضاء والحرارة.
                    </p>
                  </div>
                </div>
              </div>

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

            {/* Profile Comparison Table */}
            <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  جدول مقارنة القطاعات المعتمدة لمساعدتك في الاختيار
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">النظام / القطاع</th>
                      <th className="py-3 px-4 font-semibold">درجة العزل والمتانة</th>
                      <th className="py-3 px-4 font-semibold">الزجاج / الحشو</th>
                      <th className="py-3 px-4 font-semibold">الاستخدام الأنسب</th>
                      <th className="py-3 px-4 font-semibold whitespace-nowrap">الفئة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {PROFILE_COMPARISON.map((row) => (
                      <tr
                        key={row.name}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {row.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {row.insulation}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {row.glazing}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {row.bestUse}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-blue-700 dark:text-blue-400 whitespace-nowrap">
                          {row.tier}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Showcase Gallery with Filtering & Lightbox */}
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
                  اضغط على أي صورة للتكبير واستعراض تفاصيل الخامات والزجاج والإكسسوارات.
                </p>
              </div>

              <div
                className="flex flex-wrap items-center gap-1.5"
                role="tablist"
                aria-label="تصفية معرض الأعمال"
              >
                {(
                  [
                    { id: 'all', label: 'الكل' },
                    { id: 'kitchens', label: 'مطابخ' },
                    { id: 'windows', label: 'شبابيك' },
                    { id: 'facades', label: 'واجهات والتصنيع' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={portfolioFilter === tab.id}
                    onClick={() => setPortfolioFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      portfolioFilter === tab.id
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredPortfolio.map((item) => (
                <article
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col"
                >
                  <button
                    type="button"
                    onClick={() => setLightboxItem(item)}
                    className="group relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden text-right focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <ResilientImage
                      src={item.image}
                      alt={item.alt}
                      fallbackTitle={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900/75 text-white text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="w-3 h-3" />
                      <span>تكبير</span>
                    </span>
                  </button>
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

        {/* Interactive Quick Cost Estimator & Finish Color Swatches */}
        <section
          id="estimator"
          className="py-16 border-t border-slate-200 dark:border-slate-800"
        >
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-mono text-blue-700 dark:text-blue-400">
                        تقدير فوري مبدئي
                      </p>
                      <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        حاسبة التكلفة وكتالوج الألوان المعتمدة
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        اختر نوع العمل، حدد الأمتار واللون المفضل لمعرفة نطاق الميزانية المتوقع أو حفظ الملخص.
                      </p>
                    </div>
                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={() => onEnterDashboard('pricing')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>تعديل أسعار المتر</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      1. اختر نوع المشروع
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {estimatorOptions.map((opt) => {
                        const active = opt.id === selectedEst.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleEstimatorCategoryChange(opt.id)}
                            className={`text-right px-3.5 py-3 rounded-lg border text-xs font-medium transition-colors flex flex-col gap-1 ${
                              active
                                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 border-slate-900 dark:border-slate-100'
                                : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                            }`}
                          >
                            <span>{opt.label}</span>
                            <span
                              className={`text-[11px] font-mono tabular-nums ${
                                active
                                  ? 'text-slate-300 dark:text-slate-600'
                                  : 'text-blue-700 dark:text-blue-400'
                              }`}
                            >
                              {formatMoneyRange(opt.minRate, opt.maxRate)} ج.م / م
                            </span>
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

                  {/* Interactive Color & Material Swatches */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        4. اختر اللون / الخامة المفضلة
                      </span>
                      <span className="text-blue-700 dark:text-blue-400 font-medium">
                        {selectedSwatch.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {FINISH_SWATCHES.map((swatch) => {
                        const active = swatch.id === selectedSwatch.id;
                        return (
                          <button
                            key={swatch.id}
                            type="button"
                            onClick={() => setSelectedSwatchId(swatch.id)}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-right text-xs transition-colors ${
                              active
                                ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-slate-900 dark:text-slate-100 font-semibold'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full shrink-0 ${swatch.surfaceClass}`}
                              aria-hidden="true"
                            />
                            <span className="truncate">{swatch.name}</span>
                          </button>
                        );
                      })}
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
                      {formatMoneyRange(estMinTotal, estMaxTotal)}{' '}
                      <span className="text-sm font-sans font-semibold text-slate-600 dark:text-slate-400">
                        ج.م
                      </span>
                    </p>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                      سعر المتر:{' '}
                      <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                        {formatMoneyRange(activeUnitMinRate, activeUnitMaxRate)} ج.م
                      </strong>
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      اللون المختار: <strong>{selectedSwatch.name}</strong>
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

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة / حفظ ملخص المقايسة PDF</span>
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

        {/* Interactive Quote Form & Order Reference Tracker */}
        <section id="quote-form" className="py-16">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-5">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 text-balance">
                    اطلب مقايسة ومعاينة لمطبخك أو شبابيكك
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    أرسل المقاسات التقريبية أو صورة للمكان، وسيصل طلبك فوراً لفريق الورشة برقم متابعة خاص لبدء التصميم 3D والتسعير بدقة.
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

                {/* Public Non-PII Quote Tracking Widget */}
                <div
                  id="track-order"
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3"
                >
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    متابعة حالة طلب مقايسة
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    أدخل الرقم المرجعي الذي حصلت عليه بعد إرسال الطلب (مثال: MT-1001):
                  </p>

                  <form onSubmit={handleTrackLookup} className="flex items-center gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      value={trackInput}
                      onChange={(e) => setTrackInput(e.target.value)}
                      placeholder="MT-1001"
                      className="flex-1 px-3 py-2 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="submit"
                      disabled={trackingLoading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50 rounded-lg transition-colors shrink-0"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{trackingLoading ? 'فحص...' : 'متابعة'}</span>
                    </button>
                  </form>

                  {trackingError && (
                    <p className="text-xs text-red-700 dark:text-red-400">
                      {trackingError}
                    </p>
                  )}

                  {trackingResult && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-1">
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        الطلب{' '}
                        <span className="font-mono text-blue-700 dark:text-blue-400">
                          {trackingResult.referenceCode}
                        </span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-300">
                        {trackingResult.profileTypeLabel && (
                          <>
                            نوع القطاع:{' '}
                            <strong>
                              {trackingResult.profileTypeLabel}
                              {trackingResult.profileSystem
                                ? ` (${trackingResult.profileSystem})`
                                : ''}
                            </strong>{' '}
                            ·{' '}
                          </>
                        )}
                        الحالة: <strong>{trackingResult.statusLabel}</strong>
                      </p>
                      {trackingResult.linkedOrderStageLabel && (
                        <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                          مرحلة التنفيذ ({trackingResult.linkedOrderCode}):{' '}
                          {trackingResult.linkedOrderStageLabel}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8">
                {/* Google Account Sign-In / Connected Banner */}
                {googleProfile ? (
                  <div className="mb-5 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {googleProfile.photoURL ? (
                        <img
                          src={googleProfile.photoURL}
                          alt={googleProfile.displayName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          مسجّل الدخول باسم: {googleProfile.displayName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          سيتم حفظ طلبك تلقائياً في سجل حسابك لمتابعته في أي وقت.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenCustomerAccount}
                      className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
                    >
                      عرض حسابي وطلباتي ({userQuotesCount})
                    </button>
                  </div>
                ) : (
                  onGoogleSignIn && (
                    <div className="mb-5 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          سجّل على الموقع بحساب جوجل في ثانية واحدة
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          لتعبئة بياناتك تلقائياً وحفظ جميع طلبات المقايسة وأرقام المتابعة في حسابك.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={googleAuthLoading}
                        onClick={() => void onGoogleSignIn()}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        <GoogleMark className="w-4 h-4 shrink-0" />
                        <span>
                          {googleAuthLoading ? 'جاري التسجيل...' : 'الدخول بحساب جوجل'}
                        </span>
                      </button>
                    </div>
                  )
                )}

                {googleAuthError && (
                  <div className="mb-4 p-3 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg">
                    {googleAuthError}
                  </div>
                )}

                {submittedRefCode && (
                  <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-lg space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
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

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/70 text-xs text-emerald-900 dark:text-emerald-200">
                      <span>
                        رقم متابعة طلبك:{' '}
                        <strong className="font-mono">{submittedRefCode}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyRefCode}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-md font-medium"
                      >
                        {copiedRefCode ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>نسخ الرقم</span>
                          </>
                        )}
                      </button>
                    </div>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        نوع الطلب
                      </label>
                      <select
                        value={projectInterest}
                        onChange={(e) => {
                          setProjectInterest(e.target.value);
                          setProfileSystem('');
                        }}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="مطبخ كلادينج / ألوميتال">
                          مطبخ كلادينج / ألوميتال
                        </option>
                        <option value="شبابيك وأبواب ألومنيوم">
                          شبابيك وأبواب ألومنيوم (PS / جامبو / تانجو)
                        </option>
                        <option value="شبابيك وأبواب UPVC">
                          شبابيك وأبواب UPVC عازلة
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
                      <label
                        htmlFor="quote-profile-system"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                      >
                        اسم القطاع المفضل (اختياري)
                      </label>
                      <select
                        id="quote-profile-system"
                        value={profileSystem}
                        onChange={(e) => setProfileSystem(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">يحدد بعد المعاينة / غير محدد</option>
                        {(/upvc/i.test(projectInterest)
                          ? UPVC_PROFILE_SYSTEMS
                          : projectInterest === 'تجهيز واجهة أو شقة كاملة'
                          ? [...UPVC_PROFILE_SYSTEMS, ...ALUMINUM_PROFILE_SYSTEMS]
                          : ALUMINUM_PROFILE_SYSTEMS
                        ).map((sys) => (
                          <option key={sys.id} value={sys.name}>
                            {sys.name} ({sys.origin})
                          </option>
                        ))}
                      </select>
                    </div>
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

      {/* Portfolio Lightbox Modal */}
      {lightboxItem && (
        <div
          className="print:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-[11px] font-mono text-blue-700 dark:text-blue-400">
                  {lightboxItem.category}
                </p>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  {lightboxItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                aria-label="إغلاق المعاينة"
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 max-h-[60vh] overflow-hidden flex items-center justify-center">
              <img
                src={lightboxItem.image}
                alt={lightboxItem.alt}
                className="max-h-[60vh] w-full object-contain"
              />
            </div>

            <div className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {lightboxItem.specs}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {lightboxItem.details}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRequestSimilarFromPortfolio(lightboxItem)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <span>اطلب تصميم مماثل</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiet Editorial Footer */}
      <footer className="print:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/image_3de2cff6.png"
              alt="شعار ماجدتال"
              className="w-11 h-11 rounded-lg bg-white p-0.5 object-contain border border-slate-200 dark:border-slate-700 shrink-0"
            />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                ماجدتال للألومنيوم وUPVC والمطابخ
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                تصميم ثلاثي الأبعاد · تخصيم دقيق · تصنيع وتركيب بضمان 5 سنوات
              </p>
            </div>
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
