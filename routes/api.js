/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
const { request } = require('chai');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DATABASE; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

//console.log(ObjectId)

module.exports = function (app, db) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      if (req.query.open === "true") {
        req.query.open = true;
      }else if (req.query.open === "false") {
        req.query.open = false;
      }

      db.collection("issues").find({issue_title: project}).filter(req.query).toArray((err, data) => res.json(data));;

    })
    
    .post(function (req, res){
      var project = req.params.project;

      if (!req.body.issue_title || req.body.issue_title === "" || !req.body.issue_text || req.body.issue_text === "" || !req.body.created_by || req.body.created_by === "") {
        res.send("all * fields are required");
      }else{
        let date = new Date();
        db.collection("issues").insertOne({
            "issue_title": req.body.issue_title,
            "issue_text": req.body.issue_text,
            "created_on": date,
            "updated_on": date,
            "created_by": req.body.created_by,
            "assigned_to": req.body.assigned_to,
            "open": true,
            "status_text": req.body.status_text  
          },(err, data) => {
            //console.log(data.ops[0])
            res.send(data.ops[0])
        });  
      }    
    })
    
    .put(function (req, res){

      var project = req.params.project;

      var updateObj = {};

      //console.log(req.body)

      if (req.body.issue_title && req.body.issue_title !== "") {
        updateObj.issue_title = req.body.issue_title;      
      }
      if (req.body.issue_text && req.body.issue_text !== "") {
        updateObj.issue_text = req.body.issue_text;      
      }
      if (req.body.created_by && req.body.created_by !== "") {
        updateObj.created_by = req.body.created_by;      
      }
      if (req.body.assigned_to && req.body.assigned_to !== "") {
        updateObj.assigned_to = req.body.assigned_to
      }
      if (req.body.status_text && req.body.status_text !== "") {
        updateObj.status_text = req.body.status_text
      }
      if (req.body.open === "false") {
        console.log("closed");
        updateObj.open = false;
      }
      if (Object.keys(updateObj).length === 0) {
        res.send("no updated field sent")
      }else { 
        updateObj.updated_on = new Date();

        try {
          var id = new ObjectId(req.body._id)
        }
        catch(err){
          console.log("invalid id, set to null")
          var id = null;
        }

        db.collection("issues").findOneAndUpdate({_id: id}, {$set: updateObj}, (err, data) => {
          if (err || !data) {
            var response = "could not update " + req.body._id
          }else {
            var response = "successfully updated"
          }
          res.send(response)
        }); 
      }
    })
    
    .delete(function (req, res){
      var project = req.params.project;

      if (!req.body._id) {
        res.send("_id error")
      }else {

        try {
          var id = new ObjectId(req.body._id)
        }
        catch(err){
          console.log("invalid id, set to null")
          var id = null;
        }
        let response = ""
        db.collection("issues").findOneAndDelete({_id: id}, (err, data) => {
          if (err || !data.value) {
            response = "could not delete " + req.body._id;
          }else {
            response = "deleted " + req.body._id;
          }
          res.send(response);
        });
      }
    });    
};
