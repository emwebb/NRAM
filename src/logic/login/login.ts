
import crypto from "crypto";
import { Logic } from "../logic";
import User from "../../mongoose/User";

export namespace LoginLogic {

    export enum LoginErrors {
        Unknown = 0,
        LoginFailed,
        UsernameTakes ,
        UnsecurePassword,
        InvalidEmail
    }

    export class HashSaltPair {
        hash : string;
        salt : string;

        constructor(hash : string, salt : string) {
            this.hash = hash;
            this.salt = salt;
        }
    }

    export interface RegisterResult {
        success : boolean;
        error? : LoginErrors;
    }

    export function validatePassword(password : string, salt: string, hash: string) : boolean {
        var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return hash === hashVerify;
    }

    export function generatePassword(password : string) : HashSaltPair{
        var salt = crypto.randomBytes(32).toString('hex');
        var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        
        return new HashSaltPair(genHash, salt);
    }

    export function isSecurePassword(password : string) : boolean {
        return password.length > 10;
    }

    export function isValidEmail(email : string) : boolean {
        return String(email).toLowerCase().match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ) != null;
    }

    export function register(username : string, password : string, email : string) : Promise<RegisterResult> {
        return new Promise<RegisterResult>((resolve, reject) => {
            User.findOne({
                username : username
            }).then((user) => {
                if(user) {
                    resolve({
                        success : false,
                        error : LoginErrors.UsernameTakes
                    });
                    return;
                    
                }
                if(!isSecurePassword(password)) {
                    resolve({
                        success : false,
                        error : LoginErrors.UnsecurePassword
                    });
                    return;
                }
                if(!isValidEmail(email)) {
                    resolve({
                        success : false,
                        error : LoginErrors.InvalidEmail
                    });
                    return;
                }
                var saltHash = generatePassword(password);
                var salt = saltHash.salt;
                var hash = saltHash.hash;
                var newUser = new User(
                    {
                        username: username,
                        hash: hash,
                        salt: salt,
                        email: email,
                        emailVerified: false
                    }
                )
                newUser.save()
                    .then((user) => {
                        resolve({
                            success : true
                        });
                    });
            });
        });
    }

    export class LoginLogic extends Logic {

    }
   
}