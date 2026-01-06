# Keycloak SPI Development Practice

このリポジトリは Keycloak の SPI 開発を始めるうえで、必要最低限なフォルダ構成を用意したものです。
実際にチームに入り Keycloak の開発を行うまで、SPI の仕組みや Keycloak でよく行われる実装について学ぶことができます。

## 環境情報

WSL on Windows 11

```powershell
PS C:\Windows\system32> wsl --version
WSL バージョン: 2.5.7.0
カーネル バージョン: 6.6.87.1-1
WSLg バージョン: 1.0.66
MSRDC バージョン: 1.2.6074
Direct3D バージョン: 1.611.1-81528511
DXCore バージョン: 10.0.26100.1-240331-1435.ge-release
Windows バージョン: 10.0.22631.5335
```

Ubuntu for WSL

```bash
Ubuntu 24.04.2 LTS (GNU/Linux 6.6.87.1-microsoft-standard-WSL2 x86_64)
```

Docker Engine / Docker Build / Docker Compose
ログインユーザに docker グループ適用済み

```bash
$ docker --version
Docker version 28.1.1, build 4eba377
```

OpenJDK > v17

```bash
$ java --version
openjdk 21.0.7 2025-04-15
OpenJDK Runtime Environment (build 21.0.7+6-Ubuntu-0ubuntu124.04)
OpenJDK 64-Bit Server VM (build 21.0.7+6-Ubuntu-0ubuntu124.04, mixed mode, sharing)
```

Maven

```bash
$ mvn --version
Apache Maven 3.8.7
Maven home: /usr/share/maven
Java version: 21.0.7, vendor: Ubuntu, runtime: /usr/lib/jvm/java-21-openjdk-amd64
Default locale: en, platform encoding: UTF-8
OS name: "linux", version: "6.6.87.1-microsoft-standard-wsl2", arch: "amd64", family: "unix"
```

## How to Run

以下の順番で、エラーが出ずにコマンドが終了することを確認する。

```bash
## 念のため起動中のコンテナを落とす
docker compose down

cd custom-provider
mvn clean package
## 問題なく終われば BUILD SUCCESS などの文字が表示される
cd ..

docker compose up --build
```

VSCode を利用している場合、コマンドパレットから `Run Task` -> `Rebuild and Start Keycloak` でビルド・コンテナ起動まで行えます。

## Demo
### Demoの前の事前準備（Keycloak設定）
動作確認を実行可能とするために、まずKeycloak側に必要な設定を入れます。<br>
Keycloakの管理コンソール（http://localhost/auth/ ）で設定変更可能です。

- 1.動作確認環境のRealm（=設定を入れ込む領域）の作成
    - https://www.keycloak.org/docs/latest/server_admin/index.html#_configuring-realms
- 2.対象Realm上に、動作確認用の認証client（認証が必要なクライアントアプリケーション・OAuth用語だと「RP」と呼ぶ）を作成する
    - https://www.keycloak.org/docs/latest/server_admin/index.html#proc-creating-oidc-client_server_administration_guide
- 3.対象Realm上に、動作確認実際にログインを実行するためのUserの作成する
    - https://www.keycloak.org/docs/latest/server_admin/index.html#proc-creating-user_server_administration_guide

### Login Demo
`{realm}` `{client_id}` に正しいRealm名 client_idを入れて、以下URLを叩いてみてください。<br>
Keycloakのログイン画面が表示され、作成したUserの情報でログインに成功すると、`redirect_uri`で設定しているURLへと自動でリダイレクトします。
```
http://localhost/auth/realms/{realm}/protocol/openid-connect/auth
    ?client_id={client_id}
    &response_type=code
    &scope=openid
    &redirect_uri=https://www.google.com/
```
※ この時に`invalid redirect uri`というエラーログが出てログイン画面が表示できないことがあるかもしれません。
これはオープンリダイレクトという脆弱性を防ぐために`redirect_uri`として信用できる許可しているURLだけに対してリダイレクト許可を出すという作りになっているためです。
オープンリダイレクトとはどのようなものかを学習した上で、Keycloakの管理コンソールのclient設定画面からそのclientに対して`redirect_uri`の許可範囲に動作確認で使用するURLを設定する必要があります

### Logout Demo
```
http://localhost/auth/realms/EIAM/protocol/openid-connect/logout
```

### Required Action Demo
Keycloakの管理コンソールのUser画面から、対象Userにログイン実行する際の「必須アクション」（RequiredAction）を設定できます。
- https://www.keycloak.org/docs/latest/server_admin/index.html#con-required-actions_server_administration_guide

