import {RequestHandler} from 'express'
import {Model} from "../models/ClientModel"
import { IUser } from '../mongoose/User';

var middlware : RequestHandler = (req, res, next) => {
    let client : Model.Client.Client = {
        loggedIn : false,
        user : undefined

    }
    if(req.user) {
        client.loggedIn = true;
        client.user = {
            username : String((req.user as IUser).username),
            userId : String((req.user as IUser).id)
        }
    }
    res.locals['Client'] = client;
    next();
}

export default middlware;