import { UserRanks } from '../types/User';

export function GetRankClass(Rank: UserRanks): string {
    switch (Rank) {
        case 'Chat Moderator':
            return 'chat_mod';

        case 'Super Moderator':
            return 'super_mod';

        default:
            return Rank.toLowerCase();
    }
}
