'use strict';


class Episode {
  constructor(){}

  static parse(name){
    var titleRegex = name.match(/(.+) s?(\d+)[ex](\d+)(e(\d+))?(.*)/i);
    var episode = new Episode();
    if (titleRegex) {
      episode.show = {title: titleRegex[1]};
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
      throw new Error("Title of the episode is not in a supported format: " + name);
    }

    return episode;
  }
}

module.exports = Episode;
