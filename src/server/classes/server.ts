import * as http from 'http';
import { Server, Socket } from 'socket.io';

import User from './user';
import MessageHandler from './message-handler';

import { INIT_COMMANDS } from '../util/get-commands';

import { CommandResponse } from '../types/command';
import MessageInterface, { InputMessageInterface } from '../types/message';

import { COMMAND_PREFIX } from '../config/server';

export default class Absol {
  private server: Server | undefined;
  private messageHandler: MessageHandler;

  private clientPool: User[] = [];
  private messagePool: MessageInterface[] = [];

  private commandList: Map<any, any> | undefined;

  private messageCharLimit: number = 200;
  private spamCheckMessageCount: number = 5;
  private spamCheckIntervalSec: number = 5;

  constructor() {
    this.messageHandler = new MessageHandler();
    this.commandList = INIT_COMMANDS();
  }

  /**
   * Starts the server and preps the socket and events.
   */
  public start(server: http.Server, initType: string): void {
    /**
     * Create a new server instance.
     */
    this.server = new Server(server, {
        allowEIO3: true,
        connectTimeout: 30000,
        cors: {
            origin: [
                'http://localhost',
                'https://localhost',
                'https://absoluterpg.com',
                'https://www.absoluterpg.com',
            ],
            credentials: true,
        },
    });

    /**
     * Handle connections to the server.
     */
    this.server.on('connection', (socket: Socket): void => {
      let client: User;

      /**
       * Handle the initial authentication of the client.
       */
      socket.on('auth', async (authObject): Promise<void> => {
        client = new User(authObject.user, authObject.postcode);
        if (!(await client.init())) {
          return;
        }

        this.clientPool.push(client);
        this.getMessageHistory(client, 30);
      });

      /**
       * Handle the disconnection of a client.
       */
      socket.on('disconnect', (): void => {
        if (typeof client !== 'undefined') {
          this.clientPool = this.clientPool.filter(
            (tClient) => tClient.userData?.ID !== client.userData?.ID
          );
        }
      });

      /**
       * Handle the emitted chat-message.
       */
      socket.on(
        'chat-message',
        async (chatData: InputMessageInterface): Promise<void> => {
          if (!(await client.auth(chatData?.user?.postcode))) {
            return;
          }

          if (await client.getBan()) {
            socket.emit(
              'chat-message',
              this.messageHandler.sendBotMessage(
                `You are banned, ${client.userData?.Username}.`,
                true,
                client.userData?.ID
              )
            );

            socket.disconnect();
            return;
          }

          if (this.isSpamming(client)) {
            socket.emit(
              'chat-message',
              this.messageHandler.sendBotMessage(
                `Please send fewer messages, ${client.userData?.Username}.`,
                true,
                client.userData?.ID
              )
            );

            return;
          }

          if (chatData.text.length > this.messageCharLimit) {
            socket.emit(
              'chat-message',
              this.messageHandler.sendBotMessage(
                `Messages must be 200 characters or less, ${client.userData?.Username}.`,
                true,
                client.userData?.ID
              )
            );

            return;
          }

          let messageBuffer: MessageInterface[] = [];

          messageBuffer.push(
            this.messageHandler.sendMessage(chatData.text, client)
          );

          if (chatData.text.startsWith(COMMAND_PREFIX)) {
            const COMMAND_ARGS: string[] = chatData.text
              .slice(COMMAND_PREFIX.length)
              .split(' ');

            const COMMAND_NAME: string | undefined =
              COMMAND_ARGS.shift()?.toLowerCase();

            const COMMAND_DATA: any = this.commandList?.get(COMMAND_NAME);

            if (typeof COMMAND_DATA !== 'undefined') {
              const COMMAND_RESPONSE: CommandResponse =
                await COMMAND_DATA.execute(COMMAND_ARGS);

              messageBuffer.push(
                this.messageHandler.sendBotMessage(
                  COMMAND_RESPONSE.message,
                  true,
                  client.userData?.ID
                )
              );
            }
          }

          for (const Message of messageBuffer) {
            socket.emit('chat-message', Message);
            this.messagePool.push(Message);
          }
        }
      );
    });

    /**
     * Emit a welcoming message when the server initially boots.
     */
    let initMessage: MessageInterface;
    switch (initType) {
      case 'debug':
        initMessage = this.messageHandler.sendBotMessage(
          'Absolute Chat has started in debug mode.'
        );
        break;

      case 'update':
        initMessage = this.messageHandler.sendBotMessage(
          'Absolute has been updated!'
        );
        break;

      default:
        initMessage = this.messageHandler.sendBotMessage(
          'Absolute Chat is online.'
        );
        break;
    }

    this.server.emit('chat-message', initMessage);
    this.messagePool.push(initMessage);
  }

  /**
   * Get the message history.
   */
  private getMessageHistory(client: User, messageCount: number): void {
    if (typeof this.server === 'undefined') {
      return;
    }

    messageCount = messageCount > 100 ? 100 : messageCount;

    let messagesToUse: MessageInterface[] = [];
    if (this.messagePool.length > messageCount) {
      messagesToUse = this.messagePool.slice(-messageCount);
    } else {
      messagesToUse = this.messagePool;
    }

    for (const message of messagesToUse) {
      if (!message.isPrivate || message.isPrivateTo === client.userData?.ID) {
        this.server.emit('chat-message', message);
      }
    }
  }

  /**
   * Check if the client is spamming.
   */
  private isSpamming(client: User): boolean {
    const TIME_LIMIT =
      Math.round(Date.now()) - this.spamCheckIntervalSec * 1000;

    const RECENT_MESSAGE_COUNT = this.messagePool.filter(
      (message) =>
        message.sentOn >= TIME_LIMIT && message.userID === client.userData?.ID
    ).length;

    return RECENT_MESSAGE_COUNT >= this.spamCheckMessageCount;
  }
}
