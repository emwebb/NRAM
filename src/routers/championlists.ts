import express, { Router } from "express"
import {ChampionListLogic} from "../logic/championlist/championlist"
import { IUser } from "../mongoose/User";
import { ObjectID, ObjectId } from "mongodb";

export default () : Router => {
    var router = express.Router();
    
    router.get('/', (req, res) => {
        res.render('championlists/index');
    });

    router.get('/champions', (req, res) => {
        res.json(ChampionListLogic.getChampions());
    });

    router.get('/championlist', (req,res) => {
        let user = req.user;
        if(user) {
            ChampionListLogic.getChampionListsForUser((user as IUser).id).then((userChampionLists) => {
                res.json(userChampionLists);
            }).catch((err) => {
                res.sendStatus(500);
                console.error(err);
            });
        } else {
            res.sendStatus(403);
        }
    });

    router.get('/championlist/:listID', (req,res) => {
        let user = req.user;
        if(user) {
            ChampionListLogic.getChampionListForUser((user as IUser).id, req.params['listID']).then((championList) => {
                res.json(championList);
            }).catch((err) => {
                res.sendStatus(500);
                console.error(err);
            });
        } else {
            res.sendStatus(403);
        }
    });

    router.post('/championlist', (req,res) => {
        let user = req.user;
        if(user) {
            ChampionListLogic.createNewChampionList((user as IUser).id, req.body['name']).then((championList) => {
                res.json(championList);
            }).catch((err) => {
                res.sendStatus(500);
                console.error(err);
            });
        } else {
            res.sendStatus(403);
        }
    });

    router.post('/championlist/:listID', (req,res) => {
        let user = req.user;
        if(user) {
            ChampionListLogic.addChampionToList((user as IUser).id, req.params['listID'], req.body['champion']).then((champion) => {
                res.json(champion);
            }).catch((err) => {
                res.sendStatus(500);
                console.error(err);
            });
        } else {
            res.sendStatus(403);
        }
    });

    router.delete('/championlist/:listID', (req,res) => {
        let user = req.user;
        if(user) {
            ChampionListLogic.deleteChampionListForUser((user as IUser).id, req.params['listID']).then(() => {
                res.sendStatus(200);
            }).catch((err) => {
                res.sendStatus(500);
                console.error(err);
            });
        } else {
            res.sendStatus(403);
        }
    });

    router.delete('/championlist/:listID/:champion', (req,res) => {
        let user = req.user;
        if(user) {
            ChampionListLogic.deleteChampionForUser((user as IUser).id, req.params['listID'], req.params['champion']).then(() => {
                res.sendStatus(200);
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