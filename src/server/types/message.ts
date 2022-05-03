export default interface MessageInterface {
  userID: number | undefined;
  userName: string | undefined;
  userRank: string | undefined;
  userAvatar: string | undefined;
  messageText: string;
  isPrivate: boolean;
  sentOn: number;
}

export interface InputMessageInterface {
  user: MessageUserProps;
  text: string;
}

interface MessageUserProps {
  userID: number;
  postcode: string;
  connected: boolean;
  startsWith: Function;
}
