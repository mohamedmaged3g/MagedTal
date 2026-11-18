import crypto from 'node:crypto';
import dotenv from 'dotenv';
import express, { Express, NextFunction, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import type {
  FacebookInquiry,
  FacebookMessage,
  OrderSource,
  OrderStage,
  ToolId,
  WorkshopOrder,
} from '../src/types.ts';

dotenv.config();

const FB_PAGE_ID = process.env.FB_PAGE_ID || '61596916040640';
const FB_PAGE_URL = `https://www.facebook.com/profile.php?id=${FB_PAGE_ID}`;
const FB_VERIFY_TOKEN =
  process.env.FB_VERIFY_TOKEN || 'aluminum_workshop_webhook_verify';

const DEFAULT_ADMIN_PASSWORD = 'MagedTal@2026';
const ADMIN_PASSWORD =
  (process.env.ADMIN_PASSWORD || '').trim() || DEFAULT_ADMIN_PASSWORD;
const USING_DEFAULT_PASSWORD = !(process.env.ADMIN_PASSWORD || '').trim();
const SESSION_SECRET =
  (process.env.SESSION_SECRET || '').trim() ||
  crypto
    .createHash('sha256')
    .update(`${ADMIN_PASSWORD}_magedtal_session_secret_v1`)
    .digest('hex');
const SESSION_COOKIE_NAME = 'magedtal_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const REDIS_REST_URL = (
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  ''
)
  .trim()
  .replace(/\/$/, '');
const REDIS_REST_TOKEN = (
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  ''
).trim();
const PERSISTENT_DB_CONFIGURED = Boolean(REDIS_REST_URL && REDIS_REST_TOKEN);
const REDIS_STORE_KEY = 'magedtal:workshop:store:v1';

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'workshop-data')
  : path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'workshop.json');

interface StoreData {
  orders: WorkshopOrder[];
  inquiries: FacebookInquiry[];
  nextOrderSeq: number;
}

function normalizeStore(raw: unknown): StoreData {
  const parsed = (raw && typeof raw === 'object' ? raw : {}) as Partial<StoreData>;
  return {
    orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
    nextOrderSeq:
      typeof parsed.nextOrderSeq === 'number' ? parsed.nextOrderSeq : 101,
  };
}

function readLocalStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial: StoreData = {
        orders: [],
        inquiries: [],
        nextOrderSeq: 101,
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return normalizeStore(JSON.parse(raw));
  } catch {
    return { orders: [], inquiries: [], nextOrderSeq: 101 };
  }
}

function writeLocalStore(data: StoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Ignore storage write errors in restricted environments
  }
}

async function loadStore(): Promise<StoreData> {
  if (PERSISTENT_DB_CONFIGURED) {
    try {
      const res = await fetch(
        `${REDIS_REST_URL}/get/${encodeURIComponent(REDIS_STORE_KEY)}`,
        {
          headers: { Authorization: `Bearer ${REDIS_REST_TOKEN}` },
        }
      );
      if (res.ok) {
        const json = (await res.json()) as { result?: string | null };
        if (typeof json.result === 'string' && json.result.length > 0) {
          return normalizeStore(JSON.parse(json.result));
        }
        const seed = readLocalStore();
        await saveStore(seed);
        return seed;
      }
    } catch {
      // Fallback to file store on transient network failure
    }
  }
  return readLocalStore();
}

