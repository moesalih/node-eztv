import cheerio from 'cheerio';
import fetch from 'isomorphic-fetch';

const urlRoot = 'https://eztv.ag';
// const urlRoot = 'https://eztv-proxy.net';

export async function getShows(options = {}) {
  try {
    const results = await fetch(`${urlRoot}/showlist`).then(res => res.text());
    const $ = cheerio.load(results);
    const $elements = $('table.forum_header_border tr[name=hover]');

    const shows = $elements.map((i, e) => {
      const url = $(e).find('td').eq(0).find('a')
        .attr('href');
      if (!url) {
        throw new Error('Unable to find show url');
      }
      const regex = url.match(/\/shows\/(\d+)\/([^/]+)/);
      if (!regex) {
        throw new Error(`Unparsed show: ${url}`);
      }
      const id = Number(regex[1]);
      const slug = regex[2];

      const title = $(e).find('td').eq(0).text();
      const status = $(e).find('td').eq(1).find('font')
        .attr('class');

      return {
        title,
        id,
        slug,
        url,
        status
      };
    }).get();

    if (options && options.query) {
      const lowercaseQuery = options.query.toLowerCase();
      const foundShow = shows.find(e => e.title && e.title.toLowerCase().includes(lowercaseQuery));
      if (foundShow) {
        return foundShow;
      }
    }

    return shows;
  } catch (error) {
    throw new Error(`Error getting shows: ${error}`);
  }
}

export async function getShowEpisodes(showId, showName) {
  try {
    if (typeof showId !== 'number' && !(showId instanceof Number)) {
      throw new Error('getShowEpisodes show id argument must be a number');
    }
    if (typeof showName !== 'string' && !(showName instanceof String)) {
      throw new Error('getShowEpisodes show name argument must be a string');
    }

    const results = await fetch(`${urlRoot}/shows/${showId}/${showName}`).then(res => res.text());

    const $ = cheerio.load(results);
    const showTitle = $('td.section_post_header').eq(0).find('b').text();

    const $episodes = $('table.forum_header_noborder tr[name=hover]');
    const episodes = $episodes.map((i, e) => {
      const url = $(e).find('td').eq(1).find('a')
        .attr('href');

      if (!url) {
        throw new Error('Unable to find show url');
      }

      const urlRegex = url.match(/\/ep\/(\d+)\/.*/);
      const id = urlRegex ? Number(urlRegex[1]) : undefined;
      const episodeTitle = $(e).find('td').eq(1).find('a')
        .text();
      const titleRegex = episodeTitle.match(/(.+) s?(\d+)[ex](\d+)(e(\d+))?(.*)/i);

      if (!titleRegex) {
        throw new Error(`Unparsed show: ${url}`);
      }

      const show = titleRegex[1];
      const seasonNumber = Number(titleRegex[2]);
      const episodeNumber = Number(titleRegex[3]);
      const episodeNumber2 = Number(titleRegex[5]);
      const extra = titleRegex[6].trim();
      const proper = extra.toLowerCase().includes('proper');
      const repack = extra.toLowerCase().includes('repack');

      const size = String($(e).find('td').eq(3).text());
      const magnet = $(e).find('td').eq(2).find('a.magnet')
        .attr('href');
      const torrentURL = $(e).find('td').eq(2).find('a.download_1')
        .attr('href');

      return {
        id,
        episodeTitle,
        show,
        seasonNumber,
        episodeNumber,
        episodeNumber2,
        proper,
        repack,
        size,
        magnet,
        torrentURL
      };
    }).get();

    return {
      id: showId,
      showTitle,
      episodes
    };
  } catch (error) {
    throw new Error(`Error getting show episodes: ${error}`);
  }
}

export default {
  getShows,
  getShowEpisodes
};
