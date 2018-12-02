'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
const shortid = require('shortid');

//const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
const url = 'mongodb://localhost:27017';
//change to connection string when live 

module.exports = function (app) {

  app.route('/api/issues/:project')
    .get(function (req, res) {
      let project = req.params.project;
      let search = req.query;
      console.log(search)
      if (search.open) {
        search.open = String(search.open) == "true";
      }
      MongoClient.connect(url, {
        useNewUrlParser: true
      }, function (err, client) {
        if (err) throw err;
        const db = client.db('freecodecamp')
        //change db name when live 
        db.collection('issues').find(search).toArray((err, doc) => {
          res.json(doc);
        });
      })
    })
    //new issue 
    .post(function (req, res) {
      console.log('sda');
      let data = {
        _id: shortid.generate(),
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      }
      MongoClient.connect(url, {
        useNewUrlParser: true
      }, function (err, client) {
        if (err) throw err;
        const db = client.db('freecodecamp')
        db.collection('issues').insertOne(data, (err, doc) => {
          res.json(data);
        });
      })
    })
    //update 
    .put(function (req, res) {
      let project = req.params.project;
      let data = {
        _id: req.body._id,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
        updated_on: new Date(),
        open: req.body.open
      }
      let x;
      for (x in data) {
        if (data[x] === '' || data[x] === undefined) {
          delete data[x];
        }
      }

      (data.open === 'false') ? data.open = false: data.open = true;

      MongoClient.connect(url, {
        useNewUrlParser: true
      }, function (err, client) {
        if (err) throw err;
        const db = client.db('freecodecamp')
        db.collection('issues').findOneAndUpdate({
          _id: data._id
        }, {
          $set: data
        }, {
          returnNewDocument: true
        }, function (error, doc) {
          if (error) throw error;
          (doc.value === null) ? res.send('Issue ' + data._id + ' does not exist'): res.send('successfully updated');
        });
      });
    })

    .delete(function (req, res) {
      let project = req.params.project;
      let query = {
        _id: req.body._id
      };
      MongoClient.connect(url, {
        useNewUrlParser: true
      }, function (err, client) {
        if (err) throw err;
        const db = client.db('freecodecamp')
        db.collection('issues').findOneAndDelete(query, (err, doc) => {
          if (err) {
            res.send("could not find id: " + req.body._id + err)
          }
          res.send("Deleted issue: " + req.body._id);
        });
      });
    });

};