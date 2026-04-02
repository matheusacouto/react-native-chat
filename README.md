# React Native Chat

Aplicação mobile em React Native/Expo com backend NestJS para autenticação com Firebase, chat entre usuários, notificações persistidas no PostgreSQL, push notification via FCM e parâmetros dinâmicos do app.

## Visão Geral

O projeto está dividido em duas partes:

- `mobile/`: app Expo Router
- `backend/`: API NestJS com PostgreSQL

Principais funcionalidades implementadas:

- autenticação com Firebase Auth
- login com Google
- recuperação de senha
- controle de sessão com restauração automática
- listagem de usuários e chat entre usuários
- envio de notificações globais e individuais
- persistência de notificações no PostgreSQL
- push notification com registro de token e envio via Firebase Admin
- parâmetros dinâmicos do app com `app-parameters`
- tratamento de conectividade offline

## Arquitetura

### Mobile

- Expo Router
- React Native
- `@react-native-firebase/app`
- `@react-native-firebase/auth`
- `expo-notifications`
- `@react-native-google-signin/google-signin`

### Backend

- NestJS
- TypeORM
- PostgreSQL
- Firebase Admin SDK
- `typeorm-extension` para seeds

## Estrutura

Arquivos e pastas mais importantes:

- `mobile/app/`
- `mobile/src/contexts/AuthContext.tsx`
- `mobile/src/contexts/ConnectivityContext.tsx`
- `mobile/src/screens/`
- `mobile/src/services/firebase/auth.ts`
- `mobile/src/services/firebase/push.ts`
- `mobile/src/services/api/`
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
- projeto Firebase configurado
- Android Studio ou dispositivo Android para build/teste
- EAS CLI se quiser gerar build remota

## Configuração do Firebase

Referências oficiais úteis:

- Firebase Android setup: https://firebase.google.com/docs/android/setup
- Firebase Authentication: https://firebase.google.com/docs/auth
- Google Sign-In com Firebase: https://firebase.google.com/docs/auth/android/google-signin
- Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
- FCM: https://firebase.google.com/docs/cloud-messaging
- Expo development builds: https://docs.expo.dev/develop/development-builds/introduction/
- Expo notifications: https://docs.expo.dev/versions/latest/sdk/notifications/

### Mobile

Você precisa ter:

- `mobile/google-services.json`
- `mobile/src/services/firebase/firebaseConfig.ts`

Existe um exemplo em:

- `mobile/src/services/firebase/firebaseConfig.example.ts`

Crie o arquivo real com as credenciais do seu projeto Firebase.

### Backend

O backend usa Firebase Admin para:

- validar `idToken`
- enviar push via FCM

Garanta que as credenciais do Admin SDK estejam disponíveis no ambiente em que o backend roda.

## Configuração do Backend

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente do PostgreSQL e do Firebase Admin.

Depois suba a API:

```bash
npm run start:dev
```

### Seeds

Para popular `app-parameters`:

```bash
npm run seed:app-parameters
```

Para popular usuários de teste:

```bash
npm run seed:test-users
```

Os usuários seeded são:

- `usertest@teste.com`
- `usertest2@teste.com`

Observação:

- a senha não vai para o PostgreSQL
- a autenticação continua sendo feita pelo Firebase Auth
- então essas contas precisam existir também no Firebase

## Configuração do Mobile

Entre na pasta:

```bash
cd mobile
```

Instale as dependências:

```bash
npm install
```

Como o projeto usa dependências nativas, o teste principal deve ser feito com development build.

### Rodando localmente

```bash
npx expo start --dev-client
```

### Gerando novo development build

Sempre que mudar dependências nativas ou configuração nativa, gere um novo build.

Exemplos de mudanças que pedem rebuild:

- `@react-native-firebase/app`
- `@react-native-firebase/auth`
- `expo-notifications`
- `google-services.json`
- plugins no `app.json`

## Fluxos Implementados

### Sessão

- o app observa o estado do Firebase Auth
- restaura sessão ao reabrir
- sincroniza com o backend via `/auth/login/firebase`
- limpa a sessão ao expirar ou fazer logout

### Chat

- lista de usuários
- abertura de conversa
- envio de mensagem
- refresh periódico na conversa para refletir novas mensagens

### Notificações

- listagem de notificações persistidas
- envio global
- envio individual
- rota de destino configurável
- ícone derivado automaticamente da rota
- push persistido e enviado via backend

### App Parameters

Uso atual:

- `home_title`
- `home_subtitle`
- `home_notice`
- `notification_routes`

`notification_routes` é usado para montar as opções do campo de rota no formulário de notificações.

### Payload

No estado atual do projeto, o formulário do mobile não pede mais `payload`.

Motivo:

- o backend aceita `payload` como dado opcional
- mas o app ainda não usa esse conteúdo de forma estruturada
- então o campo livre acabava gerando mais ambiguidade do que valor

Hoje o envio mobile manda:

- `payload: null`

Se você quiser evoluir isso depois, o melhor caminho é usar payload estruturado por caso de uso, por exemplo:

- `conversationId`
- `notificationRecipientId`
- `targetUserId`

## Push Notifications

Fluxo atual:

1. usuário autentica no app
2. o mobile tenta obter o token de push do dispositivo
3. o token é registrado no backend em `/push/register-token`
4. ao enviar notificação, o backend busca tokens dos destinatários
5. o backend envia push via Firebase Admin
6. ao tocar na notificação, o app usa `rota_destino` para navegar

Observações importantes:

- push remoto deve ser validado preferencialmente em dispositivo físico
- emulador não é um bom alvo para validar entrega real

## Testes

### Mobile

Rodar todos os testes:

```bash
cd mobile
npm test
```

Rodar um teste específico:

```bash
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
npm run test
npm run lint
```

## Observações Finais

- o backend não entra no build do app; ele precisa estar rodando separadamente
- a build final do app usa apenas a pasta `mobile/`
- o app depende de conectividade com o backend para autenticação, chat e notificações
- o arquivo `mobile/google-services.json` precisa estar disponível no ambiente de build
