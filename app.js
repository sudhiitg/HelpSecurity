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
//entering the home route

app.get("/", function (req, res) {
    res.render("main.ejs");
  });
  
  //enabling the login buttons
  
  app.post("/", function (req, res) {
    if (req.body.dark == "admin") {
      res.redirect("/admin");
      ok1 = true;
    } else if (req.body.light == "stud") {
      res.redirect("/stud");
    }
  });
  //entering the student loginpage
  
  app.get("/stud", function (req, res) {
    if (home || logout) {
      if (logout) {
        logout = false;
        home = true;
        ok = false;
        check = false;
        // console.log(ok);
      }
      res.render("index1.ejs");
    }
  });
  
  //sending otp to the the user
  
  app.post("/stud", function (req, res) {
    var email = req.body.email;
    outlook = email;
    // console.log(outlook);
    if (outlook != "") {
      findOneListingByEmail(outlook);
      setTimeout(main, 1000);
      async function main() {
        sendotp();
        // console.log(hostel);
        if (hostel != null) {
          res.redirect("/otp");
        } else {
          res.redirect("/stud");
        }
      }
      ok = true;
    } else {
      res.redirect("/stud");
    }
  });
  
  //getting otp
  
  app.get("/otp", function (req, res) {
    if (ok) {
      res.render("otp.ejs", { context: outlook });
      ok = false;
    } else {
      hostel = null;
      res.redirect("/stud");
    }
  });
  //checking otp entered by the user
  
  app.post("/otp", function (req, res) {
    var otp1 = req.body.otp;
    // console.log(otp1);
    var sum = otp1[0] + otp1[1] + otp1[2] + otp1[3];
    if (+sum === OTP) {
      check = true;
      res.redirect("/home");
    } else {
      ok = true;
      res.redirect("/otp");
    }
  });
  //resending the otp
  app.post("/resend", function (req, res) {
    sendotp();
    res.redirect("/otp");
  });
  //performing the logout feature
  app.get("/logout", function (req, res) {
    logout = true;
    hostel = null;
    res.redirect("/");
  });
  //getting the home route
  app.get("/home",function(req,res){
    if(check){
    findOneListingByHostel(hostel);
    setTimeout(redirecttohome,2000);
    function redirecttohome(){
    var context;
    // console.log("hii");
    res.render("home.ejs",{context:[hostel,quantity]});
    home=false;
    }
    }
    else{
      hostel=null;
      res.redirect("/stud");
    }
  })
  var equip="none";
  //sending the request for booking the equipment
  app.post("/book",function(req,res){
    equip=req.body.book;
    findOneListingByHostel(hostel);
    setTimeout(getdata,2000);
    var updated=false;
    function getdata(){
      for(var i=0;i<equipname.length;i++){
        if(equipname[i]==equip){
          console.log(quantity[i]);
          if(quantity[i]!="Not Available" && quantity[i]!='0'){
            updated=true;
            alert("Request send to the Security");
            // prompt("Request sent to the security");
           
            updateoneListingByadmin(outlook,hostel,equip);
            res.redirect("/home");   
          }
        }
      }
      if(updated==false){
        alert("Current equipment is not available");
        res.redirect("/home");
      }
    }
  });
  //admin portal
app.get("/admin",function(req,res){
    if(ok1==true){
    res.render("admin.ejs");
    ok1=false;
    }
  })
  app.post("/admin",function(req,res){
    var usrname=req.body.admin;
    var pasword=req.body.password;
    if(usrname!="" && pasword!=""){
    findOneListingByadmin(usrname,pasword);
    setTimeout(getresult,1000);
    // console.log(result1);
    function getresult(){
    if(result1=="success"){
      // console.log("success");
      admincheck=true;
      res.redirect("/adminhome");
    }
    else{
      // console.log("fail");
      ok1=true;
      res.redirect("/admin");
    }
    }
  }
  else{
    res.redirect("/admin");
  }
  })
  app.get("/adminhome",function(req,res){
    if(admincheck==true){
    findListingByadmin(adminhostel);
    setTimeout(getadminpage,2000);
    function getadminpage(){
    var context;
    res.render("adminhome.ejs",{context:[book]});
    }
    }
    else{
      res.redirect("/admin");
    }
  });
  
  app.post("/adminhome",function(req,res){
    if(req.body.submit=="reload"){
    res.redirect("/");
    admincheck=false;
    }
  })
  app.post("/issuetime",function(req,res){
    var id=req.body.tag;
    for(var i=0;i<book.length;i++){
      if(book[i].id==id){
        if(book[i].issuedTime==null){
          updatetime();
          updateQuantity(hostel,equip,"sub",id);
          // res.redirect("/adminhome")
          alert("Successfully issued")
        }else{
          alert("you have issued already")
  
        }
      }
    }
    function updatetime(){
    var datetime=currentdatetime();
    updatelistingbyissuetime(id,datetime);
    }
    res.redirect("/adminhome");
   })
  
   app.post("/returntime",function(req,res){
    var id=req.body.tag;
    var returned=false;
    for(var i=0;i<book.length;i++){
      if(book[i].id==id){
        if(book[i].returnTime==null && book[i].issuedTime!=null){
          returned=true;
          updatetime();
          if(returned){
            updateQuantity(hostel,equip,"add");
          }
          // res.redirect("/adminhome");
        }
      }
    }
    
     if(returned==false){
      alert("Issue first");
    }
    function updatetime(){
      var datetime=currentdatetime();
      updatelistingbyreturntime(id,datetime);
    }
    setTimeout(redirectting,1000);
    function redirectting(){
    res.redirect("/adminhome");
    }
  
   })
   app.post("/delete",function(req,res){
    var id=req.body.tag;
    var deleted=false;
    for(var i=0;i<book.length;i++){
      if(book[i].id==id){
        if(book[i].issuedTime==null){
        deleted=true;
        deleteitemfromlist(id);
        }
      }
    }
    if(deleted==false){
      alert("First Return");
    }
    setTimeout(del,2000);
    function del(){
      res.redirect("/adminhome");
    }
   })