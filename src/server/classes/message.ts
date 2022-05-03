import User from './user';

import MessageInterface from '../types/message';

export default class Message {
  private message: string;
  private sentOn: number;
  private isPrivate: boolean = false;
  private isPrivateTo: number;

  constructor(message: string, isPrivate?: boolean, isPrivateTo?: number) {
    this.message = message;
    this.sentOn = Math.floor(Date.now() / 1000);
    this.isPrivate = isPrivate ?? false;
    this.isPrivateTo = isPrivateTo ?? -1;
  }

  public fromUser(sentBy: User): MessageInterface {
    return {
      userID: sentBy.userData?.ID,
      userName: sentBy.userData?.Username,
      userRank: sentBy.userData?.Rank,
      userAvatar: sentBy.userData?.Avatar,
      messageText: this.message,
      isPrivate: this.isPrivate,
      isPrivateTo: this.isPrivateTo,
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
      isPrivateTo: this.isPrivateTo,
      sentOn: this.sentOn,
    };
  }
}
