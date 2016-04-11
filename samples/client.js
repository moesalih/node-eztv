'use strict';

const EZTV = require('./lib/eztvClient');
const util = require('util');

let eztv = new EZTV();
eztv.getTodayReleases()
.then(function(results){
	results.filter(ep => ep.show.title.match('John Oliver'))
  .forEach(ep => console.log(ep));
})
.catch(console.error);
