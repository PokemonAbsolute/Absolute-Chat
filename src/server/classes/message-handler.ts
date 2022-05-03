import User from './user';
import Message from './message';

import MessageInterface from '../types/message';

export default class MessageHandler {
  public sendMessage(
    message: string,
    sentBy: User,
    isPrivate?: boolean
  ): MessageInterface {
    return new Message(message, sentBy, isPrivate).fromUser();
  }

  public sendBotMessage(message: string): MessageInterface {
    return new Message(message, undefined, true).fromBot();
  }
}
