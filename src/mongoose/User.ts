import mongoose, {Schema, Document} from 'mongoose';

export interface IUser extends Document {
    username : String;
    hash : String;
    salt : String;
}

export const UserSchema = new Schema({
    username : {
        type : String,
        required: true
    },
    hash : {
        type : String,
        required: true
    },
    salt : {
        type : String,
        required: true
    }
});
