namespace Index {
    export class Model {
        champions: KnockoutObservableArray<string>;
        selectableChampions: KnockoutComputed<string[]>;
        selectedChampion: KnockoutObservable<string>;
        championList: KnockoutObservableArray<string>;
        chosenChampion: KnockoutObservable<string>;
        public addChampion: () => void;
        public getRandomChampion: () => void;
        public removeChampion: (champion : string) => void;
        constructor() {
            this.champions = ko.observableArray(Utils.getModel());
            this.selectedChampion = ko.observable("");
            this.chosenChampion = ko.observable("");
            this.championList = ko.observableArray();
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
            this.addChampion = () => {
                this.championList.push(this.selectedChampion());
            }
            this.getRandomChampion = () => {
                var numChamps : number = this.championList().length;
                var random : number = Math.floor(Math.random() * numChamps);
                this.chosenChampion(this.championList()[random]);
            
            }
            this.removeChampion = (champion : string) => {
                this.championList.remove(champion);
            }
        }
    }
}


$(function () {
    var indexModel = new Index.Model();
    ko.applyBindings(indexModel, document.getElementById('main'));
    $('#select').select2();
});