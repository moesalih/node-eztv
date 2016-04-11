'use strict';

var request = require('request');
var cheerio = require('cheerio');

function _validateQuality(targets, quality){
	var i = 0;
	while(targets[i] !== quality && i < targets.length){
		i++;
	}

	return i < targets.length;
}

function _getValidQualities(target){
	// No quality criteria
	if(!target){
		return null;
	}

	// User already provided an array
	if(Array.isArray(target))
		return target;

	var targetArray;
	var plusRegExp = target.match(/([^+]+)/);
	// User provided a comma separated list
	if(target.indexOf(',') > 0){
		targetArray = target.split(',');
		targetArray.forEach(function(quality, index){
			targetArray[index] = quality.trim();
		});
	}
	// User provided a minimum qualiy in a '+ form' (HDTV+, 720p+,...)
	else if(plusRegExp){
		var base = plusRegExp[1];
		targetArray = [base];
		switch(base){
			case 'HDTV':
				targetArray.push('720p');
				targetArray.push('1080p');
				break;
			case '720p':
				targetArray.push('1080p');
				break;
			default:
		}
	}
	else{
		targetArray = target;
	}
	console.log(targetArray);
	return targetArray;
}

function EZTVClient(url){
	if(!url)
		this.url = "https://eztv.ag";
	else
		this.url = url;
};

function Show(host){
	this.host = host;
}

EZTVClient.prototype.getShows = function(options, callback) {
	request(this.url + "/showlist/", function (error, response, body){
		if(response.statusCode !== 200)
			return callback(new Error("Error while loading URL "+this.host + this.url+", receiving code "+response.statusCode));
		if (!error) {
			var list = [];
			var $ = cheerio.load(body);
			var $elements = $("table.forum_header_border tr[name=hover]").filter(function(){
				var title = $(this).find("td").eq(1).text();
				return title.toLowerCase().search(options.query.toLowerCase()) >= 0;
			});
			$elements.each(function(i, e) {

				var show = new Show(this.url);
				show.url = $(e).find("td").eq(1).find("a").attr("href");
				if (!show.url) {
					return callback(new Error("Unable to find URL for this show"));
				}
				var regex = show.url.match(/\/shows\/(\d+)\/([^\/]+)/);
				if (!regex) {
					return callback(new Error("URL of the show is not in a supported format", show.url));
				}
				show.id = parseInt(regex[1]);
				show.slug = regex[2];

				var title = $(e).find("td").eq(1).text();
				if (S(title).endsWith(", The")) {
					title = "The " + S(title).chompRight(", The").s;
				}
				show.title = title;
				show.status = $(e).find("td").eq(2).find("font").attr("class");

				list.push(show);

			}.bind(this));

			if(list.length > 0){
				callback(null, list);
			}
			else {
				// TODO should retry
				callback(new Error('No episode found for query: ', options.query));
			}
		}
		else{
			callback(error);
		}
	}.bind(this));

};

Show.prototype.getShowEpisodes = function(qualityRequest, callback) {
	var targetedQualities = _getValidQualities(qualityRequest);
	request(this.host + this.url, function (error, response, body) {
		if(response.statusCode !== 200)
			return callback(new Error("Error while loading URL "+this.host + this.url+", receiving code "+response.statusCode));
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
					return callback(new Error("Title of the episode is not in a supported format", episode.title));
				}

				episode.magnet = $(e).find("td").eq(2).find("a.magnet").attr("href");
				episode.torrentURL = $(e).find("td").eq(2).find("a.download_1").attr("href");

				if(!targetedQualities || _validateQuality(targetedQualities, episode.quality))
					episodes.push(episode);

			});
			callback(null, episodes);
		}
		else {
			callback(error, null);
		}
	}.bind(this));
};

module.exports = EZTVClient;
