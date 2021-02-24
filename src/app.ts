import express from "express"
import path from "path"
import index from "./routers/index"
import login from "./routers/login"
import bodyParser from "body-parser"
import expressEjsLayouts from "express-ejs-layouts";
import mongoose, {Connection} from "mongoose";
import passport from "passport";
import {Strategy as LocalStratagy} from "passport-local";
import session from "express-session";
import connectMongo from "connect-mongo";
import {IUser} from "./mongoose/User";
import ModelGen from "./mongoose/Schemas";
import { Login } from "./logic/login/login";
import RouterPassIn from './routers/routerPassIn';
import UserMiddleware from './middleware/userMiddleware'
import MenuMiddleware from './middleware/menuMiddleware'

const app = express();
const port = 8080;
const dbString = 'mongodb://localhost:27017/nram'
const secret = 'fsafdsafsdafdsa'

//Connect to DB
mongoose.connect(dbString);


const mongooseConnection : Connection = mongoose.connection;

const models = ModelGen(mongoose.model);
const routerPassIn = new RouterPassIn(models);
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
    secret : secret,
    resave : false,
    saveUninitialized : true,
    store: sessionStore
}));

passport.use( new LocalStratagy(
    (username, password, cb) => {
        models.User.findOne({username : username}).then((user) => {
            if(!user) {
                return cb(null, false);
            }
            var isValid = Login.validatePassword(password, user.salt.toString(), user.hash.toString());

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
    models.User.findById(id).then((user) => {
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

//View Engine Setup
app.use(expressEjsLayouts);
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');
app.set('layout', 'layout');



//Static content setup
app.use('/static', express.static(__dirname + '/static'));

// Add Routers
app.use('/' , index(routerPassIn));
app.use('/login', login(routerPassIn));


// 404 page
app.use('*', (req, res) => {
    res.statusCode = 404;
    res.render('404');
});



// Start server
app.listen( port, () => {
    console.log(`server started at http://localhost:${ port }`);
})