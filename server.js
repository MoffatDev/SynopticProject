//------------------------------Setting up enviroment------------------------------
const express = require('express');
const app = express();
//Used to handle client/server communication
const jsonParser = require('body-parser').json();
//Used for cryptographic generation
const crypto = require('crypto');
//Extended unicode regex support, used to verify user input
const XRegExp = require('xregexp');
const usernameRegex = XRegExp("^[\\pL|\\pN|_]*$");
const nameRegex = XRegExp("^[\\pL|-]*$");
//------------------------------IO Setup------------------------------
const fs = require('fs');
const dbPaths = {
  users:      './data/users.json',
  notices:    './data/notices.json',
  mapPoints:  './data/mapPoints.json'
}

//------------------------------Server start------------------------------
//Loading up databases
let db = {
  users: {},
  notices: [],
  mapPoints: {}
};
//Loop through all db files
for (element in dbPaths){
  console.log("Loading in '" + element + "' database from: '" + dbPaths[element]);
  /*The follwing code snippit containing "fs.accessSync" uses from the nodejs
  api documenation, which is linked here: https://nodejs.org/api/fs.html*/

  //Checking if db file exists
  try {
    fs.accessSync(dbPaths[element], fs.constants.F_OK);
  //If it doesn't create it
  }catch (err) {
    console.error("WARN: File doesn't exist creating empty one");
    fs.writeFileSync(dbPaths[element], JSON.stringify(db[element]), 'utf8');
  }
  //Load in database file
  try{
    db[element] = JSON.parse(fs.readFileSync(dbPaths[element],'utf8'));
    //console.log("Data loaded: ", db[element]);
  //If can't load in display error and exit
  }catch(err){
    console.error("Failed to load in db exiting...");
    console.error(err);
    process.exit(1);
  }
  console.log();
}

//------------------------------Serving website------------------------------
app.use(express.static('public'));
app.listen(3000, function () {
  console.log('Serving website on localhost:3000');
});

//------------------------------Client/Server communication------------------------------
app.post('/signup', jsonParser, function (req, res) {
  console.log("Signup recieved: ", req.body);
  let response = signup(req.body);
  //console.log('Response: ', response);
  res.json(response);
});

app.post('/login', jsonParser, function (req, res) {
  console.log("Login recieved: ", req.body);
  let response = login(req.body);
  //console.log('Response: ', response);
  res.json(response);
});

app.post('/getNotices', jsonParser, function (req, res) {
  console.log("Get notice request recieved: ", req.body);
  let response = getNotices(req.body);
  //console.log('Response: ', response);
  res.json(response);
});

app.post('/postNotice', jsonParser, function (req, res) {
  console.log("Notice post request recieved: ", req.body);
  let response = postNotice(req.body);
  //console.log('Response: ', response);
  res.json(response);
});

//------------------------------Notice Handling------------------------------
function getNotices(data){
  let notices = [];
  let startPos = db.notices.length-1-data.alreadyPulled;
  for(let i = startPos; i > startPos-10; i--){
    if (i < 0){
      break;
    }else{
      notices.push(db.notices[i]);
    }
  }
  return {type: "notices", data: notices};
}

function postNotice(data){
  //Title, notice, town, and maybe token
  let response = {type: "postNotice", success: false, reason: "General Error, try again later"};
  let username = "anon user";
  //If logged in associate notice with user
  if(checkToken(data.token)){
    username = data.token.split("=")[0];
  }
  //Check Title is <= 32 chars
  if(data.title.length <= 32){
    if(data.notice.length <= 512 && data.notice.length > 0){
      let town = verifyTown(data.town) ? data.town : "";
      db.notices.push({username: username, title: data.title, notice: data.notice, town: town})
      saveToFile(dbPaths.notices, JSON.stringify(db.notices));
      response.success = true;
    }else{
      response.reason = "Notice must be more than 1 character and less than 512 characters";
    }
  }else{
    response.reason = "Title bust be less than 32 characters";
  }
  return response;
}


//------------------------------Signup Handling------------------------------
function signup(data){
  let response = {type: "signup", success: false, reason: "General Error, try again later", token: ""};
  if(data.name.length >0 && nameRegex.test(data.name)){
    if(data.username.length >= 5 && data.username.length <= 16 && usernameRegex.test(data.username)){
      //If over13
      if(data.over13){
        //If username not already in database
        if(!db.users.hasOwnProperty(data.username.toLowerCase())){
          //If password matches minimum requrements
          if(checkPassFormat(data.password)){
            //Generate salt and hash password
            let salt = generateSalt();
            let hashPass = hashPassword(data.password, salt).toString();
            let token = generateAccessToken(data.username.toLowerCase());
            if(data.townSelection != "Lobitos" && data.townSelection != "Piedritas"){
              data.townSelection = null;
            }
            //Save data
            db.users[data.username.toLowerCase()] = {hashPass: hashPass, salt: salt
              , name: data.name, over13: data.over13, townSelection: data.townSelection
              ,tokens: [token]};
            saveToFile(dbPaths.users, JSON.stringify(db.users));
            response.success = true;
            response.token = token;
          }else{
            response.reason = "Password doesn't meet minimum requirements, see below:"
            + "\n - At least 8 Characters Long"
            + "\n - Include at least one langauge character"
            + "\n - Include at least one 0-9 digit"
            + "\n - Include at least one symbol";
          }
        }else{
          response.reason = "Username already in use";
        }
      }else{
        response.reason = "You must be over 13 to use this service";
      }
    }else{
      response.reason = "Username must be between 5 & 16 characters long"
      +" and can only contain language characters, numbers and an underscore '_'";
    }
  }else{
    response.reason = "Name must be at least one character"
    +" and can only contain language characters and a hyphen '-'";
  }
  return response;
}

