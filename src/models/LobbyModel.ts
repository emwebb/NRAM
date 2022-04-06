export namespace Model {
    export namespace Lobby {
        export interface Lobby {
            owner : string;
            ownerId : string;
            lobbyId : string;
            rolled : boolean;
        }

        export interface LobbyMemberOf extends Lobby {
            username : string;
            userId : string;
            accepted : boolean;
        }

        export interface LobbyMemberRoll {
            champion : string;
            purple : boolean;
        }

        export interface LobbyMember {
            username : string;
            userId : string;
            accepted : boolean;
            roll? : LobbyMemberRoll;
        }
    }
}