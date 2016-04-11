'use strict';

const Promise = require('bluebird');
const request = require('request');
const cheerio = require('cheerio');

class Show {
  constructor(host) {
    this.host = host;
    this.url = null;
  }

  getShowEpisodes(qualityRequest) {
  	var targetedQualities = _getValidQualities(qualityRequest);
    return new Promise(function(resolve, reject) {
    	request(this.host + this.url, function (error, response, body) {
    		if(response.statusCode !== 200)
    			return reject(new Error("Error while loading URL "+this.host + this.url+", receiving code "+response.statusCode));
    		if (!error) {
    			var episodes = [];
    			var $ = cheerio.load(body);

    			var $episodes = $("table.forum_header_noborder tr[name=hover]");
    			$episodes.each(function(i, e) {
    				var episode = {};

    				episode.url = $(e).find("td").eq(1).find("a").attr("href");
    				if (!episode.url) return;
    				var urlRegex = episode.url.match(/\/ep\/(\d+)\/.*/);
    				if (urlRegex) {
    					episode.id = parseInt(urlRegex[1]);
    				}

    				episode.title = $(e).find("td").eq(1).find("a").text();
    				var titleRegex = episode.title.match(/(.+) s?(\d+)[ex](\d+)(e(\d+))?(.*)/i);
    				if (titleRegex) {
    					episode.show = titleRegex[1];
    					episode.seasonNumber = parseInt(titleRegex[2]);
    					episode.episodeNumber = parseInt(titleRegex[3]);
    					episode.episodeNumber2 = parseInt(titleRegex[5]);
    					episode.extra = titleRegex[6].trim();
    					var quality = episode.extra.match(/(HDTV|720p|1080p)/);
    					episode.quality = quality ? quality[1] : "unknown";
    					episode.proper = episode.extra.toLowerCase().indexOf("proper") >= 0;
    					episode.repack = episode.extra.toLowerCase().indexOf("repack") >= 0;
    				}
    				else {
    					return reject(new Error("Title of the episode is not in a supported format", episode.title));
    				}

    				episode.magnet = $(e).find("td").eq(2).find("a.magnet").attr("href");
    				episode.torrentURL = $(e).find("td").eq(2).find("a.download_1").attr("href");

    				if(!targetedQualities || _validateQuality(targetedQualities, episode.quality))
    					episodes.push(episode);

    			});
    			return resolve(episodes);
    		}
    		else {
    			return reject(error, null);
    		}
    	}.bind(this));
    }.bind(this));
  };
}

module.exports = Show;
