function start(myID, username){

    function toServer(postkey, data, callback){   
        var xmlhttp = new XMLHttpRequest();       
        xmlhttp.open("POST", "http://104.236.30.108:8000/"+postkey, true);
        var toSend = {"id":myID, "username": username, "data":data};
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.onreadystatechange = function() {//Call a function when the state changes.
            if(xmlhttp.readyState == 4 && xmlhttp.status == 200 && callback) {
                callback(xmlhttp.responseText);
            }
        }
        xmlhttp.send(JSON.stringify(toSend));
    }
    // At this point, both ID and username are available, 
    // and a request function created to authenticate to the server.
    toServer("hello");
    renderPopup(username);
    

    

    // chrome.tabs.query({}, function(tabs) {
    //     for (var i=0; i<tabs.length; i++) {
    //         chrome.tabs.sendMessage(tabs[i].id, "some message");
    //     }
    // });

    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    
    //     for (var i=0; i<tabs.length; i++) {
    //         // chrome.tabs.sendMessage(tabs[i].id, "some message");

    //         chrome.tabs.sendMessage(tabs[i].id, {greeting: "hello"}, function(response) {
    //             console.log(response.farewell);
    //         });
    //     }
    // });


    // getID(function(myID){
    //     console.log("in getID() with an ID available:", myID);

    // });

    

}




function renderPopup(uname){
    var usernamewrapper = document.getElementById("usernameWrapper");
    usernamewrapper.innerHTML = "";
    usernamewrapper.style = "display:none";
    var welcome = document.createElement("h3");
    welcome.innerHTML = "Hello, " + uname + "!";
    document.body.appendChild(welcome);
}



// from here: http://stackoverflow.com/a/105074
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}


function checkForValue(value, callback){
    chrome.storage.local.get(value, function (items){
        if(items[value] == null){ 
            callback(false);
        }else if(items[value]){ 
            callback(items[value]);
        }
    }); 
}

function unameAvailable(uname, callback){   
    var xmlhttp = new XMLHttpRequest();       
    xmlhttp.open("POST", "http://104.236.30.108:8000/unameRequest", true);
    var toSend = {"unameRequested":uname};
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.onreadystatechange = function() {//Call a function when the state changes.
        if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if(xmlhttp.responseText === "available"){
                callback(true);
            }else if(xmlhttp.responseText === "unavailable"){
                callback(false);
            }
        }
    }
    xmlhttp.send(JSON.stringify(toSend));
}

function saveUnameInBrowser(uname){
    chrome.storage.local.set({'username': uname});
}

function userNameUnavailable(uname){
    document.getElementById("uname_taken_notification").innerHTML = "The username <b>" + uname + "</b> is unavailable. Please try another one.";
}

function letSelectUsername(myID){
    console.log("in letSelectUsername");
    var usernamewrapper = document.getElementById("usernameWrapper");
    usernamewrapper.style = "display:block";
    document.getElementById("usernameSubmit").addEventListener('click', function(){
        var nameChosen = document.getElementById("usernameText").value;
        unameAvailable(nameChosen, function(available){
            if(available){
                console.log("username available for", myID);
                saveUnameInBrowser(nameChosen);
                start(myID, nameChosen);
            }else if (!available){
                console.log("username NOT available for", myID);
                userNameUnavailable(nameChosen);
            }
        });
    })
}

// previously getID()
function init(){
    checkForValue('uniqueKey', function(ID){
        var myID;
        if(!ID){
            myID = guid();
            chrome.storage.local.set({'uniqueKey': myID});
        }else{
            myID = ID;
        }

        checkForValue('username', function(uname){
            if(!uname){
                letSelectUsername(myID);
            }else if(uname){
                username = uname;
                start(myID, uname);
            }
        });


    });
}

window.addEventListener("load", init);