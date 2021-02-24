import {IUser, UserSchema} from "./User";
import {IChampionList, ChampionListSchema} from "./ChampionList";
import {IChampionListMember, ChampionListMemberSchema} from "./ChampionListMember";
import { Model, Schema, Document } from "mongoose";

export class Models {
    User : Model<IUser>;
    ChampionList : Model<IChampionList>;
    ChampionListMember : Model<IChampionListMember>;
    constructor(model : <T extends Document>(name: string, schema?: Schema, collection?: string, skipInit?: boolean) => Model<T>) 
    {
        this.User = model<IUser>('User', UserSchema);
        this.ChampionList = model<IChampionList>('ChampionList', ChampionListSchema);
        this.ChampionListMember = model<IChampionListMember>('ChampionListMember', ChampionListMemberSchema);
    }
}

export default (model : <T extends Document>(name: string, schema?: Schema, collection?: string, skipInit?: boolean) => Model<T>) : Models => {
    return new Models(model);
}