export default interface BanInterface {
  User_ID: number;
  Banned_By: number;
  Banned_On: number;

  RPG_Ban?: boolean;
  RPG_Ban_Reason?: string;
  RPG_Ban_Staff_Notes?: string;
  RPG_Ban_Until?: number;

  Chat_Ban?: boolean;
  Chat_Ban_Reason?: string;
  Chat_Ban_Staff_Notes?: string;
  Chat_Ban_Until?: number;
}
