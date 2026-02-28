# keycloak23

Practice environment for Keycloak custom Required Action and theme development.  
This environment is based on Keycloak 23 and uses Kotlin for SPI implementation.

- [keycloak23](#keycloak23)
  - [Directory Structure](#directory-structure)
  - [Prerequisites](#prerequisites)
    - [Container runtime](#container-runtime)
    - [mise](#mise)
  - [Start](#start)
  - [Build](#build)
  - [Stop](#stop)
  - [Verification](#verification)
    - [Keycloak Admin Console](#keycloak-admin-console)
    - [Demo Client](#demo-client)
    - [Custom Required Action](#custom-required-action)
  - [Keycloak Main Demo](#keycloak-main-demo)
    - [Required Action Demo](#required-action-demo)
    - [Reset Credential Flow Demo](#reset-credential-flow-demo)
    - [Other Demos](#other-demos)
      - [Brute Force Protection (Account Lockout)](#brute-force-protection-account-lockout)
      - [Password Policies](#password-policies)
      - [Session \& Token Timeouts](#session--token-timeouts)
  - [Keycloak API Demo](#keycloak-api-demo)
    - [1. Token Endpoint — Obtain Access Token (ROPC Flow)](#1-token-endpoint--obtain-access-token-ropc-flow)
    - [2. Token Endpoint — Refresh Access Token](#2-token-endpoint--refresh-access-token)
    - [3. Introspect Endpoint — Validate Access Token](#3-introspect-endpoint--validate-access-token)
    - [4. Userinfo Endpoint — Retrieve User Information](#4-userinfo-endpoint--retrieve-user-information)

## Directory Structure

```txt
/
├── keycloak23/                          # Keycloak v23 practice environment
│   ├── keycloak/                        # Keycloak container and SPI extensions
│   │   ├── keycloak-providers/          # Maven multi-module project for Keycloak SPI
│   │   │   ├── custom-provider/         # Custom Required Action implementation (Kotlin)
│   │   │   ├── custom-theme/            # Custom login theme (FTL, CSS, JS)
│   │   │   └── pom.xml                  # Parent POM for providers
│   │   ├── Dockerfile                   # Keycloak image with providers bundled
│   │   ├── realm-export.json            # Realm settings exported from Keycloak admin console
│   │   │                                # Replace with your own export to apply custom settings
│   │   └── pom.xml                      # Keycloak module POM
│   ├── docker-compose.yml               # Starts keycloak, demo-server, and setup
│   ├── .mise.toml                       # Java and Maven version settings
│   ├── mvnw / mvnw.cmd                  # Maven Wrapper (no local Maven installation required)
│   └── pom.xml                          # Root POM for the entire project
└── shared/                              # Shared resources between keycloak23 and keycloak26
    ├── demo-server/                     # Demo client for verifying login flow (Bun + Hono)
    └── scripts/                         # Setup script run after Keycloak starts
                                         # Creates test users and fixes client secret
```

## Prerequisites

Tested on Ubuntu 24.04. Should work on WSL too.

### Container runtime

Choose either Docker or Podman.  
If you choose Docker Desktop, you don't need to install Docker Engine manually.

- [Docker](https://docs.docker.com/engine/install/ubuntu/)
  - [Docker Compose](https://docs.docker.com/compose/install/#plugin-linux-only)
- [Podman](https://podman.io/docs/installation#ubuntu)
  - [podman-compose](https://github.com/containers/podman-compose?tab=readme-ov-file#package-repositories)

### mise

[Install mise](https://mise.jdx.dev/installing-mise.html#installing-mise) and run the following in the `keycloak23/` directory:

```bash
mise trust
mise install
```

This will install required tools as specified in `.mise.toml`.

## Start

Run the following in the `keycloak23` directory:

```bash
mise run dev
```

The following JARs will be generated:

- `keycloak/keycloak-providers/custom-provider/target/keycloak-custom-provider.jar`
- `keycloak/keycloak-providers/custom-theme/target/keycloak-custom-theme.jar`

If you only want to build, see [Build](#build)

Then, the following services will start:

| Service     | URL                     | Description              |
| ----------- | ----------------------- | ------------------------ |
| keycloak    | <http://localhost:8080> | Keycloak 23              |
| demo-server | <http://localhost:8081> | Demo client (Bun + Hono) |
| setup       | -                       | Initial setup script     |

On startup, the following will be performed automatically:

- Import `realm-export.json` to create `sample_realm`
- Fix `sample-client` secret
- Create test users

## Build

Only build the Keycloak provider JARs:

```bash
mise run build
```

## Stop

```bash
mise run stop
```

The environment is stateless and will be fully reset on the next `mise run dev`.

## Verification

### Keycloak Admin Console

Access <http://localhost:8080/admin> and log in with the following credentials:

- Username: `admin`
- Password: `admin`

Verify that `sample_realm` has been created and the following are configured:

- **Clients**: `sample-client` exists
- **Authentication > Required Actions**: `Sample Required Action` is enabled
- **Realm settings > Themes**: Login theme is set to `custom-theme`

### Demo Client

The scripts automatically register two test users:

| Username | Password   |
| -------- | ---------- |
| alice    | aaaaa11111 |
| bob      | bbbbb22222 |

1. Access <http://localhost:8081>
2. Click **Login with Keycloak**
3. Log in with one of the test users above
4. After login, verify that the URL parameters and token response are displayed on the callback page
5. Click **Logout** to return to the top page

### Custom Required Action

To verify the custom Required Action:

1. In the Admin Console, go to `sample_realm` > **Users**
2. Select a user and add `Sample Required Action` to **Required User Actions**
3. Log in as that user via the demo client
4. Verify that the custom FTL screen is displayed and that the entered value is saved to `sample_attribute`

## Keycloak Main Demo

### Required Action Demo

You can configure **Required Actions** for a user from the User screen in the Keycloak Admin Console.  
A Required Action is an action that the user must complete before they are allowed to log in.

Reference: [Defining actions required at login](https://www.keycloak.org/docs/latest/server_admin/index.html#con-required-actions_server_administration_guide)

**Try it:**

1. In the Admin Console, go to `sample_realm` > **Users** and select a user
2. Under **Required User Actions**, add **Update Password**
3. Log in as that user via the demo client
4. Verify that you are redirected to the password update screen before completing login

### Reset Credential Flow Demo

You can allow users to reset their password via email using the "Forgot password" link on the login screen.

Reference: [Enabling forgot password](https://www.keycloak.org/docs/latest/server_admin/index.html#enabling-forgot-password)

**Try it:**

1. In the Admin Console, go to `sample_realm` > **Realm settings** > **Login**
2. Enable **Forgot password**
3. Log out and click **Forgot password** on the login screen
4. Verify that the password reset flow is triggered

### Other Demos

> [!TIP]
> Many Keycloak behaviors can be changed through configuration.

#### Brute Force Protection (Account Lockout)

Configure how many consecutive login failures trigger an account lockout.

Reference: [Brute force attacks](https://www.keycloak.org/docs/latest/server_admin/index.html#password-guess-brute-force-attacks)

Try enabling brute force protection, then fail login several times to lock the account. Verify that even correct credentials are rejected while the account is locked.

#### Password Policies

Define rules that apply when a password is created or updated.

Reference: [Password policies](https://www.keycloak.org/docs/latest/server_admin/index.html#_password-policies)

Try adding a password policy, then use the **Update Password** Required Action again and verify that passwords not meeting the policy are rejected.

#### Session & Token Timeouts

Configure expiration times for login sessions and tokens.

Reference: [Session and token timeouts](https://www.keycloak.org/docs/latest/server_admin/index.html#_timeouts)

- Shorten the session timeout and verify that you are automatically logged out when it expires
- Shorten the access token lifespan and verify the change is reflected in the token response on the demo client callback page

## Keycloak API Demo

This section provides hands-on practice with Keycloak OIDC endpoints using HTTP requests (e.g., curl or any HTTP client such as Postman or Insomnia).

Reference: [Keycloak OIDC endpoints](https://www.keycloak.org/securing-apps/oidc-layers)

---

### 1. Token Endpoint — Obtain Access Token (ROPC Flow)

The ROPC (Resource Owner Password Credentials) flow allows you to obtain an access token by providing a username and password directly. It is the easiest flow to test manually.

> [!IMPORTANT]
> The ROPC flow directly handles user credentials.  
> It is recommended only for trusted server-to-server communication.  
> In real projects, use the Authorization Code Flow instead.

**Method:** `POST`

**Endpoint:**

```txt
http://localhost:8080/realms/{realm}/protocol/openid-connect/token
```

**Path Parameters:**

| Parameter | Type   | Required | Description         |
|-----------|--------|----------|---------------------|
| realm     | string | Yes      | Keycloak realm name |

**Request Headers:**

| Header       | Value                             | Required | Description    |
|--------------|-----------------------------------|----------|----------------|
| Content-Type | application/x-www-form-urlencoded | Yes      | Request format |

**Request Body:**

| Parameter     | Type   | Required | Description                                      |
|---------------|--------|----------|--------------------------------------------------|
| grant_type    | string | Yes      | Fixed value: `password`                          |
| client_id     | string | Yes      | Client ID registered in Keycloak                 |
| client_secret | string | No       | Client Secret (required for Confidential Client) |
| username      | string | Yes      | Username                                         |
| password      | string | Yes      | Password                                         |

**curl example:**

```bash
curl -X POST http://localhost:8080/realms/sample_realm/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=sample-client" \
  -d "client_secret=sample-secret-****************" \
  -d "username=alice" \
  -d "password=aaaaa11111"
```

**Expected Response:** HTTP 200 with `access_token` in the response body.

> [!TIP]
> The access token is in JWT format. You can inspect its contents at [jwt.io](https://jwt.io/).  
> Check the `exp` claim to verify the token expiration time.  
> Reference: [HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)

---

### 2. Token Endpoint — Refresh Access Token

Use the `refresh_token` obtained in step 1 to get a new access token without re-entering credentials.

Keycloak follows the OAuth 2.0 standard, so standard OAuth refresh token requests apply.  
Try looking up the request format yourself and calling the endpoint.

**Method:** `POST`

**Endpoint:**

```txt
http://localhost:8080/realms/{realm}/protocol/openid-connect/token
```

**Hint:** Set `grant_type` to `refresh_token` and include the `refresh_token` value from step 1.

Reference: [RFC 6749 - Refreshing an Access Token](https://datatracker.ietf.org/doc/html/rfc6749#section-6)

---

### 3. Introspect Endpoint — Validate Access Token

Validate whether an access token is active and retrieve its metadata.

**Method:** `POST`

**Endpoint:**

```txt
http://localhost:8080/realms/{realm}/protocol/openid-connect/token/introspect
```

**Hint:** Include the `token` parameter with the access token, and authenticate with `client_id` and `client_secret`.

Reference: [RFC 7662 - OAuth 2.0 Token Introspection](https://datatracker.ietf.org/doc/html/rfc7662)

---

### 4. Userinfo Endpoint — Retrieve User Information

Retrieve user profile information using a valid access token. This endpoint requires a valid token with the `openid` scope.

**Method:** `GET` or `POST`

**Endpoint:**

```txt
http://localhost:8080/realms/{realm}/protocol/openid-connect/userinfo
```

**Hint:** Pass the access token as a Bearer token in the `Authorization` header.

Reference: [OpenID Connect Core - UserInfo Endpoint](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)
