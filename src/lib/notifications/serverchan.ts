export async function sendServerChanMessage(
  sendkey: string,
  title: string,
  desp: string
): Promise<{ success: boolean; error?: string }> {
  const url = `https://sctapi.ftqq.com/${sendkey}.send`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, desp }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { success: false, error: `ServerChan API error: ${res.status} ${body}` };
  }

  try {
    const body = await res.json();
    if (body.code !== 0 && body.errno !== 0) {
      return { success: false, error: body.errmsg ?? body.message ?? "ServerChan unknown error" };
    }
  } catch {
    // Response is not JSON, treat as success if HTTP status was ok
  }

  return { success: true };
}
