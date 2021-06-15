//------------------------------HTML Document edit functions------------------------------
function toggleSigninLoginForm(){
  var signupForm = document.getElementById("signupForm");
  var loginForm = document.getElementById("loginForm");
  if(loginForm.style.display === "block"){
    loginForm.style.display = "none";
    signupForm.style.display = "block";
  }else{
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  }
}

function toggleNoticeForm(){
  var noticeForm = document.getElementById("noticeForm");
  var button = document.getElementById("toggleNoticeForm");
  if(noticeForm.style.display === "block"){
    noticeForm.style.display = "none";
    button.innerText = "Add Notice";
  }else{
    noticeForm.style.display = "block"
    button.innerText = "Hide Form";
  }
}

//------------------------------Signup function------------------------------
function signup(){
  //Obtain signup data
  let form = {};
  form.username = document.getElementById("signupUsername").value;
  form.password = document.getElementById("signupPassword").value;
  form.name = document.getElementById("signupName").value;
  form.over13 = document.getElementById("signupOver13").checked;
  form.townSelection = document.getElementById("signupTownSelection").value;
  //Submit data to server
  sendPost("signup", form);
}

function login(){
  //Obtain login info
  let form = {};
  form.username = document.getElementById("loginUsername").value;
  form.password = document.getElementById("loginPassword").value;
  //Submit data to server
  sendPost("login", form);
}


function addCookie(cookie){
  console.log(cookie.label, cookie.data, cookie.expires);
}

//------------------------------Communication functions------------------------------
function sendPost(path, data) {
  console.log("Posting following to " + path, data)
	fetch(path, {
		method: "POST",
		body: JSON.stringify(data),
		headers:{
			"Content-Type": "application/json"
		}
	})
  .then(handleRes);
};

//Response handler
async function handleRes(res){
  //Await promise to fufill
  let returned = await res.json();
  console.log("Server JSON response: ", returned);

  switch(returned.type){
    case "signup":
      if(returned.success){
        document.cookie = returned.token;
        alert("Signup Success: Please rememember your username & password");
      }else{
        alert("Signup Failed: " + returned.reason);
      }
      break;
    case "login":
      if(returned.success){
        document.cookie = returned.token;
        alert("Login Success");
      }else{
        alert("Login Failed: " + returned.reason);
      }
      break;
    default:
      console.err("Invalid response");
      break;
  }
}