ここでは、「Update Password」のRequiredActionを設定して、次回のログイン実行時にパスワード更新処理を必須アクション（パスワード更新するまでログインできない）という状態にしてみましょう。
その後、再度 Login Demo をやり直すとパスワード更新処理へと遷移するハズです。

### Resset Credential Flow Demo
https://www.keycloak.org/docs/latest/server_admin/index.html#enabling-forgot-password

### おまけ Keycloakの設定内容によって色々な挙動を返ることができますよという話
- アカウントロック設定（何回連続でログイン失敗すると、アカウントロックがかかるか）
    - https://www.keycloak.org/docs/latest/server_admin/index.html#password-guess-brute-force-attacks
    - → アカウントロック設定を入れた上で再度Login Demoをやり直し、対象Userにアカウントロックをかけて「正しいログインIDとパスワードを入力してもログインできない状態」を作り出して見ましょう
- パスワードポリシー設定（パスワード作成時/更新時のルール）
    - https://www.keycloak.org/docs/latest/server_admin/index.html#_password-policies
    - → パスワードポリシー設定を入れた上で再度「Update Password」のRequiredActionをやり直し、ポリシーに沿わないパスワードを設定できないことを確認しましょう
- セッション＆トークンの有効期限
    - https://www.keycloak.org/docs/latest/server_admin/index.html#_timeouts
    - → ログインセッションの有効期限が切れたら、自動でログアウトされること
    - → アクセストークンの有効期限が短くなっていること（以下のAPI Demoにて確認可能）

### API Demo
### 1 Token エンドポイント（AccessTokenの取得API）
最も動作確認しやすいROPC（Resource Owner Password Credentials）フローを使用し、ユーザー名・パスワードを直接指定してアクセストークンを取得するAPI定義を利用します。<br>
※ ROPCフローはユーザーの資格情報を直接扱うため、信頼できるサーバー間通信でのみ利用することが推奨されます。（本当のプロジェクト内では「認可コードフロー」を使います）
##### HTTPメソッド
- POST
##### エンドポイント
- http://localhost/auth/realms/${realm}/protocol/openid-connect/token
##### パスパラメータ
| パラメータ | 型      | 必須 | 説明                 |
| ----- | ------ | -- | ------------------ |
| realm | string | ✓  | Keycloak の Realm 名 |
##### パスパラメータ
| ヘッダー名        | 値                                 | 必須 | 説明      |
| ------------ | --------------------------------- | -- | ------- |
| Content-Type | application/x-www-form-urlencoded | ✓  | リクエスト形式 |
##### リクエストBody
| パラメータ         | 型      | 必須 | 説明                                    |
| ------------- | ------ | - | ------------------------------------- |
| grant_type    | string | ✓ | 固定値：`password`                        |
| client_id     | string | ✓ | Keycloak に登録されたクライアントID               |
| client_secret | string | ✓  | クライアントシークレット（Confidential Client の場合） |
| username      | string | ✓ | ユーザー名                                 |
| password      | string | ✓ | パスワード                                 |
##### レスポンス確認
HTTP 200 が返却されて、`access_token`からアクセストークンを取得できること<br>
※HTTPステータスコードとは：https://developer.mozilla.org/ja/docs/Web/HTTP/Reference/Status<br>
アクセストークンはJWT形式であるため、 JWT.io（https://www.jwt.io/ja ）を利用することでアクセストークンの中身を確認可能です。ここでは有効期限`exp`を確認して見ましょう。

### 2 Token エンドポイント（AccessTokenの取得のRefresh処理）
2~4のAPIについては、API定義を自分で調べてAPI呼び出しをして見ましょう。<br>
Keycloakは、認証・認可の処理の世界標準プロトコルであるOAuthに従って作成されているため、OAuthのRefresh処理・検証処理・AccessToken利用の時のリクエスト形式のルールに従ってAPIを呼び出せば利用できます。
- http://localhost/auth/realms/${realm}/protocol/openid-connect/token
### 3 Introspect エンドポイント（AccessTokenの検証API）
- http://localhost/auth/realms/${realm}/protocol/openid-connect/token/introspect
### 4 Userinfo エンドポイント（AccessTokenを利用して、処理実行のために権限（個人情報の取得権限）が必要なAPIを呼び出す）
- http://localhost/auth/realms/${realm}/protocol/openid-connect/userinfo
