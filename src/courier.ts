interface CourierSendResult {
  requestId: string | null;
}

export async function sendCourierEmail(
  token: string,
  templateId: string,
  to: string,
  recipientName: string,
  source: string,
): Promise<CourierSendResult> {
  const response = await fetch('https://api.courier.com/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        to: { email: to },
        template: templateId,
        data: { recipientName, source },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Courier send failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { requestId?: string };
  return { requestId: data.requestId ?? null };
}
