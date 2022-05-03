import User from './user';

import MessageInterface from '../types/message';

export default class Message {
  private message: string;
  private isPrivate: boolean = false;
  private sentOn: number;

  constructor(message: string, isPrivate?: boolean) {
    this.message = message;
    this.isPrivate = isPrivate ?? false;
    this.sentOn = Math.floor(Date.now() / 1000);
  }

  public fromUser(sentBy: User): MessageInterface {
    return {
      userID: sentBy.userData?.ID,
      userName: sentBy.userData?.Username,
      userRank: sentBy.userData?.Rank,
      userAvatar: sentBy.userData?.Avatar,
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
