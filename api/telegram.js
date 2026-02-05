export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // Get secrets from Vercel Environment Variables
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
    return response.status(500).json({ error: 'Server configuration error' });
  }

  const { message } = request.body;

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const data = await telegramRes.json();
    
    if (!telegramRes.ok) {
      throw new Error(data.description || 'Telegram API Error');
    }

    return response.status(200).json({ success: true });
  } catch (error) {
    console.error("Telegram Proxy Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
