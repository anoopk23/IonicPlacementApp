// Dependencies
var express = require('express');
var restful = require('node-restful');
// var mongoose = restful.mongoose;
var mongoose = require('mongoose');

var student = require('./student').mongoose;


var namespace = 'app_debug';
const debug = require('debug')(namespace);


// console.log('here check');
// console.log(student);


var companySchema   = new mongoose.Schema({
	name: String,
	branches: [String],
	date: Date,
	reg_list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tblstudent' }]
});

debug('created company schema');

module.exports.restful = restful.model('tblcompany', companySchema);
module.exports.mongoose = mongoose.model('tblcompany', companySchema);