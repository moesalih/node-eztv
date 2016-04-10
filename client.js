'use strict';

const EZTV = require('./lib/eztvClient');
const util = require('util');

let eztv = new EZTV();
eztv.getShows({query: 'conan'})
.then(function(results){
	console.log(results);
})
.catch(console.error);
