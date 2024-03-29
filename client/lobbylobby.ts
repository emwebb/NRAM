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
        championListId : string;
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

        areWeOwner : KnockoutComputed<boolean>

        inviteableUsers : KnockoutComputed<LobbyUser[]>;

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
            
            this.areWeOwner = ko.computed(() => {
                return this.lobby().ownerId == Utils.getClient().user?.userId;
            });

            this.inviteableUsers = ko.pureComputed(() => {
                let inviteableUsers : LobbyUser[] = [];
                for(let n = 0; n < this.users().length; n++) {
                    let user = this.users()[n];
                    if(!this.lobbyMembers().some((lobbyMember : LobbyMember) => lobbyMember.userId == user.userId)) {
                        inviteableUsers.push(user);
                    }
                }
                return inviteableUsers;
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

            Utils.getCommHandler().addEventListener('lobbyUpdated',(event : Event) => {
                if((event as CustomEvent).detail['lobby'] == this.lobbyId) {
                    this.reloadLobby();
                    this.reloadLobbyMembers(); 
                }
            });
        }

        reloadLobby() {
            Utils.ajax<Lobby, null>(`/lobby/lobby/${this.lobbyId}`, 'GET', null).then((lobby) => {
                this.lobby(lobby);
            });
        }

        reloadLobbyMembers() {
            Utils.ajax<LobbyMember[], null>(`/lobby/lobby/${this.lobbyId}/members`, 'GET', null).then((lobbyMembers) => {
                this.lobbyMembers(lobbyMembers);
                this.lobbyMembers().forEach((member) => {
                    if(member.userId == Utils.getClient().user?.userId) {
                        this.selectedChampionList(member.championListId);
                    }
                });
            });
        }

        reloadChampionLists() {
            Utils.ajax<ChampionListsModel, null>('/championlists/championlist', 'GET', null).then((championLists) => {
                this.championLists(championLists.lists);
            });
        }

        reloadUsers() {
            Utils.ajax<LobbyUser[], null>('/lobby/users', 'GET', null).then((userList) => {
                this.users(userList);
            });
        }

        inviteUser(userId : string) {
            Utils.ajax<LobbyMember, {inviteeID : string}>(`/lobby/lobby/${this.lobbyId}/invite`, 'POST', { inviteeID : userId }).then((lobbyMember) => {
                this.reloadLobbyMembers();
            });
        }

        changeChampionList(listId : string) {
            if(listId == '' || listId == undefined) {
                return;
            }
            Utils.ajax<LobbyMember, {listID : string}>(`/lobby/lobby/${this.lobbyId}/championList`, 'POST', { listID : listId }).then((lobbyMember) => {
                this.reloadLobbyMembers();
            });
        }

        roll() {
            Utils.ajax<LobbyMember[], null>(`/lobby/lobby/${this.lobbyId}/roll`, 'POST', null).then((lobbyMembers) => {
                this.reloadChampionLists();
            });
        }
    }
}




$(function () {
    var lobbyLobby = new LobbyLobby.Model();
    ko.applyBindings(lobbyLobby, document.getElementById('main'));
    $('#select').select2();
});