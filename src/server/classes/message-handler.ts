import User from './user';
import Message from './message';

import MessageInterface from '../types/message';

export default class MessageHandler {
  public sendMessage(
    message: string,
    sentBy: User,
    isPrivate?: boolean,
    isPrivateTo?: number
  ): MessageInterface {
    return new Message(message, isPrivate, isPrivateTo).fromUser(sentBy);
  }

  public sendBotMessage(
    message: string,
    isPrivate?: boolean,
    isPrivateTo?: number
  ): MessageInterface {
    return new Message(message, isPrivate, isPrivateTo).fromBot();
  }
}
