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
  [messageSender: string]: MessageUserProps;
}

interface MessageUserProps {
  userID: number;
  postcode: string;
  connected: boolean;
  startsWith: Function;
}
