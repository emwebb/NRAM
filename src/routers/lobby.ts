import express, { Router } from "express"
import {LobbyLogic} from "../logic/lobby/lobby"
import { IUser } from "../mongoose/User";
import { ObjectID, ObjectId } from "mongodb";
import { CommHandler } from "../commHandler";

export default (commHandler : CommHandler) : Router => {
    var router = express.Router();
    var logic = new LobbyLogic.LobbyLogic(commHandler);
    
    router.get('/', (req, res) => {
        res.render('lobby/index');
    });

    router.get('/view/:lobbyID', (req, res) => {
        res.render('lobby/lobby', {model : req.params['lobbyID'] });
    });

    router.get('/lobby/:lobbyID', (req, res) => {
        let user = req.user;
        if(user) {
            logic.getLobby((user as IUser).id, req.params['lobbyID']).then((lobby) => {
                res.json(lobby);
            }).catch((err) => {
                res.sendStatus(500);
                console.error(err);
            });
        } else {
            res.sendStatus(403);
        }
    });

    router.get('/lobby/:lobbyID/members', (req, res) => {
        let user = req.user;
        if(user) {
            logic.getLobbyMembers((user as IUser).id, req.params['lobbyID']).then((lobbyMembers) => {
                res.json(lobbyMembers);
            }).catch((err) => {
                res.sendStatus(500);
                console.error(err);
            });
        } else {
            res.sendStatus(403);
        }
    });

    router.post('/lobby/:lobbyID/invite', (req, res) => {
        let user = req.user;
        if(user) {
            logic.inviteUser((user as IUser).id, req.params['lobbyID'], req.body['inviteeID']).then((lobbyMember) => {
                res.json(lobbyMember);
            }).catch((err) => {
                res.sendStatus(500);
                console.error(err);
            });
        } else {
            res.sendStatus(403);
        }
    });

    router.post('/lobby/:lobbyID/accept', (req, res) => {
        let user = req.user;
        if(user) {
            logic.acceptInvite((user as IUser).id, (user as IUser).username.toString(), req.params['lobbyID']).then((lobbyMember) => {
                res.json(lobbyMember);
            }).catch((err) => {
                res.sendStatus(500);
                console.error(err);
            });
        } else {
            res.sendStatus(403);
        }
    });

    router.post('/lobby/:lobbyID/reject', (req, res) => {
        let user = req.user;
        if(user) {
            logic.rejectInvite((user as IUser).id, req.params['lobbyID']).then(() => {
                res.json();
            }).catch((err) => {
                res.sendStatus(500);
                console.error(err);
            });
        } else {
            res.sendStatus(403);
        }
    });
    
    router.post('/lobby/:lobbyID/championList', (req, res) => {
        let user = req.user;
        if(user) {
            logic.changeChampionList((user as IUser).id, (user as IUser).username.toString(), req.params['lobbyID'], req.body['listID']).then((lobbyMember) => {
                res.json(lobbyMember);
            }).catch((err) => {
                res.sendStatus(500);
                console.error(err);
            });
        } else {
            res.sendStatus(403);
        }
    });
    
    router.get('/lobby', (req, res) => {
        let user = req.user;
        if(user) {
            logic.getLobbiesUserIsMemberOf((user as IUser).id, (user as IUser).username.toString()).then((lobby) => {
                res.json(lobby);
            }).catch((err) => {
                res.sendStatus(500);
                console.error(err);
            });
        } else {
            res.sendStatus(403);
        }
    })

    router.post('/lobby', (req, res) => {
        let user = req.user;
        if(user) {
            logic.createLobby((user as IUser).id, (user as IUser).username.toString(), req.body['name']).then((lobby) => {
                res.json(lobby);
            }).catch((err) => {
                res.sendStatus(500);
                console.error(err);
            });
        } else {
            res.sendStatus(403);
        }
    });

    router.post('/lobby/:lobbyID/roll', (req, res) => {
        let user = req.user;
        if(user) {
            logic.rollChampions((user as IUser).id, req.params['lobbyID']).then((lobbyMembers) => {
                res.json(lobbyMembers);
            }).catch((err) => {
                res.sendStatus(500);
                console.error(err);
            });
        } else {
            res.sendStatus(403);
        }
    });

    router.get('/users', (req, res) => {
        logic.getAllUsers().then((users) => {
            res.json(users);
        });
    })

    return router;
};