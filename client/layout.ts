namespace Layout {
    interface LobbyMembership {
        owner : string;
        ownerId : string;
        lobbyName : string;
        lobbyId : string;
        accepted : boolean;
    }

    export class Model {
        lobbyInvites: KnockoutObservable<number>;
        anyLobbyInvites : KnockoutComputed<boolean>;
        constructor() {
            this.lobbyInvites = ko.observable(0);
            this.anyLobbyInvites = ko.pureComputed(() => {
                return this.lobbyInvites() > 0;
            });

            Utils.getCommHandler().addEventListener('lobbyInvite',(event : Event) => {
                this.reloadLobbyInvites();
            });
            this.reloadLobbyInvites();
        }

        reloadLobbyInvites() {
            Utils.ajax<LobbyMembership[], null>('/lobby/lobby', 'GET', null).then((lobbies) => {
                let n = 0;
                lobbies.forEach((lobby) => {
                    if(!lobby.accepted) {
                        n++;
                    }
                });
                this.lobbyInvites(n);
            });
        }
    }
}


$(function () {
    var layoutModle = new Layout.Model();
    ko.applyBindings(layoutModle, document.getElementById('layout'));
});