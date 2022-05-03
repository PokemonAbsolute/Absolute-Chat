import User from './user';

import MessageInterface from '../types/message';

export default class Message {
  private message: string;
  private isPrivate: boolean = false;
  private sentOn: number;
  private sentBy?: User | undefined;

  constructor(message: string, sentBy?: User, isPrivate?: boolean) {
    this.message = message;
    this.isPrivate = isPrivate ?? false;
    this.sentBy = sentBy;
    this.sentOn = Math.floor(Date.now() / 1000);
  }

  public fromUser(): MessageInterface {
    return {
      userID: this.sentBy?.userData?.ID,
      userName: this.sentBy?.userData?.Username,
      userRank: this.sentBy?.userData?.Rank,
      userAvatar: this.sentBy?.userData?.Avatar,
      messageText: this.message,
      isPrivate: this.isPrivate,
      sentOn: this.sentOn,
    };
  }

  public fromBot(): MessageInterface {
    return {
      userID: -1,
      userName: 'Absol',
      userRank: 'Bot',
      userAvatar: '/Avatars/Custom/3.png',
      messageText: this.message,
      isPrivate: this.isPrivate,
      sentOn: this.sentOn,
    };
  }
}
