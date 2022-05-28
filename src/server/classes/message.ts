import User from './user';
import Log from './log';

import MessageInterface from '../types/message';
import UserInterface from '../types/user';

export default class Message {
  private message: string;
  private sentOn: number;
  private isPrivate: boolean = false;
  private isPrivateTo: number;
  private isCommand: boolean = false;

  constructor(message: string, isPrivate?: boolean, isPrivateTo?: number) {
    this.message = message;
    this.sentOn = Date.now();
    this.isPrivate = isPrivate ?? false;
    this.isPrivateTo = isPrivateTo ?? -1;
  }

  public fromUser(sentBy: User): MessageInterface {
    if (typeof sentBy.userData !== 'undefined') {
      Log.toDatabase(
        this.message,
        sentBy.userData,
        this.sentOn,
        this.isPrivate,
        this.isPrivateTo
      );
    }

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
    const sentBy: UserInterface = {
      ID: -1,
      Username: 'Absol',
      Rank: 'Bot',
      Auth_Code: 'AbsolBotAuthCode',
      Avatar: '/Avatars/Custom/3.png',
    };

    Log.toDatabase(
      this.message,
      sentBy,
      this.sentOn,
      this.isPrivate,
      this.isPrivateTo
    );

    return {
      userID: sentBy.ID,
      userName: sentBy.Username,
      userRank: sentBy.Rank,
      userAvatar: sentBy.Avatar,
      messageText: this.message,
      isPrivate: this.isPrivate,
      isPrivateTo: this.isPrivateTo,
      sentOn: this.sentOn,
    };
  }
}
