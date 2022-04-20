import express, { Router } from "express"
import passport from "passport"
import {LoginLogic} from "../logic/login/login"
import User from "../mongoose/User";

export default () : Router => {

    enum LoginErrors {
        Unknown = 0,
        LoginFailed,
        UsernameTakes ,
        UnsecurePassword,
        InvalidEmail
    }

    var router = express.Router();
    router.get('/', (req, res) => {
        var model = {
            hasError : false,
            errorMessage : '',
            success : false
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
                case LoginErrors.InvalidEmail :
                    model.errorMessage = "Invalid Email"
                    break;
                default :
                    model.errorMessage = "Unknown Error";
            }
        }

        if(req.query['success']) {
            model.success = true;
        }
        
        res.render('login/index', { model : model });
    });
    
    router.post('/login',passport.authenticate('local', {
        failureRedirect : `/login?error=${LoginErrors.LoginFailed}`,
        successRedirect: '/',
        }
    ));

    router.post('/register', (req, res) => {

        LoginLogic.register(req.body['username'], req.body['password'], req.body['email']).then((result) => {
            if(!result.success) {
                res.redirect(`/login?error=${result.error}`);
                return;
            } else {
                res.redirect(`/login?success=true`);
            }

        });        
    });

    router.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });
    return router;
}