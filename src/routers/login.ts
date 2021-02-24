import express, { Router } from "express"
import passport from "passport"
import {Login} from "../logic/login/login"
import RouterPassIn from "./routerPassIn";

export default (routerPassIn : RouterPassIn) : Router => {

    enum LoginErrors {
        Unknown = 0,
        LoginFailed,
        UsernameTakes ,
        UnsecurePassword
    }

    var router = express.Router();
    router.get('/', (req, res) => {
        var model = {
            hasError : false,
            errorMessage : ''
        }
        if(req.query['error']) {
            model.hasError = true;
            switch(parseInt(req.query['error'] as string) as LoginErrors) {
                case LoginErrors.LoginFailed :
                    model.errorMessage = "Username or Password incorrect";
                    break;
                case LoginErrors.UsernameTakes :
                    model.errorMessage = "This username has already been taken";
                    break;
                case LoginErrors.UnsecurePassword : 
                    model.errorMessage = "This password is not secure enough";
                    break;
                default :
                    model.errorMessage = "Unknown Error";
            }
        }
        res.render('login/index', { model : model });
    });
    
    router.post('/login',passport.authenticate('local', {
        failureRedirect : `/login?error=${LoginErrors.LoginFailed}`,
        successRedirect: '/',
        }
    ));

    router.post('/register', (req, res, next) => {
        routerPassIn.models.User.findOne({
            username : req.body['username']
        }).then((user) => {
            if(user) {
                res.redirect(`/login?error=${LoginErrors.UsernameTakes}`);
                
            }
            if(!Login.isSecurePassword(req.body['password'])) {
                res.redirect(`/login?error=${LoginErrors.UnsecurePassword}`);
            }
            var saltHash = Login.generatePassword(req.body['password']);
            var salt = saltHash.salt;
            var hash = saltHash.hash;
            var newUser = new routerPassIn.models.User(
                {
                    username: req.body['username'],
                    hash: hash,
                    salt: salt
                }
            )
            newUser.save()
                .then((user => {
                    console.log(user);
                }));
                res.redirect('/login');
        });
        
    });

    router.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });
    return router;
}