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

  return { success: true };
}
