# Keycloak SPI Development Practice

このリポジトリは Keycloak の SPI 開発を始めるうえで、必要最低限なフォルダ構成を用意したものです。  
実際にチームに入り Keycloak の開発を行うまで、SPI の仕組みや Keycloak でよく行われる実装について学ぶことができます。  

- [Keycloak SPI Development Practice](#keycloak-spi-development-practice)
  - [環境情報](#環境情報)
  - [How to Run](#how-to-run)
  - [Keycloak Main Demo](#keycloak-main-demo)
    - [事前準備(Keycloak設定)](#事前準備keycloak設定)
    - [Login Demo](#login-demo)
    - [Logout Demo](#logout-demo)
    - [Required Action Demo](#required-action-demo)
    - [Resset Credential Flow Demo](#resset-credential-flow-demo)
    - [その他 Demo](#その他-demo)
  - [Keycloak API Demo](#keycloak-api-demo)
    - [1. Token エンドポイント(AccessTokenの取得API)](#1-token-エンドポイントaccesstokenの取得api)
      - [HTTPメソッド](#httpメソッド)
      - [エンドポイント](#エンドポイント)
      - [Path Parameter](#path-parameter)
      - [Request Header](#request-header)
      - [Request Body](#request-body)
      - [Expected Response](#expected-response)
    - [2. Token エンドポイント(AccessTokenの取得のRefresh処理)](#2-token-エンドポイントaccesstokenの取得のrefresh処理)
    - [3. Introspect エンドポイント(AccessTokenの検証API)](#3-introspect-エンドポイントaccesstokenの検証api)
    - [4. Userinfo エンドポイント(AccessTokenを利用して、処理実行のために権限(個人情報の取得権限)が必要なAPIを呼び出す)](#4-userinfo-エンドポイントaccesstokenを利用して処理実行のために権限個人情報の取得権限が必要なapiを呼び出す)

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

## Keycloak Main Demo

### 事前準備(Keycloak設定)

動作確認を行うために、まずKeycloak側に必要な設定を入れます。  
Keycloakの管理コンソール [http://localhost/auth/](http://localhost:8080/) で設定変更可能です。  

1. 動作確認環境のRealm(=設定を入れ込む領域)の作成  
  ドキュメント: [Configuring realms](https://www.keycloak.org/docs/latest/server_admin/index.html#_configuring-realms)
2. 作成したRealm上に、動作確認用の認証client(認証が必要なクライアントアプリケーション・OAuth用語だと「RP」と呼ぶ)を作成する  
  ドキュメント: [Creating an OpenID Connect client](https://www.keycloak.org/docs/latest/server_admin/index.html#proc-creating-oidc-client_server_administration_guide)
3. 作成したRealm上に、動作確認実際にログインを実行するためのUserの作成する  
  ドキュメント: [Creating users](https://www.keycloak.org/docs/latest/server_admin/index.html#proc-creating-user_server_administration_guide)

### Login Demo

`${realm}` `${client_id}` に作成したRealm名とclient名を入れて、以下URLを叩いてみてください。  
Keycloakのログイン画面が表示され、作成したUserの情報でログインに成功すると、`redirect_uri` で設定しているURLへと自動でリダイレクトします。  

```txt
http://localhost:8080/realms/${realm}/protocol/openid-connect/auth
    ?client_id={client_id}
    &response_type=code
    &scope=openid
    &redirect_uri=https://www.google.com/
```

> [!IMPORTANT]  
> この時に `invalid redirect uri` というエラーログが出てログイン画面が表示できないことがあるかもしれません。  
> これはオープンリダイレクトという脆弱性を防ぐために、 `redirect_uri` として信用できる(=許可された)URLだけに対してリダイレクト許可を出すという作りになっているためです。  
> オープンリダイレクトとはどのようなものかを学習した上で、Keycloakの管理コンソールのclient設定画面から作成したclientに対して `redirect_uri` の許可範囲に動作確認で使用するURLを設定する必要があります

### Logout Demo

```txt
http://localhost:8080/realms/${realm}/protocol/openid-connect/logout
```

### Required Action Demo

Keycloakの管理コンソールのUser画面から、対象Userがログイン実行する際の「必須アクション」(RequiredAction)を設定できます。  
「必須アクション」とは、そのアクションを完了するまでログインできない状態にするアクションのことです。  
ドキュメント: [Defining actions required at login](https://www.keycloak.org/docs/latest/server_admin/index.html#con-required-actions_server_administration_guide)

ここでは、「Update Password」のRequiredActionを設定して、次回のログイン実行時にパスワード更新処理を必須アクション(=パスワード更新するまでログインできない状態)してみましょう。  
その後、再度 [Login Demo](#login-demo) をやり直すとパスワード更新処理へと遷移するハズです。  

### Resset Credential Flow Demo

ドキュメント: [Enabling forgot password](https://www.keycloak.org/docs/latest/server_admin/index.html#enabling-forgot-password)  

### その他 Demo

> [!TIP]
> Keycloakの設定内容によって色々な挙動を変えることができます。

- アカウントロック設定(何回連続でログイン失敗すると、アカウントロックがかかるか)  
  - ドキュメント: [Brute force attacks](https://www.keycloak.org/docs/latest/server_admin/index.html#password-guess-brute-force-attacks)
  - アカウントロック設定を入れた上で再度 [Login Demo](#login-demo) をやり直し、対象Userにアカウントロックをかけて「正しいログインIDとパスワードを入力してもログインできない状態」を作り出して見ましょう
- パスワードポリシー設定(パスワード作成時/更新時のルール)
  - ドキュメント: [Password policies](https://www.keycloak.org/docs/latest/server_admin/index.html#_password-policies)
  - パスワードポリシー設定を入れた上で再度「Update Password」のRequiredActionをやり直し、ポリシーに沿わないパスワードを設定できないことを確認しましょう
- セッション＆トークンの有効期限
  - ドキュメント: [Session and token timeouts](https://www.keycloak.org/docs/latest/server_admin/index.html#_timeouts)
  - ログインセッションの有効期限が切れたら、自動でログアウトされること
  - アクセストークンの有効期限が短くなっていること(以下のAPI Demoにて確認可能)

## Keycloak API Demo

### 1. Token エンドポイント(AccessTokenの取得API)

最も動作確認しやすいROPC(Resource Owner Password Credentials)フローを使用し、ユーザー名・パスワードを直接指定してアクセストークンを取得するAPI定義を利用します。  

> [!IMPORTANT]
> ROPCフローはユーザーの資格情報を直接扱うため、信頼できるサーバー間通信でのみ利用することが推奨されます。(本当のプロジェクト内では「認可コードフロー」を使います)  

#### HTTPメソッド

POST

#### エンドポイント

```txt
http://localhost:8080/realms/${realm}/protocol/openid-connect/token
```

#### Path Parameter

| Parameter | Type   | Required | Description             |
| --------- | ------ | -------- | ----------------------- |
| realm     | string | Yes      | Realm name for Keycloak |

#### Request Header

| Header       | Value                             | Required | Description    |
| ------------ | --------------------------------- | -------- | -------------- |
| Content-Type | application/x-www-form-urlencoded | Yes      | Request Format |

#### Request Body

| Parameter     | Type   | Required | Description                                      |
| ------------- | ------ | -------- | ------------------------------------------------ |
| grant_type    | string | Yes      | Fixed Value：`password`                          |
| client_id     | string | Yes      | Client Id registered in Keycloak                 |
| client_secret | string | No       | Client Secret (Required for Confidential Client) |
| username      | string | Yes      | User name                                        |
| password      | string | Yes      | Password                                         |

#### Expected Response

HTTP 200 で返却されて、 `access_token` からアクセストークンを取得できること

> [!IMPORTANT]  
> HTTPステータスコードとは: [HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)  
> アクセストークンはJWT形式であるため、 [JWT.io](https://www.jwt.io/ja) を利用することでアクセストークンの中身を確認可能です。  
> ここでは有効期限`exp`を確認して見ましょう。  

### 2. Token エンドポイント(AccessTokenの取得のRefresh処理)

2~4のAPIについては、API定義を自分で調べてAPI呼び出しをしてみましょう。  
Keycloakは、認証・認可の処理の世界標準プロトコルであるOAuthに従って作成されているため、OAuthのRefresh処理・検証処理・AccessToken利用の時のリクエスト形式のルールに従ってAPIを呼び出せば利用できます。  

```txt
http://localhost:8080/realms/${realm}/protocol/openid-connect/token
```

### 3. Introspect エンドポイント(AccessTokenの検証API)

```txt
http://localhost:8080/realms/${realm}/protocol/openid-connect/token/introspect
```

### 4. Userinfo エンドポイント(AccessTokenを利用して、処理実行のために権限(個人情報の取得権限)が必要なAPIを呼び出す)

```txt
http://localhost:8080/realms/${realm}/protocol/openid-connect/userinfo
```
