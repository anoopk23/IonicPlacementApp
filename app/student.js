// Dependencies
var express = require('express');
var restful = require('node-restful');
// var mongoose = restful.mongoose;
var mongoose = require('mongoose');

var namespace = 'app_debug';
const debug = require('debug')(namespace);


var studentSchema   = new mongoose.Schema({
	name: String,
	branch: String,
	id: String,
	cgpa: Number
});

debug('created student schema');


module.exports.restful = restful.model('tblstudent', studentSchema);
module.exports.mongoose = mongoose.model('tblstudent', studentSchema);