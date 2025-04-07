import { Absolute } from '../client';

import { GetRankClass } from '../util/GetRankClass';

import { MessageInterface } from '../types/Message';

export class MessageHandler {
    private absolute: Absolute;

    public messages = new Map<number, MessageInterface>();

    /**
     * Constructor
     */
    constructor(absolute: Absolute) {
        this.absolute = absolute;
    }
    /**
     * Display the message history to the user.
     */
    public DisplayMessages(): void {
        let MessageHtml = '';

        this.messages.forEach((Message, Message_ID) => {
            const UserRankClass = GetRankClass(Message.User.Rank);

            MessageHtml += `
                <div class='message${
                    Message.Message.Private ? ' private' : ''
                }' data-msg-id='${Message_ID}'>
                  <div class="avatar">
                    <a href='/profile.php?id=${Message.User.User_ID}'>
                      <img src="/images/${Message.User.Avatar}" />
                    </a>
                  </div>
                  <div class="username">
                    <a href='/profile.php?id=${Message.User.User_ID}'>
                      <b class='${UserRankClass}'>${Message.User.Username}</b>
                    </a>
                    <br />
                    ${
                        Message.Message.Timestamp
                            ? new Date(Message.Message.Timestamp).toLocaleString().split(', ')[1]
                            : ''
                    }
                  </div>
                  <div class="text">
                    <div>
                      ${Message.Message.Text}
                    </div>
                  </div>
                </div>
            `;
        });

        const Chat_Element = document.querySelector('#chatContent');
        Chat_Element!.innerHTML = MessageHtml;
        Chat_Element!.scrollTop = Chat_Element!.scrollHeight + 72;
    }

    /**
     * Add a new message to the message history.
     */
    public AddMessage(messageData: MessageInterface): void {
        if (!this.absolute.isActive) {
            return;
        }

        const message: MessageInterface = {
            User: {
                User_ID: messageData.User.User_ID,
                Username: messageData.User.Username,
                Rank: messageData.User.Rank,
                Avatar: messageData.User.Avatar,
                Auth_Code: messageData.User.Auth_Code,
            },
            Message: {
                ID: this.messages.size,
                Text: messageData.Message.Text,
                Private: messageData.Message.Private,
                Private_To: messageData.Message.Private_To,
                Timestamp: messageData.Message.Timestamp,
            },
        };

        if (
            messageData.User.User_ID == -1 &&
            messageData.Message.Text == 'Absolute Chat is online.'
        ) {
            this.ClearMessages();
        }

        this.messages.set(this.messages.size, message);
        this.DisplayMessages();
    }

    /**
     * Empty message history.
     */
    public ClearMessages(): void {
        this.messages.clear();
    }
}
