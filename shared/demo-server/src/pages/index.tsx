import { AUTH_URL, CLIENT_ID, REDIRECT_URI } from '../config'

export const IndexPage = () => {
  const authUrl = new URL(AUTH_URL)
  authUrl.searchParams.set('client_id', CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'openid')

  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <title>Demo Client</title>
        <style>{`
          body {
            font-family: sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          h1 { margin-bottom: 2rem; color: #333; }
          a.login-button {
            padding: 0.75rem 2rem;
            background-color: #4a90d9;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 1rem;
          }
          a.login-button:hover { background-color: #357abd; }
        `}</style>
      </head>
      <body>
        <h1>Demo Client</h1>
        <a class="login-button" href={authUrl.toString()}>Keycloakでログイン</a>
      </body>
    </html>
  )
}
