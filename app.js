// modules required to use in the project(nodemailer,express,bod-parser,mongoose,ejs)
const nodemailer = require("nodemailer");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const express=require("express");
const ejs=require("ejs");
const alert=require("alert");
const prompt=require("prompt-sync")(); 
require("dotenv").config();


// intialising app

var app=express();
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended:true}));

app.use(express.static("public"));
