import mongoose, {Schema, Document} from 'mongoose';
import {IUser} from './User';

export interface IChampionList extends Document {
    name : String;
    owner : IUser['_id'];
}

export const ChampionListSchema = new Schema({
    name : {
        type : String,
        required: true
    },
    owner : {
        type : Schema.Types.ObjectId,
        required: true
    }
});

export default mongoose.model<IChampionList>('ChampionList', ChampionListSchema);