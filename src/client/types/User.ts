export interface UserInterface {
    User_ID: number;
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

export interface UserMessageInterface extends Omit<UserInterface, 'Connected' | 'Auth_Code'> {
    Connected?: boolean;
    Auth_Code?: string;
}
