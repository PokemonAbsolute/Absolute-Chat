import * as http from 'http';
import { Server, Socket } from 'socket.io';

import User from './user';
import MessageHandler from './message-handler';

import { INIT_COMMANDS } from '../util/get-commands';

import MessageInterface, { InputMessageInterface } from '../types/message';

import { COMMAND_PREFIX } from '../config/server';

export default class Absol {
  private server: Server | undefined;
  private messageHandler: MessageHandler;

  private clientPool: User[] = [];
  private messagePool: MessageInterface[] = [];

  private commandList: Map<any, any> | undefined;

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
      socket.on('auth', async (authObject) => {
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
          let Message_Data: MessageInterface;

          if (!(await client.auth(chatData?.user?.postcode))) {
            return;
          }

          if (chatData.text.startsWith(COMMAND_PREFIX)) {
            // add and then emit client message
            // this.messageHandler.sendMessage(chatData.text, client, true);
            // process, add, and then emit command
            // command can fail if not valid
          } else {
            Message_Data = this.messageHandler.sendMessage(
              chatData.text,
              client
            );

            socket.emit('chat-message', Message_Data);
            this.messagePool.push(Message_Data);
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
      if (!message.isPrivate || message.isPrivateTo === client.userData?.ID)
        this.server.emit('chat-message', message);
    }
  }
}
