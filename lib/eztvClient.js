'use strict';

const Promise = require('bluebird');
const request = require('request');
const cheerio = require('cheerio');

const Show = require('./show');
const Episode = require('./episode');

class EZTVClient {
  constructor(url) {
    if(!url) this.url = 'https://eztv.ag';
      else this.url = url;
  }

  getTodayReleases(){
    return new Promise(function(resolve, reject) {
      request(this.url, function (error, response, body){
        if(response.statusCode !== 200)
          return reject(new Error("Error while loading URL "+this.url+", receiving code "+response.statusCode));
        if (!error) {
          let list = [];
          let $ = cheerio.load(body);
          let elements = $("table.forum_header_border").eq(2).find("tr.forum_header_border, tr.forum_space_border");
          // Skip the first header (= date of the day)
          var i = 1;
          var stillToday = true;
          while(i < elements.length && stillToday){
            var e = elements.eq(i);
            // New date header => yesterday
            if(e.attr('class') === 'forum_space_border') stillToday = false;
            else{
              let columns = e.find('td');
              let title = columns.eq(1).text();
              if (title.endsWith(", The")) {
                title = "The " + title.substring(0, title.indexOf(', The'));
              }
              title = title.trim();
              var episode;
              try{
                episode = Episode.parse(title);
              }
              catch(err){
                console.warn(err);
                i++;
                continue;
              }
              episode.magnet = columns.eq(2).find('a.magnet').attr('href');

              let show = episode.show;
              show.url = e.find("td:nth-child(1) a").attr("href");
              if (!show.url) {
                return reject(new Error("Unable to find URL for this show"));
              }
              let regex = show.url.match(/\/shows\/(\d+)\/([^\/]+)/);
              if (!regex) {
                return reject(new Error("URL of the show is not in a supported format", show.url));
              }
              show.id = parseInt(regex[1]);
              show.slug = regex[2];

              list.push(episode);
              i++;
            }
          }

          if(list.length > 0){
            return resolve(list);
          }
          else {
            return reject(new Error('No episode today'));
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
