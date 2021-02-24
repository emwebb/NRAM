import express, { Router } from "express"

import * as champions from "../riotdata/champions.json"
import RouterPassIn from "./routerPassIn";

export default (routerPassIn : RouterPassIn) : Router => {
    var championList : string[] = [];

    for(var key in champions.data)
        championList.push(key);
    var router = express.Router();
    
    router.get('/', (req, res) => {
        console.log(championList);
        res.render('championlist/index', {model: championList});
    });
    return router;
};