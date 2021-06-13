


//------------------------------Signup function------------------------------
function signup(){
  //Obtain signup data
  let form = {};
  form.username = document.getElementById('username').value;
  form.password = document.getElementById('password').value;
  form.name = document.getElementById('name').value;
  form.over13 = document.getElementById('over13').checked;
  //Submit data to server
  console.log('Signup: ', form);
  sendPost('signup', form)
}

function addCookie(cookie){
  console.log(cookie.label, cookie.data, cookie.expires);
}

//------------------------------Communication functions------------------------------
function sendPost(path, data) {
	fetch(path, {
		method: 'POST',
		body: JSON.stringify(data),
		headers:{
			'Content-Type': 'application/json'
		}
	})
  .then(handleRes);
};

//Response handler
async function handleRes(res){
  //Await promise to fufill
  let returned = await res.json();
  console.log("Server JSON response: ", returned);
  alert("Server JSON response: " + JSON.stringify(returned));

  //Determine what response it is dealing with
  switch(true){
    //Signup
    case returned.hasOwnProperty('signup'):

      break;
    //Signin
    case returned.hasOwnProperty('signin'):

      break;
    //Any other
    default:
      console.err('Invalid response');

  }
}
