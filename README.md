eztv
========

EZTV API module for Node.js



### Install

`npm install eztv --save`



### Use

```js
var eztv = require('eztv');
eztv.getShows({query: 'big bang'}, function(error, results) {
	// Do stuff...
}
```



### Methods


#### `getShows(options, callback)`

Returns a list of shows.

`options`: An optional options object. Currently supports:

- `query`: Show title to search for. If this option is ommited, all shows are returned.

`callback`: A function that takes two parameters:

- `error`: Error object or null.
- `results`: Array of shows. 

Each result is an object:

```js
{
	id: 23,
	slug: "the-big-bang-theory",
	status: "break",
	title: "The Big Bang Theory",
	url: "/shows/23/the-big-bang-theory/"
}
```



#### `getShowEpisodes(showId, callback)`

Returns a list of episodes for a given show.

`showId`: The show ID.

`callback`: A function that takes two parameters:

- `error`: Error object or null.
- `results`: Array of episodes.

**Returns:**

```js
{
	episodes: [...],
	id: 23,
	title: "The Big Bang Theory"}
```

Each episode is an object:

```js
{
	episodeNumber: 17,
	episodeNumber2: null,
	extra: "HDTV x264-LOL",
	id: 52823,
	magnet: "magnet:?xt=urn:btih:64DZYZWMUAVLIWJUXGDIK4QGAAIN7SL6&dn=The.Big.Bang.Theory.S07E17.HDTV.x264-LOL&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.publicbt.com:80&tr=udp://tracker.istole.it:80&tr=udp://open.demonii.com:80&tr=udp://tracker.coppersurfer.tk:80",
	proper: false,
	repack: false,
	seasonNumber: 7,
	show: "The Big Bang Theory",
	title: "The Big Bang Theory S07E17 HDTV x264-LOL",
	torrentURL: "http://piratebaytorrents.info/9715961/The_Big_Bang_Theory_S07E17_HDTV_x264-LOL.9715961.TPB.torrent",
	url: "/ep/52823/the-big-bang-theory-s07e17-hdtv-x264-lol/"
}
```
