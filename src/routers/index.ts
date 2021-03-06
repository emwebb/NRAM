import express, { Router } from "express"

import * as champions from "../riotdata/champions.json"

export default () : Router => {
    var championList : string[] = [];

    for(var key in champions.data)
        championList.push(key);
    var router = express.Router();
    
    router.get('/', (req, res) => {
        console.log(championList);
        res.render('index/index', {model: championList});
    });
    return router;
};