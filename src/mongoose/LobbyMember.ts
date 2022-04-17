import mongoose, {Schema, Document} from 'mongoose';
import {IUser} from './User';
import {ILobby} from './Lobby';
import {IChampionList} from './ChampionList'
import { IChampionListMember } from './ChampionListMember';
import { ILobbyMemberRoll } from './LobbyMemberRoll';

export interface ILobbyMember extends Document {
    champList : IChampionList['_id'];
    user : IUser['_id'];
    accepted : Boolean;
    lobby : ILobby['_id'];
}

export interface ILobbyMemberPopulated extends ILobbyMember {
    champList_o : IChampionListMember[];
    user_o : IUser[];
    roll_o: ILobbyMemberRoll[];
}

export interface ILobbyMemberLobbyPopulated extends ILobbyMember {
    owner_o : IUser[];
    lobby_o : ILobby[];
}

export const LobbyMemberSchema = new Schema({
    champList : {
        type : Schema.Types.ObjectId,
        required: true
    },
    user : {
        type : Schema.Types.ObjectId,
        required: true
    },
    accepted : {
        type : Boolean,
        required : true
    },
    lobby : {
        type : Schema.Types.ObjectId,
        required : true
    }
});

export default mongoose.model<ILobbyMember>('LobbyMember', LobbyMemberSchema);