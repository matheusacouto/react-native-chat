export type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  Notifications: undefined;
  GlobalNotificationForm: undefined;
  IndividualNotificationForm: undefined;
  Chat: undefined;
  ChatRoom: {
    conversationId: string;
    targetUserId: string;
    targetUserName?: string;
  };
};
