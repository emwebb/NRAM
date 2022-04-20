import express, { Router } from "express"
import { ObjectID, ObjectId } from "mongodb";
import { AccountLogic } from "../logic/account/account";
import { IUser } from "../mongoose/User";

export default () : Router => {
    var router = express.Router();
    
    router.get('/', (req, res) => {
        res.render('account/index');
    });

    router.post('/account/account', (req, res) => {
        let user = req.user;
        if(user) {
            AccountLogic.updateAccount((user as IUser).id, req.body['username'], req.body['email'], req.body['rank']).then((account) => {
                res.json(account);
            }).catch((err) => {
                res.sendStatus(500);
                console.error(err);
            });
        } else {
            res.sendStatus(403);
        }
    });

    router.get('/account/account', (req,res) => {
        let user = req.user;
        if(user) {
            AccountLogic.getAccount((user as IUser).id).then((account) => {
                res.json(account);
            }).catch((err) => {
                res.sendStatus(500);
                console.error(err);
            });
        } else {
            res.sendStatus(403);
        }
    });
    return router;
};