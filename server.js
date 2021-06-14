//------------------------------Setting up enviroment------------------------------
const express = require('express');
const app = express();
const jsonParser = require('body-parser').json(); //Setting up JsonParser
const crypto = require('crypto');
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
  notices: {},
  mapPoints: {}
};

console.log(generateAccessToken());

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
    console.log("Data loaded: ", db[element]);
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
  console.log('Response: ', response);
  res.json(response);
});

app.post('/login', jsonParser, function (req, res) {
  console.log("Login recieved: ", req.body);
  let response = login(req.body);
  console.log('Response: ', response);
  res.json(response);
});



//------------------------------Signup stuff------------------------------
function signup(data){
  let response = {type: "signup", success: false, reason: "", token: ""};
  if(data.name.length >0){
    if(data.username.length >= 5){
      //If over13
      if(data.over13){
        //If username not already in database
        if(!db.users.hasOwnProperty(data.username.toLowerCase())){
          //If password matches minimum requrements
          if(checkPassFormat(data.password)){
            //Generate salt and hash password
            let salt = generateSalt();
            let hashPass = hashPassword(data.password, salt).toString();
            let token = generateAccessToken(data.username);
            //Save data
            db.users[data.username.toLowerCase()] = {hashPass: hashPass, salt: salt
              , name: data.name, over13: data.over13, tokens: [token]};
            saveToFile(dbPaths.users, JSON.stringify(db.users));
            response.success = true;
            response.token = token;
          }else{
            response.reason = "Password doesn't meet minimum requirements, see below:"
            + "\n - At least 8 Characters Long"
            + "\n - Include at least one a-z character"
            + "\n - Include at least one 0-9 digit"
            + "\n - Include at least one other/special character";
          }
        }else{
          response.reason = "Username already in use";
        }
      }else{
        response.reason = "You must be over 13 to use this service";
      }
    }else{
      response.reason = "Username must be 5 characters or longer";
    }
  }else{
    response.reason = "Name must be 1 character or longer";
  }
  return response;
}

function checkPassFormat(password){
  let hasLetter = false;
  let hasDigit = false;
  let hasSpecial = false;
  //Password good length
  if(password.length >= 8){
    //Loop through each character
    for(let char of password){
      //Contains 1 latin character
      if(/[a-z]|[A-Z]/.test(char)){
        hasLetter = true;
      //Contains 1 arabic numeral
      }else if(/\d/.test(char)){
        hasDigit = true;
      //Contains 1 other character
      }else if(/\W/.test(char)){
        hasSpecial = true;
      }
    }
  }
  return hasLetter && hasDigit && hasSpecial;
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

function generateAccessToken(username, sessionOnly){
  const length = 128;
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  //Timeout for 30 days in the future
  let timeout = new Date(Date.now() + 2592000*1000).toUTCString();
  let token = "";
  for(let i = 1; i < length; i++){
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
