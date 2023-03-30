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

// variables used in student database

var outlook=null;
var hostel=null;
var OTP;
var check=false;
let ok=false;
let home=true;
let logout=false;
var username="username";
var pwd="pwd";
var equipname=['bat','lawn tennis','table tennis','biliyards','carrom','stump','squash','football','basketball','volleyball']

//variables used in admin database

var quantity=[];
var result1="fail";
var book=[];
var ok1=false;
var adminhostel=null;
var admincheck=false;

// models used in creating database
//userdatabase

var userSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  email:{
    type:String,
    required:true,
  },
  hostel:{
    type:String,
    required:true,
  }
});
mongoose.model('user',userSchema);
//hosteldatabase
var hostelSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  username:{
    type:String,
    required:true,
  },
  pwd:{
    type:String,
    required:true,
  },
  bat:{
    type:String,
    required:true,
  },
  lawn_tennis:{
    type:String,
    required:true,
  },
  table_tennis:{
    type:String,
    required:true,
  },
  biliyards:{
    type:String,
    required:true,
  },
  carrom:{
    type:String,
    required:true,
  },
  stump:{
    type:String,
    required:true,
  },
  squash:{
    type:String,
    required:true,
  },
  football:{
    type:String,
    required:true,
  },
  basketball:{
    type:String,
    required:true,
  },
  volleyball:{
    type:String,
    required:true,
  },

});
mongoose.model('hostel',hostelSchema);
//admindatabase
var adminSchema = new mongoose.Schema({
  email:{
    type:String,
    required:true,
  },
  hostel:{
    type:String,
    required:true,
  },
  equipment:{
    type:String,
    required:true
  },
  issuedTime:{
    type:String,
    required:false,
  },
  returnTime:{
    type:String,
    required:false,
  }
});
mongoose.model('admin',adminSchema);

//creating a server
const PORT = process.env.PORT || 5050;
//connecting mongodatabase to the server
const MONGO_URI =
  process.env.MONGO_URI || process.env.url_of_mongo;
//Checking mongodbconnection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Successful DB connection"))
  .catch((err) => console.error("DB connection failed"));

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
//Finding email using mongodbdatabase
const findOneListingByEmail = async (email) => {
	const result = await mongoose.model('user').findOne({ email:email });
    if(result!=null){
	  hostel=result.hostel;
    }
}
const findOneListingByadmin=async function(username1,pwd){
	const result =await mongoose.model('hostel').findOne({ username:username1});
    if(pwd!=result.pwd){
     result1="fail";
    }
    else{
      adminhostel=result.name;
      result1="success";
    }
}
const findListingByadmin=async function(adminhostel){
	const result =await mongoose.model('admin').find({hostel:adminhostel});
  book=[]
  for(var i=0;i<result.length;i++){
    if(result[i].issuedTime!=null && result[i].returnTime!=null){}
    else{
      book.push(result[i]);
    }
  }
  // console.log(result);
}
const updateoneListingByadmin= function(emailid,hostel,equip){
  var adminmodel= mongoose.model('admin');
  var admin=new adminmodel({email:emailid,hostel:hostel,equipment:equip});
	admin.save();
}
const updatelistingbyissuetime=function(id,time){
  console.log(id);
	mongoose.model('admin').updateOne({_id:id},{issuedTime:time},function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Success");
    }
  });
}
const deleteitemfromlist=function(id){
	mongoose.model('admin').deleteOne({_id:id},function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Success");
    }
  });
}
const updatelistingbyreturntime=function(id,time){
  console.log(id);
	mongoose.model('admin').updateOne({_id:id},{returnTime:time},function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Success");
    }
  });
}
const findOneListingByHostel = async (hostel) => {
	const result = await mongoose.model('hostel').findOne({ name:hostel });
  // console.log(result);
  username=result.username;
  pwd=result.pwd;
  quantity[0]=result.bat;
  quantity[1]=result.lawn_tennis;
  quantity[2]=result.table_tennis;
  quantity[3]=result.biliyards;
  quantity[4]=result.carrom;
  quantity[5]=result.stump;
  quantity[6]=result.squash;
  quantity[7]=result.football;
  quantity[8]=result.basketball;
  quantity[9]=result.volleyball;
  for(var i=0;i<quantity.length;i++){
    if(quantity[i]=="00"){
      quantity[i]="Not Available";
    }
  }
  // console.log(quantity);
  return result;
}

