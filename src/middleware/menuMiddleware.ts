import {RequestHandler} from 'express'
import { IUser } from '../mongoose/User';

enum MenuItemType {
    Button,
    Dropdown
}
interface MenuItem {
    displayName : string;
    type: MenuItemType;
    link? : string;
    active? : boolean;
    children? : MenuItem[];
}

var middlware : RequestHandler = (req, res, next) => {
    var menuItems : MenuItem[] = [];

    menuItems.push({
        displayName : "Home",
        type: MenuItemType.Button,
        link : '/',
        active : req.url == '/'
    });


    if(req.user != null) {
        menuItems.push({
            displayName : 'Champion Lists',
            type: MenuItemType.Button,
            link: '/championlists/',
            active : req.url == '/championlists/'
        });
        menuItems.push({
            displayName : (req.user as IUser).username.toString(),
            type: MenuItemType.Dropdown,
            children : [
                {
                    displayName : "Logout",
                    type : MenuItemType.Button,
                    link : '/login/logout/',
                    active : false
                }
            ]
        });
    } else {
        menuItems.push({
            displayName : "Loging",
            type: MenuItemType.Button,
            link : '/login/',
            active : req.url == '/login/'
        });
    }
    res.locals['MenuItems'] = menuItems;
    next();
}

export default middlware;