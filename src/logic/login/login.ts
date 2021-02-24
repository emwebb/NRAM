
import crypto from "crypto";

export namespace Login {
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
    
    export class HashSaltPair {
        hash : string;
        salt : string;

        constructor(hash : string, salt : string) {
            this.hash = hash;
            this.salt = salt;
        }
    }
}