import {RequestHandler} from 'express'
import { IUser } from '../mongoose/User';

var middlware : RequestHandler = (req, res, next) => {
    if(req.user != null) {
        res.locals["username"] = (req.user as IUser).username;
    }
    next();
}

export default middlware;