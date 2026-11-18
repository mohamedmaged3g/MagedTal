import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  FacebookInquiry,
  FacebookMessage,
  OrderSource,
  OrderStage,
  ToolId,
  WorkshopOrder,
} from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const FB_PAGE_ID = process.env.FB_PAGE_ID || '61596916040640';
const FB_PAGE_URL = `https://www.facebook.com/profile.php?id=${FB_PAGE_ID}`;
const FB_VERIFY_TOKEN =
  process.env.FB_VERIFY_TOKEN || 'aluminum_workshop_webhook_verify';

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'workshop.json');

interface StoreData {
  orders: WorkshopOrder[];
  inquiries: FacebookInquiry[];
  nextOrderSeq: number;
}

function ensureStore(): StoreData {
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
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return {
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
      nextOrderSeq: typeof parsed.nextOrderSeq === 'number' ? parsed.nextOrderSeq : 101,
    };
  } catch {
    return { orders: [], inquiries: [], nextOrderSeq: 101 };
  }
}

function saveStore(data: StoreData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

async function fetchFacebookSenderName(psid: string, accessToken: string): Promise<string> {
  try {
    const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(psid)}?fields=name,first_name,last_name&access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url);
    if (!res.ok) return `عميل فيسبوك (${psid.slice(-4)})`;
    const data = (await res.json()) as { name?: string; first_name?: string; last_name?: string };
    return data.name || [data.first_name, data.last_name].filter(Boolean).join(' ') || `عميل فيسبوك (${psid.slice(-4)})`;
  } catch {
    return `عميل فيسبوك (${psid.slice(-4)})`;
  }
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.get('/privacy', (_req: Request, res: Response) => {
    res.type('html').send(`<!doctype html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>سياسة الخصوصية - ماجدتال</title></head>
<body style="font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.8;color:#0f172a">
  <h1>سياسة الخصوصية</h1>
  <p>تُستخدم هذه المنصة حصرياً لإدارة طلبات وأعمال ورشة الألومنيوم والمطابخ والرد على استفسارات العملاء الواردة إلى صفحة ماجدتال عبر فيسبوك ماسنجر.</p>
  <p>يتم استخدام اسم العميل ونص الرسالة فقط لغرض الرد على الاستفسارات وتجهيز عروض الأسعار وأوامر الشغل، ولا تتم مشاركة أي بيانات مع أطراف خارجية.</p>
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
  <p>إذا تواصلت معنا عبر صفحة فيسبوك وترغب في حذف سجل محادثتك وبيانات التواصل الخاصة بك من نظام إدارة الورشة:</p>
  <ol>
    <li>أرسل رسالة إلينا عبر صفحة فيسبوك أو عبر البريد الإلكتروني: <strong>mohamedmaged_3@yahoo.com</strong> بعنوان "طلب حذف البيانات".</li>
    <li>سيتم حذف جميع الرسائل وبيانات العميل المرتبطة من قاعدة بيانات الورشة خلال 48 ساعة.</li>
  </ol>
</body>
</html>`);
  });

  // --- Orders API ---
  app.get('/api/orders', (_req: Request, res: Response) => {
    const store = ensureStore();
    const sorted = [...store.orders].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    res.json({ orders: sorted });
  });

  app.post('/api/orders', (req: Request, res: Response) => {
    const body = req.body as Partial<WorkshopOrder>;
    if (!body.clientName || !body.clientName.trim()) {
      res.status(400).json({ error: 'اسم العميل مطلوب' });
      return;
    }

    const store = ensureStore();
    const now = new Date().toISOString();
    const seq = store.nextOrderSeq;
    store.nextOrderSeq += 1;

    const newOrder: WorkshopOrder = {
      id: createId('ord'),
      code: `ALM-${seq}`,
      clientName: body.clientName.trim(),
      clientPhone: (body.clientPhone || '').trim(),
      source: (body.source as OrderSource) || 'direct',
      projectType: (body.projectType || 'مطبخ ألومنيوم').trim(),
      dimensionsNote: (body.dimensionsNote || '').trim(),
      stage: (body.stage as OrderStage) || 'design_3d',
      activeToolId: (body.activeToolId as ToolId) || 'kitchen-3d-studio',
      totalCost: Number.isFinite(Number(body.totalCost)) ? Number(body.totalCost) : 0,
      paidDeposit: Number.isFinite(Number(body.paidDeposit)) ? Number(body.paidDeposit) : 0,
      linkedInquiryId: body.linkedInquiryId,
      createdAt: now,
      updatedAt: now,
    };

    store.orders.unshift(newOrder);

    if (newOrder.linkedInquiryId) {
      const idx = store.inquiries.findIndex((inq) => inq.id === newOrder.linkedInquiryId);
      if (idx !== -1) {
        store.inquiries[idx].status = 'converted';
        store.inquiries[idx].linkedOrderId = newOrder.id;
        store.inquiries[idx].updatedAt = now;
      }
    }

    saveStore(store);
    res.status(201).json({ order: newOrder });
  });

  app.patch('/api/orders/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as Partial<WorkshopOrder>;
    const store = ensureStore();
    const idx = store.orders.findIndex((o) => o.id === id);

    if (idx === -1) {
      res.status(404).json({ error: 'أمر الشغل غير موجود' });
      return;
    }

    const existing = store.orders[idx];
    const updated: WorkshopOrder = {
      ...existing,
      clientName: body.clientName !== undefined ? body.clientName.trim() : existing.clientName,
      clientPhone: body.clientPhone !== undefined ? body.clientPhone.trim() : existing.clientPhone,
      source: body.source ?? existing.source,
      projectType: body.projectType !== undefined ? body.projectType.trim() : existing.projectType,
      dimensionsNote:
        body.dimensionsNote !== undefined ? body.dimensionsNote.trim() : existing.dimensionsNote,
      stage: body.stage ?? existing.stage,
      activeToolId: body.activeToolId ?? existing.activeToolId,
      totalCost:
        body.totalCost !== undefined && Number.isFinite(Number(body.totalCost))
          ? Number(body.totalCost)
          : existing.totalCost,
      paidDeposit:
        body.paidDeposit !== undefined && Number.isFinite(Number(body.paidDeposit))
          ? Number(body.paidDeposit)
          : existing.paidDeposit,
      updatedAt: new Date().toISOString(),
    };

    store.orders[idx] = updated;
    saveStore(store);
    res.json({ order: updated });
  });

  app.delete('/api/orders/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const store = ensureStore();
    const before = store.orders.length;
    store.orders = store.orders.filter((o) => o.id !== id);
    if (store.orders.length === before) {
      res.status(404).json({ error: 'أمر الشغل غير موجود' });
      return;
    }
    saveStore(store);
    res.json({ ok: true });
  });

  // --- Tool Iframe Embed Probe ---
  app.post('/api/tools/probe', async (req: Request, res: Response) => {
    const { url } = req.body as { url?: string };
    if (!url || !url.startsWith('https://')) {
      res.status(400).json({ error: 'رابط غير صالح' });
      return;
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timer);

      const xFrame = (response.headers.get('x-frame-options') || '').toLowerCase();
      const csp = (response.headers.get('content-security-policy') || '').toLowerCase();

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
          reason = `CSP frame-ancestors restricts embedding`;
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

    const store = ensureStore();
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
          inquiry.status = inquiry.status === 'converted' ? 'converted' : 'new';
          inquiry.updatedAt = msgTime;
        }
      }
    }

    saveStore(store);
    res.status(200).send('EVENT_RECEIVED');
  });

  // Fetch & Sync Conversations (combines Graph API if token configured + local webhook/manual records)
  app.get('/api/facebook/conversations', async (_req: Request, res: Response) => {
    const store = ensureStore();
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
          graphSyncError = payload.error?.message || 'تعذر المزامنة مع Meta Graph API';
        } else if (Array.isArray(payload.data)) {
          for (const conv of payload.data) {
            const customerParticipant = conv.participants?.data?.find(
              (p) => p.id !== FB_PAGE_ID
            );
            const psid = customerParticipant?.id;
            const customerName =
              customerParticipant?.name || (psid ? `عميل فيسبوك (${psid.slice(-4)})` : 'عميل فيسبوك');

            const mappedMessages: FacebookMessage[] = (conv.messages?.data || [])
              .filter((m) => Boolean(m.message))
              .map((m) => ({
                id: m.id,
                sender: (m.from?.id === FB_PAGE_ID ? 'page' : 'customer') as 'page' | 'customer',
                text: m.message || '',
                timestamp: m.created_time,
              }))
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            const existingIdx = store.inquiries.findIndex(
              (inq) =>
                inq.conversationId === conv.id || (psid !== undefined && inq.psid === psid)
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
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
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
                createdAt: mappedMessages[0]?.timestamp || conv.updated_time,
                updatedAt: conv.updated_time,
              });
            }
          }
          saveStore(store);
        }
      } catch (err) {
        graphSyncError =
          err instanceof Error ? err.message : 'خطأ في الاتصال بخوادم فيسبوك';
      }
    }

    const sorted = [...store.inquiries].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    res.json({
      inquiries: sorted,
      graphApiConfigured: Boolean(accessToken),
      graphSyncError,
    });
  });

  // Log a customer inquiry from Facebook Messenger manually
  app.post('/api/facebook/inquiries', (req: Request, res: Response) => {
    const body = req.body as {
      customerName?: string;
      customerPhone?: string;
      projectInterest?: string;
      initialMessage?: string;
    };

    if (!body.customerName || !body.customerName.trim()) {
      res.status(400).json({ error: 'اسم العميل مطلوب' });
      return;
    }
    if (!body.initialMessage || !body.initialMessage.trim()) {
      res.status(400).json({ error: 'نص رسالة العميل مطلوب' });
      return;
    }

    const store = ensureStore();
    const now = new Date().toISOString();

    const inquiry: FacebookInquiry = {
      id: createId('inq'),
      customerName: body.customerName.trim(),
      customerPhone: (body.customerPhone || '').trim(),
      projectInterest: (body.projectInterest || 'استفسار ألومنيوم / مطبخ').trim(),
      status: 'new',
      sourceType: 'manual',
      messages: [
        {
          id: createId('msg'),
          sender: 'customer',
          text: body.initialMessage.trim(),
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    store.inquiries.unshift(inquiry);
    saveStore(store);
    res.status(201).json({ inquiry });
  });

  // Reply to a Facebook conversation (sends via Graph API if PSID + token exist)
  app.post('/api/facebook/reply', async (req: Request, res: Response) => {
    const { inquiryId, text } = req.body as { inquiryId?: string; text?: string };
    if (!inquiryId || !text || !text.trim()) {
      res.status(400).json({ error: 'نص الرد مطلوب' });
      return;
    }

    const store = ensureStore();
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
        const sendPayload = (await sendRes.json()) as { error?: { message?: string } };
        if (sendRes.ok && !sendPayload.error) {
          sentViaGraphApi = true;
        } else {
          graphWarning =
            sendPayload.error?.message || 'تم حفظ الرد محلياً وتعذر إرساله عبر Meta API';
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
    saveStore(store);
    res.json({ inquiry, sentViaGraphApi, graphWarning });
  });

  app.delete('/api/facebook/inquiries/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const store = ensureStore();
    const before = store.inquiries.length;
    store.inquiries = store.inquiries.filter((i) => i.id !== id);
    if (store.inquiries.length === before) {
      res.status(404).json({ error: 'المحادثة غير موجودة' });
      return;
    }
    saveStore(store);
    res.json({ ok: true });
  });

  // --- Vite / Static Frontend Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aluminum Workshop Hub running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
