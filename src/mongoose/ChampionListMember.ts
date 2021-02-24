import mongoose, {Schema, Document} from 'mongoose';
import {IChampionList} from './ChampionList';

export interface IChampionListMember extends Document {
    champion : String;
    list : IChampionList['_id'];
}

export const ChampionListMemberSchema = new Schema({
    champion : {
        type : String,
        required: true
    },
    list : {
        type : Schema.Types.ObjectId,
        required: true
    }
});
