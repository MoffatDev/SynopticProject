let noticesPage = 0
//------------------------------HTML Document edit functions------------------------------
function toggleSigninLoginForm(){
  var signupForm = document.getElementById("signupForm");
  var loginForm = document.getElementById("loginForm");
  if(signupForm.style.display === "block"){
    signupForm.style.display = "none";
    loginForm.style.display = "block";
  }else{
    signupForm.style.display = "block";
    loginForm.style.display = "none";
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

//------------------------------Server dependent functions------------------------------
function nextPageNotices(){
  noticesPage += 1
  pullNotices();
}
function lastPageNotices(){
  noticesPage -= 1;
  pullNotices();
}

function pullNotices(){
  //Disable previous button if there aren't any previous
  if(noticesPage-1 > 0){
    document.getElementById("lastPageButton").disabled = false;
  }else{
    document.getElementById("lastPageButton").disabled = true;
  }
  sendPost("getNotices", {alreadyPulled: (noticesPage-1)*10});
}

function addNotice(){
  let form = {};
  form.title = document.getElementById("noticeTitle").value;
  form.notice = document.getElementById("noticeDetails").value;
  form.town = document.getElementById("noticeTownSelection").value;
  form.token = "";
  if(!document.getElementById("postAnon").checked){
    form.token = document.cookie;
  }
  sendPost("postNotice", form);
}

//Function to clear old cookies
function clearCookies(){
  let cookies = document.cookie.split("; ");
  for(let i = 0; i < cookies.length; i++){
    let cookie = cookies[i];
    document.cookie = cookie + "; expires=expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  }
}

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

function checkToken(){
  let form = {};
  form.token = document.cookie;
  sendPost("checkToken", form);
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
        clearCookies();
        document.cookie = returned.token;
        alert("Signup Success: Please rememember your username & password");
      }else{
        alert("Signup Failed: " + returned.reason);
      }
      break;
    case "login":
      if(returned.success){
        clearCookies();
        document.cookie = returned.token;
        alert("Login Success");
      }else{
        alert("Login Failed: " + returned.reason);
      }
      break;
    case "notices":
      let section = document.getElementById("regularNotices");
      let notices = section.getElementsByClassName("notice");
      if(returned.data.length < 10){
        document.getElementById("nextPageButton").disabled = true;
      }else{
        document.getElementById("nextPageButton").disabled = false;
      }
      for(let i = 0; i < 10; i++){
        if(i < returned.data.length){
          notices[i].style.display = "block"
          let headers = notices[i].getElementsByClassName("noticeHeader");
          headers[0].innerText = returned.data[i].username;
          if(returned.data[i].title == ""){
            headers[1].style.display = "none";
          }else{
            headers[1].style.display = "inline-block";
            headers[1].innerText = returned.data[i].title;
          }
          if(returned.data[i].town == ""){
            headers[2].style.display = "none";
          }else{
            headers[2].style.display = "inline-block";
            headers[2].innerText = returned.data[i].town;
          }
          notices[i].getElementsByClassName("noticeDetails")[0].innerText = returned.data[i].notice;
        }else{
          notices[i].style.display = "none";
        }
      }
      break;
    case "postNotice":
      if(returned.success){
        alert("Notice posted!");
        toggleNoticeForm();
        pullNotices();
      }else{
        alert("Couldn't post: " + returned.reason);
      }
      break;
    case "checkLogin":
      if(returned.success){
        alert("You're already logged in, signing up or logging into a different account will log you out")
      }
      break;
    default:
      console.err("Invalid response");
      break;
  }
}
