import { Chat } from '../data/chatsData';

export type RootStackParamList = {
  Welcome: undefined;
  Chat: {
    chat?: Chat;
  };
};
