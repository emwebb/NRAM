import express from "express"
import path from "path"
import index from "./routers/index"
import login from "./routers/login"
import championlists from "./routers/championlists"
import lobby from "./routers/lobby"
import account from "./routers/account"
import bodyParser from "body-parser"
import expressEjsLayouts from "express-ejs-layouts";
import mongoose, {Connection} from "mongoose";
import passport from "passport";
import {Strategy as LocalStratagy} from "passport-local";
import session from "express-session";
import connectMongo from "connect-mongo";
import User, {IUser} from "./mongoose/User";
import { LoginLogic } from "./logic/login/login";
import UserMiddleware from './middleware/userMiddleware';
import MenuMiddleware from './middleware/menuMiddleware';
import ClientMiddleware from './middleware/clientUtilsMiddleware';
import fs from 'fs';

import cookieParser from "cookie-parser";
import socketio from "socket.io"
import passportSocketIo from "passport.socketio"
import https from "https";
import http from "http";
import { CommHandler } from "./commHandler"

const app = express();
const port = process.env.PORT;
const dbString = process.env.MONGODB;
const secret = process.env.SECRET;

//Connect to DB
mongoose.connect(dbString!);


const mongooseConnection : Connection = mongoose.connection;

// Setup login
const MongoStore = connectMongo(session);
const sessionStore = new MongoStore({
    mongooseConnection: mongooseConnection,
    collection: 'session'
});

app.use(bodyParser({
    extended : true
}))

app.use(session({
    secret : secret!,
    resave : false,
    saveUninitialized : true,
    store: sessionStore
}));

passport.use( new LocalStratagy(
    (username, password, cb) => {
        User.findOne({username : username}).then((user) => {
            if(!user) {
                return cb(null, false);
            }
            var isValid = LoginLogic.validatePassword(password, user.salt.toString(), user.hash.toString());

            if(isValid) {
                return cb(null, user)
            } 
            else 
            {
                return cb(null, false);
            }
        })
        .catch((err) => {
            cb(err);
        });
    }
))
passport.serializeUser((user, cb) => {
    cb(null, (user as IUser).id);
});
passport.deserializeUser((id, cb) => {
    User.findById(id).then((user) => {
        cb(null, user);
    })
    .catch((err) => {
        cb(err);
    });
});

app.use(passport.initialize());
app.use(passport.session());

app.use(UserMiddleware);
app.use(MenuMiddleware);
app.use(ClientMiddleware)

//View Engine Setup
app.use(expressEjsLayouts);
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');
app.set('layout', 'layout');

//Socket
let server : http.Server | https.Server

if(process.env.HTTPS) {
    server = new https.Server({
        key: fs.readFileSync(process.env.KEY!),
        cert: fs.readFileSync(process.env.CERT!)
    },app);
} else {
    server = new http.Server(app);
}

let io = new socketio.Server(server);
io.use(passportSocketIo.authorize({
    key: 'connect.sid',
    secret: secret,
    store: sessionStore,
    passport: passport,
    success : (data, accept) => {
        console.log(data);
        accept(null, true);
    },
    fail : (data, message, error, accept) => {
        console.log(data);
        console.log(message);
        console.log(error);
        accept(error, false);
    }
}));

var commHandler = new CommHandler(io);

//Static content setup
app.use('/static', express.static(__dirname + '/static'));

// Add Routers
app.use('/' , index());
app.use('/login', login());
app.use('/championlists', championlists());
app.use('/lobby', lobby(commHandler));
app.use('/account', account());

// 404 page
app.use('*', (req, res) => {
    res.statusCode = 404;
    res.render('404');
});


// Start server
server.listen( port, () => {
    console.log(`server started at http://localhost:${ port }`);
})