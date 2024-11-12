export default interface UserInterface {
    ID: number;
    Username: string;
    Rank:
        | 'Member'
        | 'Chat Moderator'
        | 'Moderator'
        | 'Super Moderator'
        | 'Bot'
        | 'Developer'
        | 'Administrator';
    Auth_Code: string;
    Avatar: string;
    Connected: boolean;
}
