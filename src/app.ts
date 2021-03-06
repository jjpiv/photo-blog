import express from 'express';
import fs from 'fs';
// import request from 'request';
import ejs from 'ejs';
import multer from 'multer';
import bodyParser from 'body-parser';
// import lodash from 'lodash';
import mongoose from 'mongoose';
import path from 'path'
import s3Upload from './s3_addToBucket';

const app = express();
const upload = multer({dest: "storage/"});

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/blogDB', {useNewUrlParser: true, useUnifiedTopology: true})

const postSchema = new mongoose.Schema({
title: String,
content: String,
imageLocation: String,
timestamp: String
})

const Post = mongoose.model("Post", postSchema);

app.get("/", function(req: any, res: any) {
    Post.find(function(err, posts) {
        if(err) {
            console.log(err)
        } else {
            res.render("index", {posts: posts})
        }
    });
})

app.get("/new-post", function(req: any, res: any) {
    res.render("new-post");
});

app.get("/posts/:postId", function(req: any, res: any) {
    Post.findOne({_id: req.params.postId}, function(err, post) {
        if(err) {
            console.log(err);
        } else {
            res.render("post", {post: post})
        }
    })
});

app.post("/new-post", upload.single('image'),function(req: any, res: any) {
    const title: string = req.body.title;
    const textCon: string = req.body.content;
    const imageLoc: string = req.file?.filename + "." + req.file?.mimetype.slice(6);
    const imageCon: any = fs.createReadStream(req.file?.path);

    function blogPost(imageLocation: string) {
        console.log(req.file.mimetype);
        const post: any = new Post({
        title: title,
        content: textCon,
        imageLocation: imageLocation,
        timestamp: new Date().toISOString(),
        });

        post.save();
        res.redirect("/");
    }

    s3Upload("daytuhbuckit", imageLoc, imageCon, blogPost);
    // res.redirect("/");
})

app.listen(3000, function():void {
    console.log("Server is listening on 3000")
})