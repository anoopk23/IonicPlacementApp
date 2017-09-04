// Dependencies
var express = require('express');
var router = express.Router();

var namespace = 'app_debug';
const debug = require('debug')(namespace);


var students = require('./student').restful;
students.methods(['get', 'put', 'post', 'delete']);
students.register(router, '/students');
debug('Student regestered at "/students"');


var companies = require('./company').restful;
companies.methods(['get', 'put', 'post', 'delete']);
companies.register(router, '/companies');
debug('Companies regestered at "/companies"');


module.exports = router;
