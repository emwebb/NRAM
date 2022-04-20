import { Model } from "../../models/AccountModel";
import User from "../../mongoose/User";
import { Logic } from "../logic";
import { LoginLogic } from "../login/login";

export namespace AccountLogic {

    export function updateAccount(userId : string, username : string, email : string, rank : number) : Promise<Model.Account.AccountModel> {
        return new Promise<Model.Account.AccountModel>((resolve, reject) => {
            User.findById(userId, null, null, async (err, user) => {
                if(err) {
                    reject(err);
                    return;
                }
                if(user == null) {
                    reject("No such user")
                    return;
                }
                if(user.email != email) {
                    if(!LoginLogic.isValidEmail(email)) {
                        reject('Invalid Email');
                    }
                    user.email = email;
                    user.emailVerified = false;
                }
                if(user.username != username) {
                    let usernameTaken = await isUsernameTaken(username);
                    if(usernameTaken) {
                        reject("Username taken");
                        return;
                    }
                    user.username = username;
                }
                user.rank = rank;
                await user.save();
                resolve({
                    username : String(user.username),
                    email : String(user.email),
                    rank : Number(user.rank),
                    emailVerified : Boolean(user.emailVerified)
                });

            });
        });
    }

    export function getAccount(userId : string) : Promise<Model.Account.AccountModel> {
        return new Promise<Model.Account.AccountModel>((resolve, reject) => {
            User.findById(userId, null, null, async (err, user) => {
                if(err) {
                    reject(err);
                    return;
                }
                if(user == null) {
                    reject("No such user")
                    return;
                }
                resolve({
                    username : String(user.username),
                    email : String(user.email),
                    rank : Number(user.rank),
                    emailVerified : Boolean(user.emailVerified)
                });
            });
        });
    }

    export async function isUsernameTaken(username : string) : Promise<boolean> {
        let anyUsers = await User.find({
            username : username
        });

        return anyUsers.length > 0;
    }

    export class AccountLogic extends Logic {
        
    }
}