'use strict';

const Promise = require('bluebird');
const request = require('request');
const cheerio = require('cheerio');

const Show = require('./show');

class EZTVClient {
  constructor(url) {
    if(!url) this.url = 'https://eztv.ag';
    else this.url = url;
  }

  getShows(options){
    console.log('looking for', options);
    return new Promise(function(resolve, reject) {
      request(this.url, function (error, response, body){
    		if(response.statusCode !== 200)
    			return reject(new Error("Error while loading URL "+this.url+", receiving code "+response.statusCode));
    		if (!error) {
    			var list = [];
    			var $ = cheerio.load(body);
    			var $elements = $("table.forum_header_border").eq(2).find("tr[name=hover]").filter(function(){
    				var title = $(this).find("td").eq(1).find("a").text();
            console.log("title", title);
    				return title.toLowerCase().indexOf(options.query.toLowerCase()) >= 0;
    			});

    			$elements.each(function(i, e) {

    				var show = new Show(this.url);
    				show.url = $(e).find("td:nth-child(1) a").attr("href");
    				if (!show.url) {
    					return reject(new Error("Unable to find URL for this show"));
    				}
    				var regex = show.url.match(/\/shows\/(\d+)\/([^\/]+)/);
    				if (!regex) {
    					return reject(new Error("URL of the show is not in a supported format", show.url));
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
    				return resolve(list);
    			}
    			else {
    				// TODO should retry
    				return reject(new Error('No episode found for query: ', options.query));
    			}
    		}
    		else{
    			return reject(error);
    		}
    	}.bind(this));
    }.bind(this));
  }
}

module.exports = EZTVClient;