function checkPassFormat(password){
  //Password good length
  if(password.length >= 8){
    //Has language chars                       has digit
    return XRegExp("[\\pL]").test(password) && XRegExp("[0-9]").test(password)
            && XRegExp("[\\pS|\\pP]").test(password);
            //has special
  }else{
    return false;
  }
}



/*
The following functions "saveToFile" & "readFromFile" contain code from
the nodejs api documenation, which is linked below.
https://nodejs.org/api/fs.html

They have recieved minor modifications to be more generic for reuse
and to fit the requirements better.
*/
async function saveToFile(path, data){
  fs.writeFile(path, data, (err) => {
    if(err) throw err;
    console.log('Data saved to: ', path);
  });
}

async function readFromFile(path){
  fs.readFile(path, (err, data) =>{
    if(err) throw err;
    console.log('Data read from: ', path);
    return data;
  });
}

function login(data){
  let response = {type: "login", success: false,
  reason: "Please double check your username & password", token: ""};
  //Check if username exists
  if(db.users.hasOwnProperty(data.username.toLowerCase())){
    let user = db.users[data.username.toLowerCase()];
    //Calculate hashPass
    let hashPass = hashPassword(data.password, user.salt)
    if(user.hashPass == hashPass){
      response.success = true;
      //Generate token
      response.token = generateAccessToken(data.username.toLowerCase());
      //Save to database
      db.users[data.username.toLowerCase()].tokens.push(response.token);
      saveToFile(dbPaths.users, JSON.stringify(db.users));
    }
  }
  return response;
}

function checkToken(data){
  //Split token into useful components
  let givenData = data.split("=");
  //Search database for user
  if(db.users.hasOwnProperty(givenData[0])){
    let user = db.users[givenData[0]];
    //Loop through the user's tokens
    for(let i = 0; i < user.tokens.length; i++){
      let token = user.tokens[i];
      //If its expired delete the token & save
      let tokenExpirary = new Date(token.split(";")[1].substring(9));
      if(tokenExpirary < new Date(Date.now)){
        db.users[givenData[0]].tokens.splice(user.tokens.indexOf(token), 1);
        saveToFile(dbPaths.users, JSON.stringify(db.users));
      //Otherwise check if the token is valid
      }else if(givenData[1] === token.split("=")[1].substring(0, 127)){
        return true;
      }
    }
  }
  return false;
}

function verifyTown(town){
  if(town.toLowerCase() === "lobitos" || town.toLowerCase() === "piedritas"){
    return true;
  }
  return false;
}

  /*
  let accessToken = data.split("=");
  accessToken[1] = accessToken[1].substring(0,127)
  if(db.users.hasOwnProperty(accessToken[0].toLowerCase())){
    let user = db.users[accessToken[0].toLowerCase()];
    //Check tokens to match
    console.log("user", user);
    for(let i = 0; i < user.tokens.length; i++){
      let token = user.tokens[i];
      console.log("token: ", token);
      let validToken = token[1].split("=");
      let validToken = validToken.substring(0,127);
      console.log("valid token: ", token);
      console.log("valid token: ", accessToken[1]);
      if(new Date(token[].split(";")[1].substring(9)) < new Date(Date.now())){
        if(accessToken[1] === validToken){
          return true;
        }
      }
    }
  }*/

function generateAccessToken(username, sessionOnly){
  const length = 127;
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  //Timeout for 30 days in the future
  let timeout = new Date(Date.now() + 2592000*1000).toUTCString();
  let token = "";
  for(let i = 1; i <= length; i++){
    if(i%8 === 0){
      token = token + "-";
    }else{
      token = token + chars.charAt(crypto.randomInt(0, chars.length));
    }
  }
  return (username + "=" + token + "; expires=" + timeout + "; secure=true");
}

//Password handling functions
function generateSalt(){
  return crypto.randomBytes(256).toString();
}

function hashPassword(password, salt){
  return crypto.pbkdf2Sync(password, salt, 100000, 256, "sha512");
}
