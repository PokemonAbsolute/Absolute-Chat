import { Absolute } from '../client';

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
        if (typeof this.absolute.user === 'undefined' || !this.absolute.user.Connected) {
            document.getElementById('chatContent')!.innerHTML = `
                <table style="width: 100%; height: 100%;">
                  <tr>
                    <td style="width: 100%; height: 100%;" valign="middle">
                      <img src='https://${location.hostname}/images/Pokemon/Sprites/Normal/359.png' />
                      <br />
                      <b style="color: #ff0000; font-size: 14px;">Absolute Chat is offline.</b>
                      <br /><br />
                      Absol is currently offline for one reason or another.
                    </td>
                  </tr>
                </table>
            `;

            return;
        }

        let MessageHtml = '';

        this.messages.forEach((Message, Message_ID) => {
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
                      <b class='${Message.User.Rank}'>${Message.User.Username}</b>
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

        document.getElementById('chatContent')!.innerHTML = MessageHtml;
    }

    /**
     * Add a new message to the message history.
     */
    public AddMessage(messageData: MessageInterface): void {
        if (!this.absolute.isActive) {
            console.log(
                '[Chat | Client] Unable to send message due to the client socket not being active.'
            );
            return;
        }

        console.log(messageData);

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
                Private: messageData.Message?.Private,
                Private_To: messageData.Message?.Private_To,
                Timestamp: messageData.Message?.Timestamp,
            },
        };

        this.messages.set(this.messages.size, message);
        this.DisplayMessages();

        console.log(
            `[Chat | Client] Added new message to the message history. (#${message.Message.ID})`
        );
    }

    /**
     * Empty message history.
     */
    private ClearMessages(): void {
        this.messages.clear();
    }
}
