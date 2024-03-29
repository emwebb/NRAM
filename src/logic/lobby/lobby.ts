import { Logic } from "../logic";
import { Model } from "../../models/LobbyModel";
import Lobby, {ILobby} from "../../mongoose/Lobby";
import ChampionList, {IChampionList} from "../../mongoose/ChampionList"
import { ObjectId, ObjectID } from "mongodb";
import { CommHandler } from "../../commHandler";
import LobbyMember, {ILobbyMember, ILobbyMemberLobbyPopulated, ILobbyMemberPopulated } from "../../mongoose/LobbyMember";
import User from "../../mongoose/User";
import { Utils } from "../../util/utils";
import LobbyMemberRoll, { ILobbyMemberRoll } from "../../mongoose/LobbyMemberRoll";


export namespace LobbyLogic {

    export class LobbyLogic extends Logic {
        commHandler : CommHandler;
        constructor(commHandler : CommHandler) {
            super();
            this.commHandler = commHandler
        }

        createLobby(userId : string, username : string, name : string) : Promise<Model.Lobby.Lobby> {
            return new Promise<Model.Lobby.Lobby>((resolve, reject) => {
                let lobby : ILobby = new Lobby();
                lobby.owner = new ObjectId(userId);
                lobby.name = name;
                ChampionList.find({
                    owner : new ObjectId(userId)
                }).then((championLists) => {
                    if(championLists.length == 0) {
                        reject('User has no champion lists configured');
                        return;
                    }
                    lobby.save().then((newLobby) => {
                        let lobbyMember : ILobbyMember = new LobbyMember();
                        lobbyMember.lobby = lobby.id;
                        lobbyMember.user = userId;
                        lobbyMember.accepted = true;
                        lobbyMember.champList = championLists[0].id
                        lobbyMember.save().then((newLobbyMember) => {
                            resolve({
                                lobbyId : newLobby.id,
                                ownerId : userId,
                                owner : username,
                                rolled : false
                            });
                        }).catch((err) => {
                            reject(err);
                        });
                       
                    }).catch((err) => {
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                });
            });
        }

        getLobby(userId: string, lobbyId: string) {
            return new Promise<Model.Lobby.Lobby>((resolve, reject) => {
                this.isLobbyMember(new ObjectId(lobbyId), new ObjectId(userId)).then((isLobbyMember) => {
                    if(!isLobbyMember){
                        reject('User is not a member of this lobby');
                        return;
                    }
                    Lobby.findById(lobbyId).then((lobby) => {
                        if(lobby == null) {
                            reject('No such lobby');
                            return;
                        }
                        User.findById(userId).then((user) => {
                            if(user == null) {
                                reject('No such user');
                                return;
                            }
                            this.hasLobbyRolled({
                                _id: new ObjectId(lobbyId)
                            }).then((rolled) => {
                                resolve({
                                    owner: String(user.username),
                                    ownerId: String(lobby.owner),
                                    lobbyId: String(lobby._id),
                                    rolled: rolled
                                });
                            }).catch((err) => {
                                reject(err);
                            })
                        });
                    });
                });
            });
        }

        getLobbyMembers(userId: string, lobbyId: string) : Promise<Model.Lobby.LobbyMember[]> {
            return new Promise<Model.Lobby.LobbyMember[]>((resolve, reject) => {
                this.isLobbyMember(new ObjectId(lobbyId), new ObjectId(userId)).then((isLobbyMember) => {
                    if(!isLobbyMember){
                        reject('User is not a member of this lobby');
                        return;
                    }
                    Lobby.findById(lobbyId).then((lobby) => {
                        if(lobby == null) {
                            reject('No such lobby');
                            return;
                        }
                        this.getPopulatedLobbyMembers({
                            _id: lobby._id
                        }, true).then((results) => {
                            resolve(results.map((result) => {
                                let roll: Model.Lobby.LobbyMemberRoll | undefined;
                                if(result.roll_o.length > 0) {
                                    roll = {
                                        purple: Boolean(result.roll_o[0].purple),
                                        champion: String(result.roll_o[0].champion)
                                    }
                                }
                                return {
                                    userId: String(result.user_o[0]._id),
                                    username: String(result.user_o[0].username),
                                    accepted: Boolean(result.accepted),
                                    championListId : String(result.champList),
                                    roll: roll
                                }
                            }))
                        });
                    });
                });
            });
        }

        inviteUser(userId : string, lobbyId : string, inviteeId : string) : Promise<Model.Lobby.LobbyMember>{
            return new Promise<Model.Lobby.LobbyMember>((resolve, reject) => {
                Lobby.findOne({
                    _id : new ObjectId(lobbyId),
                    owner : new ObjectId(userId)
                }).then((lobby) => {
                    if(lobby == null) {
                        reject('No such lobby owner by user');
                        return;
                    }
                    User.findById(inviteeId).then((invitee) => {
                        if(invitee == null) {
                            reject('User does not exist');
                            return;
                        }
                        ChampionList.find({
                            owner : new ObjectId(inviteeId)
                        }).then((championLists) => {
                            if(championLists.length == 0) {
                                reject('User has no champion lists configured');
                                return;
                            }
                            let lobbyMember = new LobbyMember();
                            lobbyMember.champList = championLists[0].id;
                            lobbyMember.accepted = false;
                            lobbyMember.user = championLists[0].owner;
                            lobbyMember.lobby = lobby._id;
                            lobbyMember.save().then((newLobbyMember) => {
                                if(this.commHandler.isUserConnected(String(newLobbyMember.user))) {
                                    this.commHandler.sendMessage(String(newLobbyMember.user),{
                                        type : 'lobbyInvite',
                                        lobby : lobby.id
                                    });
                                }
                                this.messageAllUsers(new ObjectId(lobbyId), {
                                    type: 'lobbyUpdated',
                                    lobby: lobbyId
                                });
                                resolve({
                                    username : String(invitee.username),
                                    userId : newLobbyMember.user,
                                    accepted : Boolean(newLobbyMember.accepted),
                                    championListId : String(newLobbyMember.champList)
                                })
                            });
                        }).catch((err) => {
                            reject(err);
                        });
                    }).catch((err) => {
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                });
            });
        }

        acceptInvite(userId : string, username : string, lobbyId : string) : Promise<Model.Lobby.LobbyMember> {
            return new Promise<Model.Lobby.LobbyMember>((resolve, reject) => {
                LobbyMember.findOne({
                    user : new ObjectId(userId),
                    lobby : new ObjectId(lobbyId)
                }).then((lobbyMember) => {
                    if(lobbyMember == null) {
                        reject('No such invite');
                        return;
                    }
                    if(lobbyMember.accepted) {
                        reject('Invite already accepted');
                        return;
                    }
                    lobbyMember.accepted = true;
                    lobbyMember.save().then((newLobbyMember) => {
                        this.messageAllUsers(new ObjectId(lobbyId), {
                            type: 'lobbyUpdated',
                            lobby: lobbyId
                        });
                        resolve({
                            username : username,
                            userId : newLobbyMember.user,
                            accepted : Boolean(newLobbyMember.accepted),
                            championListId : String(newLobbyMember.champList)
                        })
                    }).catch((err) => {
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                })
            });
        }

        rejectInvite(userId : string, lobbyId : string) : Promise<void> {
            return new Promise<void>((resolve, reject) => {
                LobbyMember.findOneAndDelete({
                    lobby : new ObjectId(lobbyId),
                    user : new ObjectId(userId)
                }).then((deletedLobbyMember) => {
                    if(deletedLobbyMember == null) {
                        reject('No such invite');
                        return;
                    }
                    this.messageAllUsers(new ObjectId(lobbyId), {
                        type: 'lobbyUpdated',
                        lobby: lobbyId
                    });
                    resolve();
                });
            });
        }

        changeChampionList(userId : string, username : string, lobbyId : string, listId : string) : Promise<Model.Lobby.LobbyMember> {
            return new Promise<Model.Lobby.LobbyMember>((resolve, reject) => {
                LobbyMember.findOne(({
                    user : new ObjectId(userId),
                    lobby : new ObjectId(lobbyId)
                })).then((lobbyMember) => {
                    if(lobbyMember == null) {
                        reject('No such lobby');
                        return;
                    }
                    if(lobbyMember.accepted == false) {
                        reject('Invite not accepted');
                        return;
                    }

                    ChampionList.findOne({
                        _id : new ObjectId(listId),
                        owner : new ObjectId(userId)
                    }).then((list) => {
                        if(list == null) {
                            reject('No such list');
                            return;
                        }
                        lobbyMember.champList = list._id;
                        lobbyMember.save().then((newLobbyMember) => {
                            this.messageAllUsers(new ObjectId(lobbyId), {
                                type: 'lobbyUpdated',
                                lobby: lobbyId
                            });
                            resolve({
                                username : username,
                                userId : newLobbyMember.user,
                                accepted : Boolean(newLobbyMember.accepted),
                                championListId : String(newLobbyMember.champList)
                            });
                        }).catch((err) => {
                            reject(err);
                        });
                    });
                })
            });
        }

        rollChampions(userId :string, lobbyId : string):  Promise<Model.Lobby.LobbyMember[]>{
            return new Promise<Model.Lobby.LobbyMember[]>((resolve, reject) => {
                this.getPopulatedLobbyMembers({
                    _id : new ObjectId(lobbyId),
                    owner : new ObjectId(userId)
                }).then((results) => {
                    let lobbyMembers = (results as ILobbyMemberPopulated[]);
                    let lobbyMemberRolls = this.generateRolls(lobbyMembers);
                    Promise.all(lobbyMemberRolls.map(value => value.save())).then((newLobbyMemberRolls) => {
                        let mappedLobbyMembers = lobbyMembers.reduce((map, obj) => {
                            map.set(obj._id, obj);
                            return map;
                        }, new Map<ObjectId, ILobbyMemberPopulated>());

                        let populatedLobbyMember = newLobbyMemberRolls.map<Model.Lobby.LobbyMember>((value) => {
                            let lobbyMember = mappedLobbyMembers.get(value.member);
                            return {
                                username: String(lobbyMember?.user_o[0].username),
                                userId: lobbyMember?.user_o[0].id,
                                accepted: true,
                                roll: {
                                    champion : String(value.champion),
                                    purple : Boolean(value.purple) 
                                },
                                championListId : String(lobbyMember?.champList)
                            }
                        });
                        this.messageAllUsers(new ObjectId(lobbyId), {
                            type: 'lobbyUpdated',
                            lobby: lobbyId
                        });
                        resolve(populatedLobbyMember);
                    }).catch((err) => {
                        reject(err);
                    });
                });
            });
        }

        getLobbiesUserIsMemberOf(userId : string, username : string) : Promise<Model.Lobby.LobbyMembership[]> {
            return new Promise<Model.Lobby.LobbyMembership[]>((resolve, reject) => {
                LobbyMember.aggregate<ILobbyMemberLobbyPopulated>().match({
                    user : new ObjectId(userId)
                })
                .lookup({
                    from : 'lobbies',
                    localField : 'lobby',
                    foreignField : '_id',
                    as : 'lobby_o',
                })
                .lookup({
                    from : 'users',
                    localField : 'lobby_o.owner',
                    foreignField: '_id',
                    as : 'owner_o'
                })
                .exec((err, results) => {
                    if(err) {
                        reject(err);
                        return;
                    } else {
                        resolve(results.map((value) => {
                            return {
                                owner : String(value.owner_o[0].username),
                                ownerId : value.owner_o[0]._id,
                                lobbyName : String(value.lobby_o[0].name),
                                lobbyId : value.lobby_o[0]._id,
                                accepted : Boolean(value.accepted)
                            }
                        }));
                    }
                });
            });
        }

        getAllUsers() : Promise<Model.Lobby.LobbyUser[]> {
            return new Promise<Model.Lobby.LobbyUser[]>((resolve, reject) => {
                User.find((err, users) => {
                    resolve(users.map((user) => {
                         return {
                            username : String(user.username),
                            userId : String(user._id)
                         }
                    }));
                });
            });
        }

         
        private generateRolls(lobbyMembers : ILobbyMemberPopulated[]): ILobbyMemberRoll[] {
            let randomizedLobbyMembers = Utils.shuffle(lobbyMembers);
           

            let teamPair : TeamPair = new TeamPair();
            randomizedLobbyMembers.forEach((value, index) => {
                let member =  {
                    lobbyMemberId : value._id as ObjectId,
                    rank : Number(value.user_o[0].rank),
                    team : index % 2 ? Team.Blue : Team.Purple
                };

                if(member.team == Team.Blue) {
                    teamPair.blue.push(member);
                } else {
                    teamPair.purple.push(member);
                }
            });

            teamPair = this.balanceTeams(teamPair,1.5,3);
            let mappedIntermediateStage = teamPair.toMap();
            let takenChampions: String[] = [];

            let lobbyMemberRolls = randomizedLobbyMembers.map((value) => {
                let roll = new LobbyMemberRoll();
                roll.member = value._id;
                roll.purple = mappedIntermediateStage.get(value._id)?.team == Team.Purple;
                let playerChampions = value.champList_o.map((value) => value.champion);
                let validChampions = playerChampions.filter((value) => {
                    return !takenChampions.includes(value);
                });

                let chosenChampion = validChampions[Math.floor(Math.random() * validChampions.length)];
                roll.champion = chosenChampion;
                takenChampions.push(chosenChampion);
                return roll;
            });

            return lobbyMemberRolls;
        }

        private balanceTeams(unbalanced : TeamPair, alpha: number, runs: number): TeamPair{
            let teamPair = unbalanced;
            for(let n = 0; n < runs; n++) {
                let orderedPairs = this.getAllSwaps(teamPair).sort((a,b) => a.getDisparity() - b.getDisparity());

                let adjustedRandom = Math.pow(Math.random(), Math.pow(alpha, 2))/2;
                teamPair = orderedPairs[Math.floor(adjustedRandom * orderedPairs.length)];
            }

            return teamPair;
        }

        private getAllSwaps(current : TeamPair) : TeamPair[]{
            let teamPairs = new Array<TeamPair>();
            teamPairs.push(current);
            for(let b = 0; b < current.blue.length; b++) {
                for(let p = 0; p < current.purple.length; p++) {
                    let newTeamPair = current.clone();
                    let tempValue = newTeamPair.blue[b];
                    newTeamPair.blue[b] = newTeamPair.purple[p];
                    newTeamPair.purple[p] = tempValue;
                    newTeamPair.purple[p].team = Team.Purple;
                    newTeamPair.blue[b].team = Team.Blue;
                    teamPairs.push(newTeamPair);
                }
            }

            return teamPairs;
        }

        private hasLobbyRolled(searchOptions: PopulatedLobbyMemberSearch) : Promise<boolean> {
            return new Promise<boolean>((resolve, reject) => {
                this.getPopulatedLobbyMembers(searchOptions).then((results) => {
                    if(results.length > 0) {
                        for(let n = 0; n < results.length; n++) {
                            if(results[n].roll_o.length < 0) {
                                resolve(true);
                                return;
                            }
                        }
                    }
                    resolve(false);
                }).catch((err) => {
                    reject(err);
                });
            });
        } 

        private getPopulatedLobbyMembers(searchOptions: PopulatedLobbyMemberSearch, includeInvited : boolean = false) : Promise<ILobbyMemberPopulated[]> {
            return new Promise<ILobbyMemberPopulated[]>((resolve, reject) => {
                Lobby.findOne(searchOptions).then((lobby) => {
                    if(lobby == null) {
                        reject('No such lobby owner by user');
                        return;
                    }
                    let match = includeInvited ? {
                        lobby : lobby._id,
                    } :
                    {
                        lobby : lobby._id, 
                        accepted : true
                    }
                    LobbyMember.aggregate()
                        .match(match)
                        .lookup(
                                {
                                    from : 'users',
                                    localField : 'user',
                                    foreignField : '_id',
                                    as: 'user_o'
                                }
                            )
                        .lookup(
                                {
                                    from: 'championlistmembers',
                                    localField: 'champList',
                                    foreignField: 'list',
                                    as: 'champList_o'
                                }
                            )
                        .lookup(
                                {
                                    from: 'lobbymemberrolls',
                                    localField: '_id',
                                    foreignField: 'member',
                                    as: 'roll_o'
                                }
                        )
                        .addFields(
                            {
                                roll_o: {
                                '$slice': ['$roll_o', -1]
                                }
                            }
                        )
                        .exec((err, results) => {
                            if(err) {
                                reject(err);
                                return;
                            }
                            resolve(results);
                            });
                    });
            });
        }

        private isLobbyMember(lobbyId: ObjectId, userId : ObjectId) : Promise<boolean> {
            return new Promise<boolean>((resolve, reject) => {
                LobbyMember.findOne({
                    lobby: lobbyId,
                    user: userId
                }).then((value) => {
                    resolve(value != null);
                }).catch((err) => {
                    reject(err);
                });
            });
        }

        private messageAllUsers(lobbyId : ObjectId, message: any) {
            this.getPopulatedLobbyMembers({
                _id : lobbyId
            }).then((value) => {
                value?.forEach((value) => {
                    if(this.commHandler.isUserConnected(String(value.user))) {
                        this.commHandler.sendMessage(String(value.user), message);
                    }
                })
            });
        }
    }
    
    interface PopulatedLobbyMemberSearch {
        _id : ObjectId;
        owner? : ObjectId;
    }

    enum Team {
        Blue,
        Purple
    }

    class TeamPair {
        blue : IntermediateMemberRole[];
        purple : IntermediateMemberRole[];
        constructor() {
            this.blue = new Array<IntermediateMemberRole>();
            this.purple = new Array<IntermediateMemberRole>();
        }

        clone() : TeamPair {
            let clone = new TeamPair();
            this.blue.forEach((value) => {
                clone.blue.push(Utils.clone(value));
            });
            this.purple.forEach((value) => {
                clone.purple.push(Utils.clone(value));
            });
            return clone;
        }

        getDisparity() : number 
        {
            let disparity = 0;
            this.blue.forEach((value) => {
                disparity += value.rank;
            });
            this.purple.forEach((value) => {
                disparity -= value.rank;
            });

            return Math.abs(disparity);
        }

        toMap(): Map<ObjectId, IntermediateMemberRole> {
            let mappedIntermediateStage = this.blue.reduce((map, obj) => {
                map.set(obj.lobbyMemberId, obj);
                return map;
            }, new Map<ObjectId, IntermediateMemberRole>());
            mappedIntermediateStage = this.purple.reduce((map, obj) => {
                map.set(obj.lobbyMemberId, obj);
                return map;
            }, mappedIntermediateStage);

            return mappedIntermediateStage;
        }
    }

    interface IntermediateMemberRole {
        lobbyMemberId : ObjectId;
        rank : number;
        team : Team;
    }
}