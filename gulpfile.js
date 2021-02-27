const { src, dest, series, parallel } = require('gulp');
var gutil = require('gulp-util');
const { exec, child } = require('child_process');
const del = require('del');
const request = require('request');
const download = require("gulp-download-stream");

var npmClientLibs = [
    'node_modules/jquery/dist/jquery.js',
    'node_modules/select2/dist/js/select2.js',
    'node_modules/knockout/build/output/knockout-latest.js',
    'node_modules/bootstrap3/dist/js/bootstrap.js'
];

var npmClientCss = [
    'node_modules/select2/dist/css/select2.css',
    'node_modules/bootstrap3/dist/css/bootstrap.css'
];

var riotDataClient = [
    'riotdata/**'
]

function string_src(filename, string) {
    var src = require('stream').Readable({ objectMode: true })
    src._read = function () {
      this.push(new gutil.File({
        cwd: "",
        base: "",
        path: filename,
        contents: new Buffer(string)
      }))
      this.push(null)
    }
    return src
  }

function cleanRiotData() {
    return del(['riotdata/**', 'src/riotdata/**'], {force: true});
}

function getRiotData(cb) {
    request('https://ddragon.leagueoflegends.com/api/versions.json', (error, response, body) => {
        var versions = JSON.parse(body);
        var latestVersion = versions[0];
        request(`http://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`, (error, response, body) => {
            var championData = JSON.parse(body);
            string_src('champions.json',body).pipe(dest('riotdata/')).on('finish', () => {
                string_src('champions.json',body).pipe(dest('src/riotdata/')).on('finish', () => {
                    var championList = [];

                    for(var championName in championData.data) {
                        championList.push(championName);
                    }
                    download(championList.map((championName) => {
                        return `http://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${championName}.png`;
                    })).pipe(dest('riotdata/img/champion/')).on('finish', () => {
                        cb();
                    });
                });
            });
        });
    });
}


function clean() {
    return del('build/**', {force: true});
}

function servertypescript(cb) {
    exec('tsc', {
        'cwd' : './src'
    });
    cb();
}

function clienttypescript(cb) {
    exec('tsc', {
        'cwd' : './client'
    });
    cb();
}

function views() {
    return src('views/**').pipe(dest('build/views/'));
}

function static() {
    return src('static/**').pipe(dest('build/static/'));
}

function npmLibs() {
    return src(npmClientLibs).pipe(dest('build/static/lib/'));
}

function npmCss() {
    return src(npmClientCss).pipe(dest('build/static/css/'));

}

function riotClient() {
    return src(riotDataClient).pipe(dest('build/static/'))
}
var client = parallel(views, static, npmLibs, npmCss, clienttypescript, riotClient);

exports.servertypescript = servertypescript;
exports.clienttypescript = clienttypescript;
exports.views = views;
exports.clean = clean;
exports.static = static;
exports.npmLibs = npmLibs;
exports.npmCss = npmCss;
exports.riotClient = riotClient;
exports.client = client;
exports.getRiotData = getRiotData;
exports.cleanRiotData = cleanRiotData;
exports.default = series(clean, servertypescript, client);