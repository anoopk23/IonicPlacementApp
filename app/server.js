// Dependencies
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var proc = require('process'); //to set debugging environment variables
var event_emitter = require('events');

class Emitter extends event_emitter {}
const emitter = new Emitter();

// error listner
emitter.on('error', (err) => {
    debug('Unexpected error on emitter', err);
});


var namespace = 'app_debug';
const debug = require('debug')(namespace);

const name = 'app';

proc.env['DEBUG'] = namespace;
// Mongo DB
mongoose.connect('mongodb://127.0.0.1:27017/test', function(err) {

    if (err) {
        console.log('error connecting db with following error:');
        console.log(err);
    }
    else{
        console.log('connected to db');
    }
});

// Express
var app = express();
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8100');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    // console.log('header below:');
    // console.log(res);
    next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());



// Routes
app.use('/api', require('./api'));

// app.route('/api/companies/:companyid/reg-list')
//     .get(function(req, res) {
//         companies.findOne({_id:req.params.companyid}, function (err, docs) {
//             // res.json(docs[0].reg_list);
//             console.log(docs.reg_list);
//             // docs.reg_list.

//         }).
//         populate('reg_list').
//         exec(function (err, company) {
//             if (err) return handleError(err);
//             console.log("reg_list here:");
//             console.log(company.reg_list);
//             res.json(company.reg_list)
//         // prints "The creator is Aaron"
//         });
//     })
//     .post(function (req, res) {
//         // res.send('posting')
//         var rl = [];

//     })
//     .put(function (req, res) {
//         res.send('putting')
//     });



var companies = require('./company').mongoose;
var students = require('./student').mongoose;
app.get('/api/companies/:companyid/reg-list', function(req, res) {
    companies.findOne({_id:req.params.companyid}, function (err, docs) {
        // res.json(docs[0].reg_list);
        // console.log("reg_list here of " + docs._id + ' ' + docs.name);
        // console.log(docs.reg_list);
        // docs.reg_list.
        if(err) res.send(err);
        if(!docs) console.log('No docs: ' + docs);

    }).
    populate('reg_list').
    exec(function (err, company) {
        if (err) return handleError(err);
        // console.log(company.reg_list);
        var reg_list = company.reg_list;
        var unreg_list = [];
        students.find(function (err, students) {
            if(err) res.send(err);
            for (var i = 0; i < students.length; i++) {
                var exist = false;
                for (var j = reg_list.length - 1; j >= 0; j --) {
                    if(students[i].id == reg_list[j].id) {
                        exist = true;
                    }
                }
                if(!exist) {
                    unreg_list.push(students[i]);

                }

            }
            res.json({reg_list: reg_list, unreg_list: unreg_list})
        })
        // res.json(company.reg_list)
    // prints "The creator is Aaron"
    });
})
// var test = require('./api');

// Start Server
app.listen(3000);
console.log('API is running on port 3000')
