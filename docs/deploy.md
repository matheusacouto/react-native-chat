# Deploy automatico

Este projeto fica mais simples de operar com dois fluxos separados:

- backend: testar, buildar e acionar o deploy do host sempre que `backend/**` mudar na `main`
- mobile Android: gerar APK e AAB automaticamente sempre que `mobile/**` mudar na `main` ou em tags `v*`

Os workflows ficam em:

- `.github/workflows/ci.yml`
- `.github/workflows/backend-deploy.yml`
- `.github/workflows/android-build.yml`

## Secrets do GitHub

Configure em `Settings > Secrets and variables > Actions`:

```text
PUBLIC_API_URL=https://sua-api-publica
GOOGLE_WEB_CLIENT_ID=seu-client-id.apps.googleusercontent.com
BACKEND_DEPLOY_HOOK_URL=https://hook-do-seu-host
GOOGLE_SERVICES_JSON_BASE64=conteudo-base64-opcional
ANDROID_KEYSTORE_BASE64=conteudo-base64-da-keystore
ANDROID_RELEASE_STORE_PASSWORD=senha-da-keystore
ANDROID_RELEASE_KEY_ALIAS=alias-da-chave
ANDROID_RELEASE_KEY_PASSWORD=senha-da-chave
```

`GOOGLE_SERVICES_JSON_BASE64` e os secrets de assinatura sao opcionais para build interno. Para publicar em loja, use uma keystore propria.

## Gerar keystore Android

```bash
cd mobile/android/app
keytool -genkeypair -v \
  -keystore release.keystore \
  -alias rnchat \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
base64 -w 0 release.keystore
```

O valor impresso pelo `base64` entra em `ANDROID_KEYSTORE_BASE64`.

## Versionamento automatico

O workflow Android define:

- `ANDROID_VERSION_CODE` com o numero da execucao do GitHub Actions
- `ANDROID_VERSION_NAME` com a tag sem o `v`, quando a build vem de tag, ou `1.0.<run_number>` quando vem da `main`

O Gradle le essas variaveis e atualiza `versionCode` e `versionName` sem edicao manual.

## Publicacao

Para backend, configure o `BACKEND_DEPLOY_HOOK_URL` com o deploy hook do Render, Railway, Fly, VPS ou outro host.

Para Android, o workflow ja entrega artefatos APK/AAB. A proxima evolucao e trocar o upload de artefato por envio automatico para Google Play Internal Testing usando uma service account.
