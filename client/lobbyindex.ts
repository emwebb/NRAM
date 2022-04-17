namespace LobbyIndex {
    interface Lobby {
        owner : string;
        ownerId : string;
        lobbyId : string;
        rolled : boolean;
    }

    interface LobbyMemberOf extends Lobby {
        username : string;
        userId : string;
        accepted : boolean;
    }

    interface LobbyMemberRoll {
        champion : string;
        purple : boolean;
    }

    interface LobbyMember {
        username : string;
        userId : string;
        accepted : boolean;
        roll? : LobbyMemberRoll;
    }

    interface LobbyMembership {
        owner : string;
        ownerId : string;
        lobbyName : string;
        lobbyId : string;
        accepted : boolean;
    }

    interface LobbyListDisplay {
        displayName : string;
        cssClass : string;
        id : string;
    }

    export class Model {
        lobbies : KnockoutObservableArray<LobbyMembership>;
        newLobbyName : KnockoutObservable<string>;
        lobbyListDisplay : KnockoutComputed<LobbyListDisplay[]>
        fnAddLobby : () => void;
        fnJoinLobby : (lobbyId : string) => void;
        constructor() {
            this.lobbies = ko.observableArray();
            this.newLobbyName = ko.observable('');
            this.lobbyListDisplay = ko.computed(() => {
                return this.lobbies().map((value) => {
                    let displayName = value.lobbyName;
                    let cssClass = "btn-default";
                    if(value.ownerId == Utils.getClient().user?.userId) {
                        displayName += " (owner)"
                        cssClass = "btn-primary"
                    } else if(value.accepted) {
                        displayName += " (member)"
                        cssClass = "btn-default"
                    }  else {
                        displayName += " (invited)"
                        cssClass = "btn-success"
                    }
                    return {
                        displayName : displayName,
                        cssClass : cssClass,
                        id : value.lobbyId
                    }
                });
            });
            this.fnAddLobby = () => {
                this.addLobby();
            }
            this.fnJoinLobby = (lobbyId : string) => {
                this.joinLobby(lobbyId);
            }
            this.reloadLobbies();
        }

        reloadLobbies() {
            Utils.ajax<LobbyMembership[], null>('/lobby/lobby', 'GET', null).then((lobbies) => {
                this.lobbies.removeAll();
                for(let index = 0; index < lobbies.length; index++) {
                    const element = lobbies[index];
                    this.lobbies.push(element);
                }
            });
        }

        addLobby() {
            Utils.ajax<Lobby, { name : string }>('/lobby/lobby', 'POST', { name : this.newLobbyName()}).then((lobby => {
                this.reloadLobbies();
            }));
        }

        joinLobby(lobbyId : string) {
            this.lobbies().forEach((value) => {
                if(value.lobbyId == lobbyId) {
                    if(value.accepted) {
                        window.location.pathname = `/lobby/view/${lobbyId}`
                    } else {
                        Utils.ajax<LobbyMember, null>(`/lobby/lobby/${lobbyId}/accept`, 'POST', null).then((lobbyMember) => {
                            window.location.pathname = `/lobby/view/${lobbyId}`
                        });
                    }
                }
            });
        }
    }
}




$(function () {
    var lobbyIndex = new LobbyIndex.Model();
    ko.applyBindings(lobbyIndex);
    $('#select').select2();
});