// sending four digit otp to the registered email
async function sendotp() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.useremail, // generated ethereal user
        pass: process.env.password, // generated ethereal password
      },
    });
    OTP=Math.floor(1000 + Math.random()*9000);

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.useremail, // sender address
      to: outlook, // list of receivers
      subject: "OTP Authentication", // Subject line
      html:`Your OTP for verification is <span style="font-weight:bold;text-decoration:underline;color:royalblue;"> ${OTP}</span>. Use this OTP to validate your login.<div>  <br>  </div><div style="font-weight:bold">This is system generated mail. Please don't reply to this mail.</div><br><br><div>Regards</div><div style="font-weight:bold">Team SecurityHelp</div>`, // plain text body
    });
    // console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }
  function currentdatetime(){
    var currentdate = new Date(); 
    var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + "." 
    return datetime;
  }
  const updateQuantity= async(hostel,equip,param,id)=>{
    const res=await mongoose.model('hostel').findOne({name:hostel});
    // console.log(equip);
    if(equip=="lawn tennis"){
    // console.log(res.lawn_tennis);
    var q = res.lawn_tennis;
    if(param=="add"){
      var s=parseInt(q, 10)+1;
      
    mongoose.model('hostel').updateOne({name:hostel},{lawn_tennis:s},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
    if(q!="0"){
    var d=parseInt(q, 10)-1;
    mongoose.model('hostel').updateOne({name:hostel},{lawn_tennis:d},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
    }
    else{
     
       deleteitemfromlist(id);
       alert("Item is currently not available.")
    }
  }
  }
  else if(equip=="bat"){
    console.log(res.bat);
    var q = res.bat;
    if(param=="add"){
      var s=parseInt(q, 10)+1;
      
    mongoose.model('hostel').updateOne({name:hostel},{bat:s},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
    if(q!="0"){var d=parseInt(q, 10)-1;
    mongoose.model('hostel').updateOne({name:hostel},{bat:d},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
     deleteitemfromlist(id);
     alert("Item is currently not available.")
  }
}}
else if(equip=="table tennis"){
    console.log(res.table_tennis);
    var q = res.table_tennis;
    if(param=="add"){
      var s=parseInt(q, 10)+1;
    mongoose.model('hostel').updateOne({name:hostel},{table_tennis:s},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
    if(q!="0"){var d=parseInt(q, 10)-1;
    mongoose.model('hostel').updateOne({name:hostel},{table_tennis:d},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
     deleteitemfromlist(id);
     alert("Item is currently not available.")
  }
  }}
  else if(equip=="biliyards"){
    console.log(res.biliyards);
    var q = res.biliyards;
    if(param=="add"){
      var s=parseInt(q, 10)+1;
    mongoose.model('hostel').updateOne({name:hostel},{biliyards:s},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
    if(q!="0"){var d=parseInt(q, 10)-1;
    mongoose.model('hostel').updateOne({name:hostel},{biliyards:d},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
     deleteitemfromlist(id);
     alert("Item is currently not available.")
  }
  }}
  else if(equip=="carrom"){
    console.log(res.carrom);
    var q = res.carrom;
    if(param=="add"){
      var s=parseInt(q, 10)+1;
    mongoose.model('hostel').updateOne({name:hostel},{carrom:s},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
    if(q!="0"){var d=parseInt(q, 10)-1;
    mongoose.model('hostel').updateOne({name:hostel},{carrom:d},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
     deleteitemfromlist(id);
     alert("Item is currently not available.")
  }
  }}
  else if(equip=="stump"){
    console.log(res.stump);
    var q = res.stump;
    if(param=="add"){
      var s=parseInt(q, 10)+1;
    mongoose.model('hostel').updateOne({name:hostel},{stump:s},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
    if(q!="0"){var d=parseInt(q, 10)-1;
    mongoose.model('hostel').updateOne({name:hostel},{stump:d},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
     deleteitemfromlist(id);
     alert("Item is currently not available.")
  }
  }}
  else if(equip=="squash"){
    console.log(res.squash);
    var q = res.squash;
    if(param=="add"){
      var s=parseInt(q, 10)+1;
    mongoose.model('hostel').updateOne({name:hostel},{squash:s},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
    if(q!="0"){var d=parseInt(q, 10)-1;
    mongoose.model('hostel').updateOne({name:hostel},{squash:d},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
     deleteitemfromlist(id);
     alert("Item is currently not available.")
  }
  }}
  else if(equip=="football"){
    console.log(res.football);
    var q = res.football;
    if(param=="add"){
      var s=parseInt(q, 10)+1;
    mongoose.model('hostel').updateOne({name:hostel},{football:s},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
    if(q!="0"){var d=parseInt(q, 10)-1;
    mongoose.model('hostel').updateOne({name:hostel},{football:d},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
     deleteitemfromlist(id);
     alert("Item is currently not available.")
  }
  }}
  else if(equip=="basketball"){
    console.log(res.basketball);
    var q = res.basketball;
    if(param=="add"){
      var s=parseInt(q, 10)+1;
    mongoose.model('hostel').updateOne({name:hostel},{basketball:s},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
    if(q!="0"){var d=parseInt(q, 10)-1;
    mongoose.model('hostel').updateOne({name:hostel},{basketball:d},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
     deleteitemfromlist(id);
     alert("Item is currently not available.")
  }
  }}
  else if(equip=="volleyball"){
    console.log(res.volleyball);
    var q = res.volleyball;
    if(param=="add"){
      var s=parseInt(q, 10)+1;
    mongoose.model('hostel').updateOne({name:hostel},{volleyball:s},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
    if(q!="0"){var d=parseInt(q, 10)-1;
    mongoose.model('hostel').updateOne({name:hostel},{volleyball:d},function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Success");
      }
    });
  }
  else{
     deleteitemfromlist(id);
     alert("Item is currently not available.")
  }
  }
  }}



app.listen(PORT,function(){
  console.log("server is running on port:"+ PORT);
})