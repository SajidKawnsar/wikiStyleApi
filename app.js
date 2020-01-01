const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const assert = require("assert");
const lodash = require("lodash");

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wikiDB", {useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true});

const articleSchema = new mongoose.Schema({
  title: {
    type: "String",
    required: [true, "Title can't be empty..."]
  },
  content: {
    type: "String",
    required: [true, "Please add some data in content field..."]
  }
});

const Article = new mongoose.model('Article', articleSchema);

app.route("/articles")
  .get((req, res) => {
    Article.find({}, (err, foundArticles) => {
      if(!err){
        res.send(foundArticles);
      }else{
        res.send(err);
      }
    });
  })
  .post((req, res) => {
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });
    newArticle.save((err) => {
      if(!err){
        res.send({message: "New article posted successfully..."});
      }else{
        res.send(err);
      }
    });
  })
  .delete((req, res) => {
    Article.deleteMany({}, (err) => {
      if(!err){
        res.send({message: "Deleted all articles successfully..."});
      }else{
        res.send(err);
      }
    });
  });


  app.route("/articles/:articleTitle")
    .get((req, res) => {
      const title = req.params.articleTitle;
      Article.findOne({title: title}, (err, foundArticle) => {
        if(!err){
          res.send(foundArticle);
        }else{
          res.send(err);
        }
      });
    })
    .put((req, res) => {
      const articleToReplace = req.params.articleTitle;
      const title = req.body.title;
      const newArticle = {title: title, content: req.body.content};
      Article.replaceOne({title: articleToReplace}, newArticle, (err, opResult) => {
        if(!err){
          console.log(opResult);
          res.send({message: "Article replaced successfully..."});
        }else{
          res.send(err);
        }
      });
    })
    .patch((req, res) => {
        const title = req.params.articleTitle;
        const dataPatch = req.body;
        Article.updateOne({title: title}, {$set: dataPatch}, (err, opResult) => {
          if(!err){
            res.send(opResult);
          }else{
            res.send(err);
          }
        });
    })
    .delete((req, res) => {
      Article.deleteOne({title: req.params.articleTitle}, (err) => {
        if(!err){
          res.send({message: "Deleted article successfully..."});
        }else{
          res.send(err);
        }
      });
    });






app.listen(port, (err) => {
  assert.equal(null, err, "Error while creating a server...");
  console.log("Server is listening on port "+port);
});
