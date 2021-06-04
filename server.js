//requirements
const express = require('express');
const app = express();
//modules

//------------------------------Serving website------------------------------
app.use(express.static('public'));
app.listen(3000, function () {
  console.log('Serving website @ localhost:3000');
});

//------------------------------Signup stuff------------------------------
