export namespace Model {
    export namespace Client {
        export interface User {
            username : string;
            userId : string;
        }
        export interface Client {
            loggedIn : boolean;
            user : User | undefined;
        }
    }
}