namespace LobbyLobby {
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

    
    interface LobbyUser {
        username : string;
        userId : string;
    }

    interface ChampionListsMemberModel {
        name : string;
        id : string;
    }

    interface ChampionListsModel {
        lists : ChampionListsMemberModel[];
    }

    export class Model {
        lobby : KnockoutObservable<Lobby>;
        lobbyMembers : KnockoutObservableArray<LobbyMember>;
        championLists : KnockoutObservableArray<ChampionListsMemberModel>;
        users : KnockoutObservableArray<LobbyUser>
        lobbyId : string;

        noTeam : KnockoutComputed<LobbyMember[]>;
        blueTeam : KnockoutComputed<LobbyMember[]>;
        purpleTeam : KnockoutComputed<LobbyMember[]>;

        selectedChampionList : KnockoutObservable<string>;
        selectedUser : KnockoutObservable<string>;

        fnRoll : () => void;
        fnInviteUser : () => void;

        constructor() {
            this.lobby = ko.observable({owner : '', ownerId : '', lobbyId : '', rolled : false});
            this.lobbyMembers = ko.observableArray();
            this.championLists = ko.observableArray();
            this.users = ko.observableArray();
            this.lobbyId = Utils.getModel();

            this.noTeam = ko.computed(() => {
                let noTeamMembers : LobbyMember[] = [];
                this.lobbyMembers().forEach((lobbyMember) => {
                    if(lobbyMember.roll == undefined) {
                        noTeamMembers.push(lobbyMember);
                    }
                });
                return noTeamMembers;
            });

            this.blueTeam = ko.computed(() => {
                let blueTeamMembers : LobbyMember[] = [];
                this.lobbyMembers().forEach((lobbyMember) => {
                    if(lobbyMember.roll) {
                        if(!lobbyMember.roll.purple) {
                            blueTeamMembers.push(lobbyMember);
                        }
                    }
                });
                return blueTeamMembers;
            });

            this.purpleTeam = ko.computed(() => {
                let purpleTeamMembers : LobbyMember[] = [];
                this.lobbyMembers().forEach((lobbyMember) => {
                    if(lobbyMember.roll) {
                        if(lobbyMember.roll.purple) {
                            purpleTeamMembers.push(lobbyMember);
                        }
                    }
                });
                return purpleTeamMembers;
            });

            this.selectedChampionList = ko.observable('');
            this.selectedUser = ko.observable('');
            
            this.fnRoll = () => {
                this.roll();
            }

            this.fnInviteUser = () => {
                this.inviteUser(this.selectedUser());
            }

            this.selectedChampionList.subscribe((newChampionList) => {
                this.changeChampionList(newChampionList);
            });

            this.reloadChampionLists();
            this.reloadLobby();
            this.reloadLobbyMembers();
            this.reloadUsers();
        }

        reloadLobby() {
            Utils.ajax<Lobby, null>(`/lobby/lobby/${this.lobbyId}`, 'GET', null).then((lobby) => {
                this.lobby(lobby);
            });
        }

        reloadLobbyMembers() {
            Utils.ajax<LobbyMember[], null>(`/lobby/lobby/${this.lobbyId}/members`, 'GET', null).then((lobbyMembers) => {
                this.lobbyMembers.removeAll();
                for(let n = 0; n < lobbyMembers.length; n++) {
                    this.lobbyMembers.push(lobbyMembers[n]);
                }
            });
        }

        reloadChampionLists() {
            Utils.ajax<ChampionListsModel, null>('/championlists/championlist', 'GET', null).then((championLists) => {
                this.championLists.removeAll();
                championLists.lists.forEach((element) => {
                    this.championLists.push(element);
                });
            });
        }

        reloadUsers() {
            Utils.ajax<LobbyUser[], null>('/lobby/users', 'GET', null).then((userList) => {
                this.users.removeAll();
                userList.forEach((element) => {
                    this.users.push(element);
                });
            });
        }

        inviteUser(userId : string) {
            Utils.ajax<LobbyMember, {inviteeID : string}>(`/lobby/lobby/${this.lobbyId}/invite`, 'POST', { inviteeID : userId }).then((lobbyMember) => {
                this.reloadLobbyMembers();
            });
        }

        changeChampionList(listId : string) {
            Utils.ajax<LobbyMember, {listID : string}>(`/lobby/lobby/${this.lobbyId}/championList`, 'POST', { listID : listId }).then((lobbyMember) => {
                this.reloadLobbyMembers();
            });
        }

        roll() {
            Utils.ajax<LobbyMember[], null>(`/lobby/lobby/${this.lobbyId}/roll`, 'POST', null).then((lobbyMembers) => {
                this.lobbyMembers.removeAll();
                for(let n = 0; n < lobbyMembers.length; n++) {
                    this.lobbyMembers.push(lobbyMembers[n]);
                }
            });
        }
    }
}




$(function () {
    var lobbyLobby = new LobbyLobby.Model();
    ko.applyBindings(lobbyLobby);
    $('#select').select2();
});