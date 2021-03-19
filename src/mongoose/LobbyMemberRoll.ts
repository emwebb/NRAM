import mongoose, {Schema, Document} from 'mongoose';
import {IUser} from './User';
import { ILobbyMember } from './LobbyMember';

export interface ILobbyMemberRoll extends Document {
    member : ILobbyMember['_id'];
    champion : String;
    purple : Boolean;
}

export const LobbyMemberRollSchema = new Schema({
    member : {
        type : Schema.Types.ObjectId,
        required: true
    },
    champion : {
        type : String,
        required: true
    },
    purple : {
        type : Boolean,
        required: true
    }
});

export default mongoose.model<ILobbyMemberRoll>('LobbyMemberRoll', LobbyMemberRollSchema);