async function saveStore(data: StoreData): Promise<void> {
  writeLocalStore(data);
  if (PERSISTENT_DB_CONFIGURED) {
    try {
      await fetch(
        `${REDIS_REST_URL}/set/${encodeURIComponent(REDIS_STORE_KEY)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${REDIS_REST_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(JSON.stringify(data)),
        }
      );
    } catch {
      // Fallback already persisted locally
    }
  }
}

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function timingSafeMatch(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function signSessionToken(): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const nonce = crypto.randomBytes(8).toString('hex');
  const payload = Buffer.from(JSON.stringify({ exp, nonce })).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string | undefined): boolean {
  if (!token || !token.includes('.')) return false;
  const [payload, sig] = token.split('.', 2);
  if (!payload || !sig) return false;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  if (!timingSafeMatch(sig, expectedSig)) return false;
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8')
    ) as { exp?: number };
    return typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const val = part.slice(eq + 1).trim();
    if (key) {
      try {
        out[key] = decodeURIComponent(val);
      } catch {
        out[key] = val;
      }
    }
  }
  return out;
}

function extractSessionToken(req: Request): string | undefined {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    const bearer = auth.slice(7).trim();
    if (bearer) return bearer;
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_COOKIE_NAME];
}

function isAdminAuthenticated(req: Request): boolean {
  return verifySessionToken(extractSessionToken(req));
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ error: 'يلزم تسجيل الدخول لإدارة الورشة' });
    return;
  }
  next();
}

async function fetchFacebookSenderName(
  psid: string,
  accessToken: string
): Promise<string> {
  try {
    const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(
      psid
    )}?fields=name,first_name,last_name&access_token=${encodeURIComponent(
      accessToken
    )}`;
    const res = await fetch(url);
    if (!res.ok) return `عميل فيسبوك (${psid.slice(-4)})`;
    const data = (await res.json()) as {
      name?: string;
      first_name?: string;
      last_name?: string;
    };
    return (
      data.name ||
      [data.first_name, data.last_name].filter(Boolean).join(' ') ||
      `عميل فيسبوك (${psid.slice(-4)})`
    );
  } catch {
    return `عميل فيسبوك (${psid.slice(-4)})`;
  }
}

export function createApiApp(): Express {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '6mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      persistentDbConfigured: PERSISTENT_DB_CONFIGURED,
      timestamp: new Date().toISOString(),
    });
  });

  // --- Admin Auth Routes ---
  app.get('/api/auth/session', (req: Request, res: Response) => {
    res.json({
      authenticated: isAdminAuthenticated(req),
      usingDefaultPassword: USING_DEFAULT_PASSWORD,
      persistentDbConfigured: PERSISTENT_DB_CONFIGURED,
    });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { password } = req.body as { password?: string };
    if (!password || typeof password !== 'string') {
      res.status(400).json({ error: 'يرجى إدخال كلمة مرور الإدارة' });
      return;
    }

    if (!timingSafeMatch(password.trim(), ADMIN_PASSWORD)) {
      res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
      return;
    }

    const token = signSessionToken();
    const isSecure =
      req.secure || req.headers['x-forwarded-proto'] === 'https';

    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isSecure,
      maxAge: SESSION_TTL_MS,
      path: '/',
    });

    res.json({
      ok: true,
      token,
      usingDefaultPassword: USING_DEFAULT_PASSWORD,
      persistentDbConfigured: PERSISTENT_DB_CONFIGURED,
    });
  });

  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    res.json({ ok: true });
  });

  app.get('/privacy', (_req: Request, res: Response) => {
    res.type('html').send(`<!doctype html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>سياسة الخصوصية - ماجدتال</title></head>
<body style="font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.8;color:#0f172a">
  <h1>سياسة الخصوصية</h1>
  <p>تُستخدم هذه المنصة حصرياً لإدارة طلبات وأعمال ورشة الألومنيوم والمطابخ والرد على استفسارات العملاء الواردة عبر الموقع الإلكتروني أو صفحة ماجدتال على فيسبوك ماسنجر.</p>
  <p>يتم استخدام اسم العميل ورقم الهاتف وتفاصيل المقاسات وصور الموقع فقط لغرض الرد على الاستفسارات وتجهيز عروض الأسعار وأوامر الشغل، ولا تتم مشاركة أي بيانات مع أطراف خارجية.</p>
  <p>للاستفسار أو طلب حذف البيانات: <strong>mohamedmaged_3@yahoo.com</strong></p>
</body>
</html>`);
  });

  app.get('/data-deletion', (_req: Request, res: Response) => {
    res.type('html').send(`<!doctype html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>حذف بيانات المستخدم - ماجدتال</title></head>
<body style="font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.8;color:#0f172a">
  <h1>تعليمات حذف بيانات المستخدم</h1>
  <p>إذا تواصلت معنا عبر الموقع أو صفحة فيسبوك وترغب في حذف سجل محادثتك وبيانات التواصل الخاصة بك من نظام إدارة الورشة:</p>
  <ol>
    <li>أرسل رسالة إلينا عبر صفحة فيسبوك أو عبر البريد الإلكتروني: <strong>mohamedmaged_3@yahoo.com</strong> بعنوان "طلب حذف البيانات".</li>
    <li>سيتم حذف جميع الرسائل وبيانات العميل المرتبطة من قاعدة بيانات الورشة خلال 48 ساعة.</li>
  </ol>
</body>
</html>`);
  });

  // --- Orders API (Admin Protected) ---
  app.get('/api/orders', requireAdmin, async (_req: Request, res: Response) => {
    const store = await loadStore();
    const sorted = [...store.orders].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    res.json({ orders: sorted });
  });

  app.post('/api/orders', requireAdmin, async (req: Request, res: Response) => {
    const body = req.body as Partial<WorkshopOrder>;
    if (!body.clientName || !body.clientName.trim()) {
      res.status(400).json({ error: 'اسم العميل مطلوب' });
      return;
    }

    const store = await loadStore();
    const now = new Date().toISOString();
    const seq = store.nextOrderSeq;
    store.nextOrderSeq += 1;

    const newOrder: WorkshopOrder = {
      id: createId('ord'),
      code: body.code || `ALM-${seq}`,
      clientName: body.clientName.trim(),
      clientPhone: (body.clientPhone || '').trim(),
      source: (body.source as OrderSource) || 'direct',
      projectType: (body.projectType || 'مطبخ ألومنيوم').trim(),
      dimensionsNote: (body.dimensionsNote || '').trim(),
      stage: (body.stage as OrderStage) || 'design_3d',
      activeToolId: (body.activeToolId as ToolId) || 'kitchen-3d-studio',
      totalCost: Number.isFinite(Number(body.totalCost))
        ? Number(body.totalCost)
        : 0,
      paidDeposit: Number.isFinite(Number(body.paidDeposit))
        ? Number(body.paidDeposit)
        : 0,
      linkedInquiryId: body.linkedInquiryId,
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    store.orders.unshift(newOrder);

    if (newOrder.linkedInquiryId) {
      const idx = store.inquiries.findIndex(
        (inq) => inq.id === newOrder.linkedInquiryId
      );
      if (idx !== -1) {
        store.inquiries[idx].status = 'converted';
        store.inquiries[idx].linkedOrderId = newOrder.id;
        store.inquiries[idx].updatedAt = now;
      }
    }

    await saveStore(store);
    res.status(201).json({ order: newOrder });
  });

  app.patch('/api/orders/:id', requireAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as Partial<WorkshopOrder>;
    const store = await loadStore();
    const idx = store.orders.findIndex((o) => o.id === id);

    if (idx === -1) {
      res.status(404).json({ error: 'أمر الشغل غير موجود' });
      return;
    }

    const existing = store.orders[idx];
    const updated: WorkshopOrder = {
      ...existing,
      clientName:
        body.clientName !== undefined
          ? body.clientName.trim()
          : existing.clientName,
      clientPhone:
        body.clientPhone !== undefined
          ? body.clientPhone.trim()
          : existing.clientPhone,
      source: body.source ?? existing.source,
      projectType:
        body.projectType !== undefined
          ? body.projectType.trim()
          : existing.projectType,
      dimensionsNote:
        body.dimensionsNote !== undefined
          ? body.dimensionsNote.trim()
          : existing.dimensionsNote,
      stage: body.stage ?? existing.stage,
      activeToolId: body.activeToolId ?? existing.activeToolId,
      totalCost:
        body.totalCost !== undefined && Number.isFinite(Number(body.totalCost))
          ? Number(body.totalCost)
          : existing.totalCost,
      paidDeposit:
        body.paidDeposit !== undefined &&
        Number.isFinite(Number(body.paidDeposit))
          ? Number(body.paidDeposit)
          : existing.paidDeposit,
      updatedAt: new Date().toISOString(),
    };

    store.orders[idx] = updated;
    await saveStore(store);
    res.json({ order: updated });
  });

  app.delete('/api/orders/:id', requireAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const store = await loadStore();
    const before = store.orders.length;
    store.orders = store.orders.filter((o) => o.id !== id);
    if (store.orders.length === before) {
      res.status(404).json({ error: 'أمر الشغل غير موجود' });
      return;
    }
    await saveStore(store);
    res.json({ ok: true });
  });

  // --- Tool Iframe Embed Probe (Admin Protected) ---
  app.post('/api/tools/probe', requireAdmin, async (req: Request, res: Response) => {
    const { url } = req.body as { url?: string };
    if (!url || !url.startsWith('https://')) {
      res.status(400).json({ error: 'رابط غير صالح' });
      return;
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timer);

      const xFrame = (
        response.headers.get('x-frame-options') || ''
      ).toLowerCase();
      const csp = (
        response.headers.get('content-security-policy') || ''
      ).toLowerCase();

      let embeddable = true;
      let reason: string | undefined;

      if (xFrame.includes('deny') || xFrame.includes('sameorigin')) {
        embeddable = false;
        reason = `X-Frame-Options: ${xFrame}`;
      } else if (csp.includes('frame-ancestors')) {
        const match = csp.match(/frame-ancestors\s+([^;]+)/);
        const directive = match ? match[1].trim() : '';
        if (directive && !directive.includes('*')) {
          embeddable = false;
          reason = 'CSP frame-ancestors restricts embedding';
        }
      }

      res.json({
        url,
        reachable: response.ok || response.status < 500,
        embeddable,
        reason,
      });
    } catch {
      res.json({
        url,
        reachable: false,
        embeddable: true,
        reason: 'تعذر الفحص السريع، سيتم محاولة الفتح داخل الإطار',
      });
    }
  });

  // --- Facebook Page & Messenger Integration ---
  app.get('/api/facebook/status', (req: Request, res: Response) => {
    const baseUrl =
      process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL'
        ? process.env.APP_URL.replace(/\/$/, '')
        : `${req.protocol}://${req.get('host')}`;

    res.json({
      pageId: FB_PAGE_ID,
      pageUrl: FB_PAGE_URL,
      webhookUrl: `${baseUrl}/api/facebook/webhook`,
      graphApiConfigured: Boolean(process.env.FB_PAGE_ACCESS_TOKEN),
      verifyTokenConfigured: Boolean(process.env.FB_VERIFY_TOKEN),
      persistentDbConfigured: PERSISTENT_DB_CONFIGURED,
    });
  });

  // Meta Webhook Verification Endpoint
  app.get('/api/facebook/webhook', (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === FB_VERIFY_TOKEN) {
      res.status(200).send(String(challenge || ''));
      return;
    }
    res.sendStatus(403);
  });

  // Meta Webhook Event Receiver
  app.post('/api/facebook/webhook', async (req: Request, res: Response) => {
    const body = req.body as {
      object?: string;
      entry?: Array<{
        id?: string;
        messaging?: Array<{
          sender?: { id?: string };
          recipient?: { id?: string };
          timestamp?: number;
          message?: { mid?: string; text?: string; is_echo?: boolean };
        }>;
      }>;
    };

    if (body.object !== 'page') {
      res.sendStatus(404);
      return;
    }

    const store = await loadStore();
    const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;

    for (const entry of body.entry || []) {
      for (const event of entry.messaging || []) {
        const senderId = event.sender?.id;
        const messageText = event.message?.text;
        if (!senderId || !messageText || event.message?.is_echo) continue;

        const msgTime = event.timestamp
          ? new Date(event.timestamp).toISOString()
          : new Date().toISOString();

        let inquiry = store.inquiries.find((i) => i.psid === senderId);
        if (!inquiry) {
          const senderName = accessToken
            ? await fetchFacebookSenderName(senderId, accessToken)
            : `عميل فيسبوك (${senderId.slice(-4)})`;

          inquiry = {
            id: createId('inq'),
            psid: senderId,
            customerName: senderName,
            projectInterest: 'استفسار من ماسنجر فيسبوك',
            status: 'new',
            sourceType: 'webhook',
            messages: [],
            createdAt: msgTime,
            updatedAt: msgTime,
          };
          store.inquiries.unshift(inquiry);
        }

        const msgId = event.message?.mid || createId('msg');
        if (!inquiry.messages.some((m) => m.id === msgId)) {
          inquiry.messages.push({
            id: msgId,
            sender: 'customer',
            text: messageText,
            timestamp: msgTime,
          });
          inquiry.status =
            inquiry.status === 'converted' ? 'converted' : 'new';
          inquiry.updatedAt = msgTime;
        }
      }
    }

    await saveStore(store);
    res.status(200).send('EVENT_RECEIVED');
  });

  // Fetch & Sync Conversations (Admin Protected)
  app.get('/api/facebook/conversations', requireAdmin, async (_req: Request, res: Response) => {
    const store = await loadStore();
    const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
    let graphSyncError: string | null = null;

    if (accessToken) {
      try {
        const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(
          FB_PAGE_ID
        )}/conversations?fields=id,updated_time,participants,messages.limit(20){id,message,from,created_time}&limit=25&access_token=${encodeURIComponent(
          accessToken
        )}`;
        const apiRes = await fetch(url);
        const payload = (await apiRes.json()) as {
          data?: Array<{
            id: string;
            updated_time: string;
            participants?: { data?: Array<{ id: string; name?: string }> };
            messages?: {
              data?: Array<{
                id: string;
                message?: string;
                from?: { id: string; name?: string };
                created_time: string;
              }>;
            };
          }>;
          error?: { message?: string };
        };

        if (!apiRes.ok || payload.error) {
          graphSyncError =
            payload.error?.message || 'تعذر المزامنة مع Meta Graph API';
        } else if (Array.isArray(payload.data)) {
          for (const conv of payload.data) {
            const customerParticipant = conv.participants?.data?.find(
              (p) => p.id !== FB_PAGE_ID
            );
            const psid = customerParticipant?.id;
            const customerName =
              customerParticipant?.name ||
              (psid ? `عميل فيسبوك (${psid.slice(-4)})` : 'عميل فيسبوك');

            const mappedMessages: FacebookMessage[] = (
              conv.messages?.data || []
            )
              .filter((m) => Boolean(m.message))
              .map((m) => ({
                id: m.id,
                sender: (m.from?.id === FB_PAGE_ID ? 'page' : 'customer') as
                  | 'page'
                  | 'customer',
                text: m.message || '',
                timestamp: m.created_time,
              }))
              .sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              );

            const existingIdx = store.inquiries.findIndex(
              (inq) =>
                inq.conversationId === conv.id ||
                (psid !== undefined && inq.psid === psid)
            );

            if (existingIdx !== -1) {
              const existing = store.inquiries[existingIdx];
              existing.conversationId = conv.id;
              if (customerParticipant?.name) {
                existing.customerName = customerParticipant.name;
              }
              for (const msg of mappedMessages) {
                if (!existing.messages.some((m) => m.id === msg.id)) {
                  existing.messages.push(msg);
                }
              }
              existing.messages.sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              );
              existing.updatedAt = conv.updated_time || existing.updatedAt;
            } else {
              store.inquiries.unshift({
                id: createId('inq'),
                psid,
                conversationId: conv.id,
                customerName,
                projectInterest: 'محادثة صفحة فيسبوك',
                status: 'new',
                sourceType: 'graph_api',
                messages: mappedMessages,
                createdAt:
                  mappedMessages[0]?.timestamp || conv.updated_time,
                updatedAt: conv.updated_time,
              });
            }
          }
          await saveStore(store);
        }
      } catch (err) {
        graphSyncError =
          err instanceof Error ? err.message : 'خطأ في الاتصال بخوادم فيسبوك';
      }
    }

    const sorted = [...store.inquiries].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    res.json({
      inquiries: sorted,
      graphApiConfigured: Boolean(accessToken),
      graphSyncError,
    });
  });

  // Public Quote / Customer Inquiry Submission (also used by Admin Manual Add)
  app.post('/api/facebook/inquiries', async (req: Request, res: Response) => {
    const body = req.body as {
      customerName?: string;
      customerPhone?: string;
      projectInterest?: string;
      initialMessage?: string;
      attachmentName?: string;
      attachmentDataUrl?: string;
    };

    if (!body.customerName || !body.customerName.trim()) {
      res.status(400).json({ error: 'اسم العميل مطلوب' });
      return;
    }

    const hasValidAttachment =
      typeof body.attachmentDataUrl === 'string' &&
      body.attachmentDataUrl.startsWith('data:image/') &&
      body.attachmentDataUrl.length <= 5 * 1024 * 1024;

    if ((!body.initialMessage || !body.initialMessage.trim()) && !hasValidAttachment) {
      res.status(400).json({ error: 'نص رسالة العميل أو صورة المقاسات مطلوب' });
      return;
    }

    const store = await loadStore();
    const now = new Date().toISOString();

    const inquiry: FacebookInquiry = {
      id: createId('inq'),
      customerName: body.customerName.trim(),
      customerPhone: (body.customerPhone || '').trim(),
      projectInterest: (
        body.projectInterest || 'استفسار ألومنيوم / مطبخ'
      ).trim(),
      status: 'new',
      sourceType: 'manual',
      messages: [
        {
          id: createId('msg'),
          sender: 'customer',
          text: (body.initialMessage || '').trim() || 'مرفق صورة للمقاسات والتفاصيل',
          timestamp: now,
          ...(hasValidAttachment
            ? {
                attachmentName: (body.attachmentName || 'صورة المقاسات').trim(),
                attachmentDataUrl: body.attachmentDataUrl,
              }
            : {}),
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    store.inquiries.unshift(inquiry);
    await saveStore(store);
    res.status(201).json({
      inquiry: {
        id: inquiry.id,
        customerName: inquiry.customerName,
        projectInterest: inquiry.projectInterest,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
        updatedAt: inquiry.updatedAt,
        messages: inquiry.messages,
        sourceType: inquiry.sourceType,
      },
    });
  });

  // Reply to a Facebook conversation (Admin Protected)
  app.post('/api/facebook/reply', requireAdmin, async (req: Request, res: Response) => {
    const { inquiryId, text } = req.body as {
      inquiryId?: string;
      text?: string;
    };
    if (!inquiryId || !text || !text.trim()) {
      res.status(400).json({ error: 'نص الرد مطلوب' });
      return;
    }

    const store = await loadStore();
    const idx = store.inquiries.findIndex((i) => i.id === inquiryId);
    if (idx === -1) {
      res.status(404).json({ error: 'المحادثة غير موجودة' });
      return;
    }

    const inquiry = store.inquiries[idx];
    const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
    let sentViaGraphApi = false;
    let graphWarning: string | undefined;

    if (accessToken && inquiry.psid) {
      try {
        const sendRes = await fetch(
          `https://graph.facebook.com/v21.0/me/messages?access_token=${encodeURIComponent(
            accessToken
          )}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messaging_type: 'RESPONSE',
              recipient: { id: inquiry.psid },
              message: { text: text.trim() },
            }),
          }
        );
        const sendPayload = (await sendRes.json()) as {
          error?: { message?: string };
        };
        if (sendRes.ok && !sendPayload.error) {
          sentViaGraphApi = true;
        } else {
          graphWarning =
            sendPayload.error?.message ||
            'تم حفظ الرد محلياً وتعذر إرساله عبر Meta API';
        }
      } catch {
        graphWarning = 'تم حفظ الرد محلياً وتعذر الاتصال بـ Meta Graph API';
      }
    }

    const now = new Date().toISOString();
    inquiry.messages.push({
      id: createId('msg'),
      sender: 'page',
      text: text.trim(),
      timestamp: now,
    });
    if (inquiry.status === 'new') {
      inquiry.status = 'replied';
    }
    inquiry.updatedAt = now;

    store.inquiries[idx] = inquiry;
    await saveStore(store);
    res.json({ inquiry, sentViaGraphApi, graphWarning });
  });

  app.delete('/api/facebook/inquiries/:id', requireAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const store = await loadStore();
    const before = store.inquiries.length;
    store.inquiries = store.inquiries.filter((i) => i.id !== id);
    if (store.inquiries.length === before) {
      res.status(404).json({ error: 'المحادثة غير موجودة' });
      return;
    }
    await saveStore(store);
    res.json({ ok: true });
  });

  return app;
}
