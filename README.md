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
