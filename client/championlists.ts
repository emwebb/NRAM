namespace ChampionLists {
    interface ChampionListsMemberModel {
        name : string;
        id : string;
    }

    interface ChampionListsModel {
        lists : ChampionListsMemberModel[];
    }

    export interface ChampionListModel extends ChampionListsMemberModel {
        champions : string[];
    }

    export class Model {
        championLists : KnockoutObservableArray<ChampionListsMemberModel>;
        championList : KnockoutObservableArray<string>;
        selectableChampions: KnockoutComputed<string[]>;
        selectedChampionList : KnockoutObservable<ChampionListsMemberModel>;
        champions: KnockoutObservableArray<string>;
        selectedChampion: KnockoutObservable<string>;
        newListName : KnockoutObservable<string>;
        fnAddList : () => void;
        fnAddChampion : () => void;
        fnRemoveChampion : (champion : string) => void;
        fnDeleteList : () => void;
        constructor() {
            this.championList = ko.observableArray();
            this.championLists = ko.observableArray();
            this.selectedChampionList = ko.observable({name : '', id : ''});
            this.selectedChampion = ko.observable('');
            this.champions = ko.observableArray();
            this.newListName = ko.observable('');
            this.selectableChampions = ko.pureComputed(() =>
                {
                    var selectableChampions : string[] = [];
                    this.champions().forEach(element => {
                        if(this.championList.indexOf(element) < 0) {
                            selectableChampions.push(element);
                        }
                    });
                    return selectableChampions;
                });
            this.reloadChampionLists();
            this.reloadChampions();
            this.selectedChampionList.subscribe((newValue) => {
                this.reloadChampionList();
            });
            this.fnAddList = () => {
                this.addChampionList(this.newListName());
            }
            this.fnAddChampion = () => {
                this.addChampionToList(this.selectedChampion());
            }
            this.fnRemoveChampion = (champion : string) => {
                this.deleteChampionFromList(champion);
            }
            this.fnDeleteList = () => {
                this.deleteChampionList();
            }
            
        }

        reloadChampions() {
            Utils.ajax<string[], null>('/championlists/champions', 'GET', null).then((champions) => {
                this.champions.removeAll();
                for (let index = 0; index < champions.length; index++) {
                    const element = champions[index];
                    this.champions.push(element);
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

        reloadChampionList() {
            if(this.selectedChampionList() == undefined || this.selectedChampionList().id == '') {
                this.championList.removeAll();
                return;
            }
            Utils.ajax<ChampionListModel, null>(`/championlists/championlist/${this.selectedChampionList().id}`, 'GET', null).then((championList) => {
                this.championList.removeAll();
                championList.champions.forEach((element) => {
                    this.championList.push(element);
                });
            });
        }

        deleteChampionFromList(champion: string) {
            Utils.ajax<null, null>(`/championlists/championlist/${this.selectedChampionList().id}/${champion}`, 'DELETE', null).then(() => {
                this.reloadChampionList();
            });
        }

        deleteChampionList() {
            Utils.ajax<null, null>(`/championlists/championlist/${this.selectedChampionList().id}`, 'DELETE', null).then(() => {
                this.reloadChampionLists();
            });
        }

        addChampionList(name : string) {
            Utils.ajax<ChampionListModel, {name : string}>(`/championlists/championlist`, 'POST', {name : name}).then((championList) => {
                this.reloadChampionLists();
                this.selectedChampionList(championList);
            });
        }

        addChampionToList(champion : string) {
            Utils.ajax<ChampionListModel, {champion : string}>(`/championlists/championlist/${this.selectedChampionList().id}`, 'POST', {champion : champion}).then((championList) => {
                this.reloadChampionList();
            });
        }
    }
}




$(function () {
    var championList = new ChampionLists.Model();
    ko.applyBindings(championList);
    $('#select').select2();
});