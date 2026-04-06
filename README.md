# React Native Chat

Aplicação mobile em React Native CLI com backend NestJS para autenticação com Firebase, chat entre usuários, notificações persistidas em PostgreSQL, push via FCM e parâmetros dinâmicos de app.

## Visão Geral

O projeto é dividido em duas partes:

- `mobile/`: aplicativo React Native CLI
- `backend/`: API NestJS com PostgreSQL e Firebase Admin

Fluxos implementados:

- autenticação com Firebase Auth
- login com Google
- recuperação de senha
- restauração de sessão ao reabrir o app
- chat entre usuários
- envio de notificações globais e individuais
- persistência de notificações no PostgreSQL
- registro de push token por dispositivo
- envio de push via Firebase Cloud Messaging
- parâmetros dinâmicos com `app-parameters`
- tratamento de conectividade offline

## Stack

### Mobile

- React Native CLI
- React Navigation
- `@react-native-firebase/app`
- `@react-native-firebase/auth`
- `@react-native-firebase/messaging`
- `@react-native-google-signin/google-signin`
- `react-native-config`
- Jest + Testing Library

### Backend

- NestJS
- TypeORM
- PostgreSQL
- Firebase Admin SDK
- `typeorm-extension` para seeds

## Estrutura

Arquivos e pastas principais:

- `mobile/App.tsx`
- `mobile/index.js`
- `mobile/android/`
- `mobile/src/navigation/`
- `mobile/src/screens/`
- `mobile/src/contexts/AuthContext.tsx`
- `mobile/src/contexts/ConnectivityContext.tsx`
- `mobile/src/services/api/`
- `mobile/src/services/firebase/`
- `backend/src/app.module.ts`
- `backend/src/modules/auth/`
- `backend/src/modules/chat/`
- `backend/src/modules/notificatios/`
- `backend/src/modules/push/`
- `backend/src/modules/app-parameters/`
- `backend/src/database/seeds/`

## Requisitos

- Node.js 20+
- npm
- PostgreSQL
- Android Studio ou dispositivo Android
- projeto Firebase configurado

Opcional:

- macOS + CocoaPods para iOS

## Firebase

Documentação oficial útil:

- Firebase Android setup: https://firebase.google.com/docs/android/setup
- Google Sign-In com Firebase Auth: https://firebase.google.com/docs/auth/android/google-signin
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
- Cloud Messaging: https://firebase.google.com/docs/cloud-messaging
- React Native Firebase Auth: https://rnfirebase.io/auth/usage
- React Native Firebase Messaging: https://rnfirebase.io/messaging/usage

### Arquivos nativos

O mobile depende destes arquivos:

- `mobile/google-services.json`
- `mobile/GoogleService-Info.plist`

Hoje o foco prático do projeto está no Android. O iOS continua presente na estrutura, mas não é o fluxo principal de validação.

## Variáveis de Ambiente

### Mobile

Crie `mobile/.env` com:

```env
EXPO_PUBLIC_API_URL=http://SEU_BACKEND:3000
GOOGLE_WEB_CLIENT_ID=seu-web-client-id.apps.googleusercontent.com
```

Observação:

- o nome `EXPO_PUBLIC_API_URL` foi mantido por compatibilidade, mas o app hoje usa `react-native-config`
- para testar em dispositivo físico fora da sua rede local, o backend precisa estar em uma URL pública ou exposto por túnel

### Backend

Crie `backend/.env` com:

```env
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DB=react_native_chat
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"..."}
```

Observação:

- `FIREBASE_SERVICE_ACCOUNT_JSON` deve ser um JSON válido completo da service account
- no deploy, essa credencial pode ser configurada como environment variable

## Backend

Instalação:

```bash
cd backend
npm install
```

Rodando em desenvolvimento:

```bash
npm run start:dev
```

Decisão do projeto:

- o backend usa `synchronize: true`
- isso foi mantido para simplificar a entrega do desafio e acelerar a composição do ambiente

## Seeds

O backend usa `typeorm-extension`.

Popular parâmetros do app:

```bash
cd backend
npm run seed:app-parameters
```

Popular usuários de teste:

```bash
cd backend
npm run seed:test-users
```

Os seeds incluem:

- `home_title`
- `home_subtitle`
- `home_notice`
- `notification_routes`

Usuários de teste:

- `usertest@teste.com`
- `usertest2@teste.com`

Esses usuários precisam existir também no Firebase Auth para que o login funcione de ponta a ponta. No ambiente de demonstração, a senha utilizada é `123456`.

## Mobile

Instalação:

```bash
cd mobile
npm install
```

Subindo o Metro:

```bash
npm run start
```

Rodando no Android:

```bash
npm run android
```

Rodando no iOS:

```bash
npm run ios
```

Observações:

- no macOS, o fluxo iOS pede `cd ios && pod install`
- mudanças em dependências nativas pedem rebuild do app
- o backend não entra no build mobile; ele precisa estar rodando separado

## App Parameters

O módulo `app-parameters` é usado de forma real no app.

Hoje ele controla:

- `home_title`
- `home_subtitle`
- `home_notice`
- `notification_routes`

`notification_routes` alimenta o campo de rota dos formulários de notificação e define também o ícone associado a cada rota.

## Notificações

Fluxo atual:

1. o usuário autentica no app
2. o app tenta obter o token FCM do dispositivo
3. o token é registrado no backend em `/push/register-token`
4. ao enviar uma notificação, o backend busca os tokens dos destinatários
5. o backend envia o push via Firebase Admin
6. ao tocar na notificação, o app navega pela `rota_destino`

Observações:

- push remoto deve ser validado preferencialmente em dispositivo físico
- emulador não é um bom alvo para validar entrega real
- o formulário mobile não envia `payload` hoje; o backend continua aceitando esse campo como opcional

## Chat

O chat implementa:

- listagem de usuários
- abertura de conversa
- envio de mensagem
- atualização periódica da conversa para refletir novas mensagens

## Testes

### Mobile

Rodar toda a suíte:

```bash
cd mobile
npm test
```

Rodar um teste específico:

```bash
cd mobile
npm test -- --runInBand src/screens/home/__tests__/HomeScreen.test.tsx
```

### Backend

```bash
cd backend
npm test
```

## Scripts Úteis

### Backend

```bash
npm run start:dev
npm run build
npm run test
npm run seed:app-parameters
npm run seed:test-users
```

### Mobile

```bash
npm run start
npm run android
npm run ios
npm run test
npm run lint
```

## Deploy

Separação recomendada:

- `backend/` em um serviço de host para Node/NestJS
- `mobile/` como build nativa Android/iOS

Pontos importantes:

- a URL pública do backend precisa entrar em `EXPO_PUBLIC_API_URL`
- `google-services.json` precisa estar disponível no ambiente de build Android
- `FIREBASE_SERVICE_ACCOUNT_JSON` precisa estar configurado no ambiente do backend

## Observações Finais

- o projeto deixou de usar Expo Router e hoje roda em React Native CLI
- o arquivo `mobile/app.json` foi reduzido ao papel básico de identidade do app
- o backend e o mobile são independentes em runtime
- para demonstração, o fluxo mais estável é Android + backend acessível por rede pública
