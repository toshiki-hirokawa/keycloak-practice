import { CLIENT_ID, LOGOUT_URL } from '../config'

type Props = {
  queryParams: Record<string, string>
  tokens: Record<string, unknown>
}

const logoutUrl = new URL(LOGOUT_URL)
logoutUrl.searchParams.set('post_logout_redirect_uri', 'http://localhost:8081/')
logoutUrl.searchParams.set('client_id', CLIENT_ID)

const style = `
  body {
    font-family: sans-serif;
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
    background-color: #f5f5f5;
  }
  h1 { color: #333; }
  h2 { color: #555; margin-top: 2rem; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
  table {
    width: 100%;
    border-collapse: collapse;
    background-color: white;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin-bottom: 1rem;
  }
  th, td {
    text-align: left;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
  }
  th { background-color: #4a90d9; color: white; width: 30%; }
  td { word-break: break-all; }
  .actions { display: flex; gap: 1rem; margin-top: 1.5rem; align-items: center; }
  a.back-link { color: #4a90d9; text-decoration: none; }
  a.back-link:hover { text-decoration: underline; }
  a.logout-button {
    padding: 0.5rem 1.5rem;
    background-color: #e74c3c;
    color: white;
    border-radius: 4px;
    font-size: 1rem;
    text-decoration: none;
  }
  a.logout-button:hover { background-color: #c0392b; }
`

const ParamsTable = ({ data }: { data: [string, string][] }) => (
  <table>
    {data.map(([key, value]) => (
      <tr>
        <th>{key}</th>
        <td>{value}</td>
      </tr>
    ))}
  </table>
)

export const CallbackPage = ({ queryParams, tokens }: Props) => (
  <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <title>Demo Client - ログイン結果</title>
      <style>{style}</style>
    </head>
    <body>
      <h1>ログイン結果</h1>

      <h2>URLパラメータ</h2>
      <ParamsTable data={Object.entries(queryParams)} />

      <h2>トークンレスポンス</h2>
      <a href="https://www.keycloak.org/securing-apps/oidc-layers#_token_endpoint" target="_blank">ドキュメント</a><br />
      <a href="https://www.jwt.io" target="_blank">jwtの検証</a>
      <ParamsTable data={Object.entries(tokens).map(([k, v]) => [k, String(v)])} />

      <div class="actions">
        <a class="back-link" href="/">← トップに戻る</a>
        <a class="logout-button" href={logoutUrl.toString()}>ログアウト</a>
      </div>
    </body>
  </html>
)

export const ErrorPage = ({ message }: { message: string }) => (
  <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <title>Demo Client - エラー</title>
    </head>
    <body>
      <h1>エラー</h1>
      <p>{message}</p>
      <a href="/">← トップに戻る</a>
    </body>
  </html>
)
