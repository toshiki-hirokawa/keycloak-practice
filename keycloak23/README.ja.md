# keycloak23

Keycloakのカスタム Required Action およびテーマ開発のための練習環境です。  
Keycloak 23 をベースにしており、SPI実装にはKotlinを使用しています。

- [keycloak23](#keycloak23)
  - [ディレクトリ構成](#ディレクトリ構成)
  - [前提条件](#前提条件)
    - [コンテナランタイム](#コンテナランタイム)
    - [mise](#mise)
  - [起動](#起動)
  - [ビルド](#ビルド)
  - [停止](#停止)
  - [動作確認](#動作確認)
    - [Keycloak 管理コンソール](#keycloak-管理コンソール)
    - [デモクライアント](#デモクライアント)
    - [カスタム Required Action](#カスタム-required-action)
  - [Keycloak Main Demo](#keycloak-main-demo)
    - [Required Action Demo](#required-action-demo)
    - [Reset Credential Flow Demo](#reset-credential-flow-demo)
    - [その他 Demo](#その他-demo)
      - [アカウントロック設定（Brute Force Protection）](#アカウントロック設定brute-force-protection)
      - [パスワードポリシー設定](#パスワードポリシー設定)
      - [セッション＆トークンの有効期限](#セッショントークンの有効期限)
  - [Keycloak API Demo](#keycloak-api-demo)
    - [1. Token エンドポイント — アクセストークンの取得（ROPCフロー）](#1-token-エンドポイント--アクセストークンの取得ropcフロー)
    - [2. Token エンドポイント — アクセストークンのリフレッシュ](#2-token-エンドポイント--アクセストークンのリフレッシュ)
    - [3. Introspect エンドポイント — アクセストークンの検証](#3-introspect-エンドポイント--アクセストークンの検証)
    - [4. Userinfo エンドポイント — ユーザー情報の取得](#4-userinfo-エンドポイント--ユーザー情報の取得)

## ディレクトリ構成

```txt
/
├── keycloak23/                          # Keycloak v23 練習環境
│   ├── keycloak/                        # KeycloakコンテナおよびSPI拡張
│   │   ├── keycloak-providers/          # Keycloak SPI用 Mavenマルチモジュールプロジェクト
│   │   │   ├── custom-provider/         # カスタムRequired Action実装 (Kotlin)
│   │   │   ├── custom-theme/            # カスタムログインテーマ (FTL, CSS, JS)
│   │   │   └── pom.xml                  # プロバイダー用親POM
│   │   ├── Dockerfile                   # プロバイダーを同梱したKeycloakイメージ
│   │   ├── realm-export.json            # Keycloak管理コンソールからエクスポートしたレルム設定
│   │   │                                # 独自のエクスポートファイルに差し替えることで設定を反映できる
│   │   └── pom.xml                      # Keycloakモジュール用POM
│   ├── docker-compose.yml               # keycloak, demo-server, setupを起動
│   ├── .mise.toml                       # JavaおよびMavenのバージョン設定
│   ├── mvnw / mvnw.cmd                  # Maven Wrapper（ローカルへのMavenインストール不要）
│   └── pom.xml                          # プロジェクト全体のルートPOM
└── shared/                              # keycloak23とkeycloak26で共有するリソース
    ├── demo-server/                     # ログインフロー確認用デモクライアント (Bun + Hono)
    └── scripts/                         # Keycloak起動後に実行されるセットアップスクリプト
                                         # テストユーザの作成とクライアントシークレットの固定化を行う
```

## 前提条件

Ubuntu 24.04で動作確認済みです。WSLでも動作するはずです。

### コンテナランタイム

DockerまたはPodmanのどちらかを選択してください。  
Docker Desktopをインストールしている場合、Docker Engineを手動でインストールする必要はありません。

- [Docker](https://docs.docker.com/engine/install/ubuntu/)
  - [Docker Compose](https://docs.docker.com/compose/install/#plugin-linux-only)
- [Podman](https://podman.io/docs/installation#ubuntu)
  - [podman-compose](https://github.com/containers/podman-compose?tab=readme-ov-file#package-repositories)

### mise

[mise をインストール](https://mise.jdx.dev/installing-mise.html#installing-mise) し、`keycloak23/` ディレクトリで以下を実行してください。

```bash
mise trust
mise install
```

`.mise.toml` に記載された必要なツールがインストールされます。

## 起動

`keycloak23` ディレクトリで以下を実行してください。

```bash
mise run dev
```

以下のJARファイルが生成されます。

- `keycloak/keycloak-providers/custom-provider/target/keycloak-custom-provider.jar`
- `keycloak/keycloak-providers/custom-theme/target/keycloak-custom-theme.jar`

ビルドのみ実行したい場合は [ビルド](#ビルド) を参照してください。

次に、以下のサービスが起動します。

| サービス    | URL                     | 説明                          |
| ----------- | ----------------------- | ----------------------------- |
| keycloak    | <http://localhost:8080> | Keycloak 23                   |
| demo-server | <http://localhost:8081> | デモクライアント (Bun + Hono) |
| setup       | -                       | 初期セットアップスクリプト    |

起動時に以下が自動で実行されます。

- `realm-export.json` のインポートによる `sample_realm` の作成
- `sample-client` のシークレット固定化
- テストユーザの作成

## ビルド

Keycloakプロバイダー用のJARファイルのみビルドします。

```bash
mise run build
```

## 停止

```bash
mise run stop
```

この環境はステートレスであり、次回の `mise run dev` 時に完全にリセットされます。

## 動作確認

### Keycloak 管理コンソール

<http://localhost:8080/admin> に以下の認証情報でログインしてください。

- ユーザ名: `admin`
- パスワード: `admin`

`sample_realm` が作成され、以下が設定されていることを確認してください。

- **Clients**: `sample-client` が存在する
- **Authentication > Required Actions**: `Sample Required Action` が有効になっている
- **Realm settings > Themes**: ログインテーマが `custom-theme` に設定されている

### デモクライアント

スクリプトにより、以下の2名のテストユーザが自動で登録されます。

| ユーザ名 | パスワード |
| -------- | ---------- |
| alice    | aaaaa11111 |
| bob      | bbbbb22222 |

1. <http://localhost:8081> にアクセス
2. **Keycloakでログイン** をクリック
3. 上記のテストユーザのいずれかでログイン
4. ログイン後、コールバック画面にURLパラメータとトークンレスポンスが表示されることを確認
5. **ログアウト** をクリックしてトップページに戻ることを確認

### カスタム Required Action

カスタムRequired Actionを確認するには、

1. 管理コンソールで `sample_realm` > **Users** を開く
2. ユーザを選択し、**Required User Actions** に `Sample Required Action` を追加
3. デモクライアントからそのユーザでログイン
4. カスタムFTL画面が表示され、入力した値が `sample_attribute` に保存されることを確認

## Keycloak Main Demo

### Required Action Demo

Keycloakの管理コンソールのUser画面から、対象ユーザがログインする際の **必須アクション（Required Action）** を設定できます。  
必須アクションとは、そのアクションを完了するまでログインできない状態にするアクションのことです。

参考: [Defining actions required at login](https://www.keycloak.org/docs/latest/server_admin/index.html#con-required-actions_server_administration_guide)

**試してみるには？**

1. 管理コンソールで `sample_realm` > **Users** を開き、対象ユーザを選択
2. **Required User Actions** に **Update Password** を追加
3. デモクライアントからそのユーザでログイン
4. ログイン完了前にパスワード更新画面にリダイレクトされることを確認

### Reset Credential Flow Demo

ログイン画面の「パスワードを忘れた場合」リンクから、ユーザがメール経由でパスワードをリセットできます。

参考: [Enabling forgot password](https://www.keycloak.org/docs/latest/server_admin/index.html#enabling-forgot-password)

**試してみるには？**

1. 管理コンソールで `sample_realm` > **Realm settings** > **Login** を開く
2. **Forgot password** を有効化
3. ログアウトし、ログイン画面の「パスワードを忘れた場合」をクリック
4. パスワードリセットフローが起動することを確認

### その他 Demo

> [!TIP]
> Keycloakの設定内容によってさまざまな挙動を変えることができます。

#### アカウントロック設定（Brute Force Protection）

何回連続でログインに失敗するとアカウントロックがかかるかを設定できます。  
参考: [Brute force attacks](https://www.keycloak.org/docs/latest/server_admin/index.html#password-guess-brute-force-attacks)  
アカウントロック設定を有効にした上で何度かログインを失敗し、正しい認証情報を入力してもログインできない状態を確認してみましょう。

#### パスワードポリシー設定

パスワード作成・更新時に適用するルールを定義できます。  
参考: [Password policies](https://www.keycloak.org/docs/latest/server_admin/index.html#_password-policies)  
パスワードポリシーを設定した上で**Update Password**のRequired Actionを再度実行し、ポリシーに沿わないパスワードが設定できないことを確認してみましょう。

#### セッション＆トークンの有効期限

ログインセッションやトークンの有効期限を設定できます。  
参考: [Session and token timeouts](https://www.keycloak.org/docs/latest/server_admin/index.html#_timeouts)

- セッションの有効期限を短くして、期限切れ後に自動でログアウトされることを確認してみましょう
- アクセストークンの有効期限を短くして、デモクライアントのコールバック画面のトークンレスポンスに反映されることを確認してみましょう

## Keycloak API Demo

このセクションでは、curlやPostman、InsomniaなどのHTTPクライアントを使ってKeycloakのOIDCエンドポイントを実際に呼び出す練習を行います。  
参考: [Keycloak OIDC endpoints](https://www.keycloak.org/securing-apps/oidc-layers)

---

### 1. Token エンドポイント — アクセストークンの取得（ROPCフロー）

ROPC（Resource Owner Password Credentials）フローは、ユーザー名とパスワードを直接指定してアクセストークンを取得する方法です。最も手軽に動作確認できるフローです。

> [!IMPORTANT]
> ROPCフローはユーザーの資格情報を直接扱うため、信頼できるサーバー間通信でのみ利用することが推奨されます。
> 実際のプロジェクトでは「認可コードフロー」を使います。

**メソッド:** `POST`

**エンドポイント:**

```txt
http://localhost:8080/realms/{realm}/protocol/openid-connect/token
```

**パスパラメータ:**

| パラメータ | 型     | 必須 | 説明               |
| ---------- | ------ | ---- | ------------------ |
| realm      | string | Yes  | Keycloakのレルム名 |

**リクエストヘッダー:**

| ヘッダー     | 値                                | 必須 | 説明           |
| ------------ | --------------------------------- | ---- | -------------- |
| Content-Type | application/x-www-form-urlencoded | Yes  | リクエスト形式 |

**リクエストボディ:**

| パラメータ    | 型     | 必須 | 説明                                                        |
| ------------- | ------ | ---- | ----------------------------------------------------------- |
| grant_type    | string | Yes  | 固定値: `password`                                          |
| client_id     | string | Yes  | Keycloakに登録されたクライアントID                          |
| client_secret | string | No   | クライアントシークレット（Confidential Clientの場合は必須） |
| username      | string | Yes  | ユーザー名                                                  |
| password      | string | Yes  | パスワード                                                  |

**curl実行例:**

```bash
curl -X POST http://localhost:8080/realms/sample_realm/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=sample-client" \
  -d "client_secret=sample-secret-****************" \
  -d "username=alice" \
  -d "password=aaaaa11111"
```

**期待するレスポンス:** HTTP 200でレスポンスボディの `access_token` にアクセストークンが含まれていること。

> [!TIP]
> アクセストークンはJWT形式です。[jwt.io](https://jwt.io/ja) を使ってトークンの中身を確認できます。
> `exp` クレームを確認してトークンの有効期限を確かめてみましょう。
> 参考: [HTTP レスポンスステータスコード](https://developer.mozilla.org/ja/docs/Web/HTTP/Reference/Status)

---

### 2. Token エンドポイント — アクセストークンのリフレッシュ

手順1で取得した `refresh_token` を使って、ユーザー名・パスワードを再入力することなく新しいアクセストークンを取得します。  
KeycloakはOAuth 2.0標準に準拠しているため、OAuthのリフレッシュトークンリクエストの形式に従ってAPIを呼び出せます。  
リクエスト形式を自分で調べてエンドポイントを呼び出してみましょう。

**メソッド:** `POST`

**エンドポイント:**

```txt
http://localhost:8080/realms/{realm}/protocol/openid-connect/token
```

**ヒント:** `grant_type` を `refresh_token` にして、手順1で取得した `refresh_token` の値を含めてください。  
参考: [RFC 6749 - Refreshing an Access Token](https://datatracker.ietf.org/doc/html/rfc6749#section-6)

---

### 3. Introspect エンドポイント — アクセストークンの検証

アクセストークンが有効かどうかを検証し、そのメタデータを取得します。

**メソッド:** `POST`

**エンドポイント:**

```txt
http://localhost:8080/realms/{realm}/protocol/openid-connect/token/introspect
```

**ヒント:** `token` パラメータにアクセストークンを含め、`client_id` と `client_secret` で認証してください。  
参考: [RFC 7662 - OAuth 2.0 Token Introspection](https://datatracker.ietf.org/doc/html/rfc7662)

---

### 4. Userinfo エンドポイント — ユーザー情報の取得

有効なアクセストークンを使ってユーザーのプロフィール情報を取得します。`openid` スコープを含むトークンが必要です。

**メソッド:** `GET` または `POST`

**エンドポイント:**

```txt
http://localhost:8080/realms/{realm}/protocol/openid-connect/userinfo
```

**ヒント:** `Authorization` ヘッダーにアクセストークンをBearerトークンとして渡してください。  
参考: [OpenID Connect Core - UserInfo Endpoint](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)
