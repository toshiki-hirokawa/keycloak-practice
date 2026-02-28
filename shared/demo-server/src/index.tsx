import { Hono } from 'hono'
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, TOKEN_URL } from './config'
import { IndexPage } from './pages/index'
import { CallbackPage, ErrorPage } from './pages/callback'

const app = new Hono()

app.get('/', (c) => {
  return c.html(<IndexPage />)
})

app.get('/callback', async (c) => {
  const code = c.req.query('code')
  const error = c.req.query('error')

  if (error != null || code == null) {
    return c.html(<ErrorPage message={error ?? 'unknown error'} />, 400)
  }

  const queryParams = Object.fromEntries(
    new URL(c.req.url).searchParams.entries()
  )

  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
    }),
  })

  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    return c.html(<ErrorPage message={text} />, 500)
  }

  const tokens = await tokenRes.json() as Record<string, unknown>
  return c.html(<CallbackPage queryParams={queryParams} tokens={tokens} />)
})

export default {
  port: 8081,
  fetch: app.fetch,
}
