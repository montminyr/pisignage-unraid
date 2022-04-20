'use strict';

var config = require('../../config/config'),
    rest = require('../others/restware'),
    fs = require('fs'),
    path = require('path'),
    async = require('async');

var systemPlaylists = [
    {
        name:"TV_OFF" ,
        settings: {},
        assets:[],
        layout:"1",
        schedule:{}
    }
]

var isPlaylist = function (file) {
    return (file.charAt(0) == '_' && file.charAt(1) == '_' && file.slice(-5) == ".json");
}

exports.newPlaylist = function ( playlist, cb) {
    var file = path.join(config.mediaDir, ("__" + playlist + '.json')),
        data = {name:playlist,settings:{ticker:{enable:false,behavior: 'scroll', textSpeed: 3, rss: { enable: false , link: null, feedDelay:10 }},
                ads:{adPlaylist:false,adCount:1,adInterval:60},
                audio: {enable: false,random: false,volume: 50}
            },
            assets:[],layout:'1',
            templateName:"custom_layout.html",
            schedule:{}
    };


    fs.writeFile(file, JSON.stringify(data, null, 4), function (err) {
        cb(err,data);
    })
}

exports.index = function (req, res) {

    var assetDir = path.join(config.mediaDir);

    fs.readdir(assetDir, function (err, files) {
        if (err) {
            return rest.sendError(res, 'directory read error', err);
        } else {
            var playlists = files.filter(isPlaylist),
                list = [];
            playlists.sort(function(str1,str2){return (str1.localeCompare(str2,undefined,{numeric:true}));});
            var readFile = function (plfile, cb) {
                var playlist = {
                    settings: {},
                    assets: [],
                    name: path.basename(plfile, '.json').slice(2)
                }
                fs.readFile(path.join(assetDir, plfile), 'utf8', function (err, data) {
                    if (err || !data)
                        list.push(playlist);
                    else {
                        var obj = {};
                        try {
                            obj = JSON.parse(data);
                        } catch (e) {
                            console.log("playlist index parsing error for " + req.installation)
                        }
                        playlist.settings = obj.settings || {};
                        playlist.assets = obj.assets || [];
                        playlist.layout = obj.layout || '1';
                        playlist.templateName = obj.templateName || "custom_layout.html";
                        playlist.videoWindow = obj.videoWindow || null;
                        playlist.zoneVideoWindow = obj.zoneVideoWindow || {};
                        playlist.schedule = obj.schedule || {};
                        list.push(playlist);
                    }
                    cb();
                })
            }

            async.eachSeries(playlists, readFile, function (err) {
                if (err) {
                    return rest.sendError(res, 'playlist read error', err);
                } else {
                    return rest.sendSuccess(res, ' Sending playlist list', list.concat(systemPlaylists));
                }
            })

        }
    });

}

exports.getPlaylist = function (req, res) {

    if (req.query['file'] == "TV_OFF")
        return rest.sendError(res, 'System Playlist, can not be edited');

    var file = path.join(config.mediaDir,  ("__" + req.params['file'] + '.json'));

    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            return rest.sendError(res, 'playlist file read error', err);
        } else {
            var playlist = {
                settings: {},
                layout: '1',
                assets: [],
                videoWindow: null,
                zoneVideoWindow: {},
                templateName: "custom_layout.html"
            }
            if (data) {
                var obj = {};
                try {
                    obj = JSON.parse(data);
                } catch (e) {
                    console.log("getPlaylist parsing error for " + req.installation)
                }
                playlist.settings = obj.settings || {};
                playlist.assets = obj.assets || [];
                playlist.layout = obj.layout || '1';
                playlist.templateName = obj.templateName || "custom_layout.html";
                playlist.videoWindow = obj.videoWindow || null;
                playlist.zoneVideoWindow = obj.zoneVideoWindow? obj.zoneVideoWindow : {};
                playlist.schedule = obj.schedule || {};
            }

            return rest.sendSuccess(res, ' Sending playlist content', playlist);
        }
    });
}

exports.createPlaylist = function (req, res) {

    exports.newPlaylist(req.body['file'], function (err,data) {
        if (err) {
            rest.sendError(res, "Playlist write error", err);
        } else {
            rest.sendSuccess(res, "Playlist Created: ", data);
        }
    });
}

exports.savePlaylist = function (req, res) {

    var file = path.join(config.mediaDir,  ("__" + req.params['file'] + '.json'));

    fs.readFile(file, 'utf8', function (err, data) {
        if (err && (err.code == 'ENOENT') && req.params['file'] == "TV_OFF") {
            data = JSON.stringify(systemPlaylists[0]);
            err = null;
        }
        if (err) {
            rest.sendError(res, "Playlist file read error", err)
        } else {
            var fileData = {}, dirty = false;
            fileData.version = 0;
            fileData.layout = "1";

            if (data) {
                try {
                    fileData = JSON.parse(data);
                } catch (e) {
                    console.log("savePlaylist parsing error for ")
                }
                fileData.version = fileData.version || 0;
            }
            if (req.body.name) {
                fileData.name = req.body.name;
                dirty = true;
            }
            if (req.body.settings) {
                fileData.settings = req.body.settings;
                dirty = true;
            }

            if (req.body.assets) {
                fileData.assets = req.body.assets;
                dirty = true;
            }
            if (req.body.schedule) {
                fileData.schedule = req.body.schedule;
                dirty = true;
            }
            if (req.body.layout) {
                fileData.layout = req.body.layout;
                fileData.templateName = req.body.templateName;
                fileData.videoWindow = req.body.videoWindow|| null;
                fileData.zoneVideoWindow = req.body.zoneVideoWindow || null;
                dirty = true;
            }

            if (dirty) {
                fileData.version += 1;
                fs.writeFile(file, JSON.stringify(fileData, null, 4), function (err) {
                    if (err) {
                        rest.sendError(res, "Playlist save error", err);
                    } else {
                        rest.sendSuccess(res, "Playlist Saved: ", fileData);
                    }
                });
            } else {
                rest.sendSuccess(res, "Nothing to Update: ", fileData);
            }
        }
    });

}

