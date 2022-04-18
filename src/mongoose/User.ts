import mongoose, {Schema, Document} from 'mongoose';

export interface IUser extends Document {
    username : String;
    hash : String;
    salt : String;
    rank : Number;
    email : String;
    emailVerified : Boolean;
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
    },
    rank : {
        type : Number,
        required : true,
        default : 0
    },
    email : {
        type : String,
        required : true
    },
    emailVerified : {
        type : Boolean,
        required : true,
        default : false
    }
});


export default mongoose.model<IUser>('User', UserSchema);