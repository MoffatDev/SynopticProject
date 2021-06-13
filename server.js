//------------------------------Setting up enviroment------------------------------
const express = require('express');
const app = express();
const jsonParser = require('body-parser').json(); //Setting up JsonParser
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
  users: [],
  notices: [],
  mapPoints: []
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
    fs.writeFileSync(path, JSON.stringify(db[element]), 'utf8');
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
  console.log('Serving website on http://localhost:3000');
});


//------------------------------Client/Server communication------------------------------
app.post('/signup', jsonParser, function (req, res) {
  console.log("Signup recieved: ", req.body);
  let response = signup(req.body);
  console.log('Response: ', response);
  res.json(response);
});



//------------------------------Signup stuff------------------------------
function signup(data){
  //signup using username + hashed password + salt + name

  //Check if username already in database
  //If so reject
  //Else save to database and return access cookie
  return {signup : false, dataRecieved: data}
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

function login(){
  //Get username + hashedpassword
  //If username in database
    //If hashedpassword correct
      //return access cookie
    //else
      //return bad password
  //Else
    //return bad username
}

function requestSalt(){
  //if username in database
    //return associated salt
  //else
    //return null
}

function requestNewSalt(){
  //generate new salt and return
}
