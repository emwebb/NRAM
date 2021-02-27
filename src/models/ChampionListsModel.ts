export namespace Model {
    export namespace ChampionLists {
        export interface ChampionListsModel {
            lists : ChampionListsMemberModel[];
        }

        export interface ChampionListsMemberModel {
            name : string;
            id : string;
        }

        export interface ChampionListModel extends ChampionListsMemberModel {
            champions : string[];
        }
    }
}