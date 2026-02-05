export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = request.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("ADMIN_PASSWORD is not set in Vercel Environment Variables");
    return response.status(500).json({ error: 'Server configuration error' });
  }

  if (password === adminPassword) {
    return response.status(200).json({ success: true });
  } else {
    // Add a small delay to prevent brute force timing attacks
    await new Promise(resolve => setTimeout(resolve, 500));
    return response.status(401).json({ error: 'Invalid password' });
  }
}