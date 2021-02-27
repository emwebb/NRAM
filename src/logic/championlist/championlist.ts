import { Logic } from "../logic";
import * as champions from "../../riotdata/champions.json"
import {Model} from "../../models/ChampionListsModel"
import ChampionList, { IChampionList } from "../../mongoose/ChampionList";
import { ObjectID, ObjectId } from "mongodb";
import ChampionListMember, { IChampionListMember } from "../../mongoose/ChampionListMember";
export namespace ChampionListLogic {
    
    var championList : string[] = [];

    for(var key in champions.data)
        championList.push(key);

    export function getChampions() : string[]{
        return championList;
    }

    export function getChampionListsForUser(userID : string) : Promise<Model.ChampionLists.ChampionListsModel> {
        
        return new Promise((resolve, reject) => {
            ChampionList.find({
                owner: new ObjectId(userID)
            }, (err, championList) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve({
                    lists : championList.map((value) => {
                        return {
                            id : value.id,
                            name : String(value.name)
                        }
                    })
                });
            });
        });
    }

    export function getChampionListForUser(userId : string, listId : string) : Promise<Model.ChampionLists.ChampionListModel> {
        
        return new Promise((resolve, reject) => {

            ChampionList.findOne({
                    _id: new ObjectId(listId),
                    owner : new ObjectId(userId)
                },
                null,
                null,
                (err, championList) => {
                    if(err) {
                        reject(err);
                        return;
                    }
                    if(championList == null) {
                        reject('No such list');
                        return;
                    }
                    ChampionListMember.find(
                        {
                            list : new ObjectId(listId)
                        },
                        (err, champions) => {
                            if(err) {
                                reject(err);
                               
                            }
                            resolve({
                                name : String(championList?.name),
                                champions : champions.map(champion => String(champion.champion)),
                                id : championList?.id
                            });
                        }
                    );
                }
            );
        });
    }

    export function createNewChampionList(userId : string, name : string) : Promise<Model.ChampionLists.ChampionListModel> {
        return new Promise((resolve, reject) => {
            ChampionList.findOne({
                name: name,
                owner : new ObjectId(userId)
            },
            null,
            null,
            (err, championList) => {
                if(err) {
                    reject(err);
                    return;
                }
                if(championList) {
                    reject('Name must be unique');
                    return;
                }
                var newChampionList : IChampionList = new ChampionList();
                newChampionList.name = name;
                newChampionList.owner = userId;
                newChampionList.save().then((newChampionListResult) => {
                    resolve({
                        name : String(newChampionListResult.name),
                        id : newChampionListResult.id,
                        champions : []
                    });
                }).catch((err) => {
                    reject(err);
                });
            });
        });
    }

    export function addChampionToList(userId : string, listId : string, champion : string) : Promise<Model.ChampionLists.ChampionListsMemberModel> {
        return new Promise((resolve, reject) => {
            if(!championList.includes(champion)) {
                reject('Not a champion');
            }
            ChampionList.findOne({
                _id: new ObjectId(listId),
                owner : new ObjectId(userId)
            },
            null,
            null,
            (err, championList) => {
                if(err) {
                    reject(err);
                    return;
                } 
                if(championList === null) {
                    reject('No such list');
                    return;
                } 
                var member : IChampionListMember = new ChampionListMember();
                member.champion = champion;
                member.list = championList.id;
                member.save().then((newMember) => {
                    resolve({
                        name : String(newMember.champion),
                        id : newMember.id
                    });
                });
                
            });
        });
    }

    export function deleteChampionListForUser(userId : string, listId : string) : Promise<void> {
        
        return new Promise((resolve, reject) => {

            ChampionList.findOneAndDelete({
                    _id: new ObjectId(listId),
                    owner : new ObjectId(userId)
                },
                null,
                (err, championList) => {
                    if(err) {
                        reject(err);
                        return;
                    }
                    if(championList == null) {
                        reject('No such list');
                        return;
                    }
                    ChampionListMember.remove(
                        {
                            list : listId
                        },
                        (err) => {
                            if(err) {
                                reject(err);
                            }
                            resolve();
                        }
                    );
                }
            );
        });
    }

    export function deleteChampionForUser(userId : string, listId : string,  champion : string) : Promise<void> {
        
        return new Promise((resolve, reject) => {

            ChampionList.findOne({
                    _id: new ObjectId(listId),
                    owner : new ObjectId(userId)
                },
                null,
                null,
                (err, championList) => {
                    if(err) {
                        reject(err);
                        return;
                    }
                    if(championList == null) {
                        reject('No such list');
                        return;
                    }
                    ChampionListMember.findOneAndDelete(
                        {
                            list : listId,
                            champion : champion
                        },
                        null,
                        (err, value) => {
                            if(err) {
                                reject(err);
                            }
                            resolve();
                        }
                    );
                }
            );
        });
    }
    export class ChampionListLogic extends Logic {
        
    }

}