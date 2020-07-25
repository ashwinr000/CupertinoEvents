$( document ).ready(function() {
    var firebaseConfig = {
        apiKey: "AIzaSyDEaV7YhmgWMbWoW1G2JQpbqr-fO8380og",
        authDomain: "hackcupertinodb.firebaseapp.com",
        databaseURL: "https://hackcupertinodb.firebaseio.com",
        projectId: "hackcupertinodb",
        storageBucket: "hackcupertinodb.appspot.com",
        messagingSenderId: "175467986461",
        appId: "1:175467986461:web:559c1cb3998ac5b06b10f4"
    };
    firebase.initializeApp(firebaseConfig);

    const dbRefObject = firebase.database().ref().child("events");
    dbRefObject.on("child_added", snap => {console.log("Added!"); addEventElement(snap); console.log(snap.val())});
    dbRefObject.on("child_removed", snap => {console.log("Removed!"); console.log(snap.val())});
    dbRefObject.on("child_changed", snap => {console.log("Changed!"); console.log(snap.val())});

    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            console.log("Logged in!");
            console.log(firebaseUser.displayName);
            //$("#logoutButton").show();
        }else{
            console.log("Logged out!");
            //$("#logoutButton").hide();
        }
    });


    //Login
    $("#login_button").on("click", function() {
        loginWithEmail($("#login_email").val(), $("#login_email").val());
    });
    $("#signup_button").on("click", function() {
        console.log()
        signupWithEmail($("#signup_username").val(),$("#signup_email").val(), $("#signup_pwd").val());
    });
});

function loginWithEmail(email, passowrd){
    //generateAlert("#login_alerts", "success", "bruhh");
    const auth = firebase.auth();
    const promise = auth.signInWithEmailAndPassword(email, passowrd);
    promise.catch(e => console.log(e.message));
}

function signupWithEmail(username, email, password){
    console.log(username);
    const auth = firebase.auth();
    const promise = auth.createUserWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e.message)).then(() => {
        var user = firebase.auth().currentUser;
        user.updateProfile({
            displayName: username,
        });

        firebase.database().ref("users/" + user.uid).set({
            name: username,
            uid: user.uid,
            points: 0,
            user_events: {placeholder: 0}
        }, function(error) {
            if (error) {
                console.log(error.message);
            } else {
                console.log("Data saved successfully!");
            }
        });
    });
}

function logOut(){
    firebase.auth().signOut();
}

function addEvent(name, start, end, lat, lon, value, notes){
    var newPostKey = firebase.database().ref().child('posts').push().key;

    firebase.database().ref("events/" + newPostKey).set({
        key: newPostKey,
        name: name,
        start_time: start,
        end_time: end,
        latitude: lat,
        longitude: lon,
        point_value: value,
        notes: notes,
    }, function(error) {
        if (error) {
            console.log(error.message);
        } else {
            console.log("Data saved successfully!");
        }
    });
}

function checkInToEvent(eventKey){
    var user = firebase.auth().currentUser;
    return firebase.database().ref('/').once('value').then(function (snapshot) {
        var users = snapshot.val().users;
        var user_points = users[user.uid].points;
        var pointValue = snapshot.val().events[eventKey].point_value;
        console.log(users[user.uid]);
        if(eventKey in users[user.uid].user_events){
            console.log("Already checked in to this event");
            generateAlert("#map_alerts", "danger", "You have already checked in to this event!");
            return false;
        }else{
            obj = users[user.uid].user_events;
            obj[eventKey] = 0;
            firebase.database().ref("users/" + user.uid + "/user_events").set(obj, function(error) {
                if (error) {
                    console.log(error.message);
                } else {
                    console.log("Data saved successfully!");
                }
            });
            firebase.database().ref("users/" + user.uid).update({points: user_points + pointValue}, function(error) {
                if (error) {
                    console.log(error.message);
                } else {
                    console.log("Data saved successfully!");
                }
            });
            generateAlert("#map_alerts", "success", "Success!\nYou gained " + points + "points!");
        }
    });
}

function generateAlert(id, color, message){
    $(id).prepend("<div class=\"alert alert-" + color + " alert-dismissible fade show\" role=\"alert\">\n" +
        message + "\n" +
        "  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n" +
        "    <span aria-hidden=\"true\">&times;</span>\n" +
        "  </button>\n" +
        "</div>"
    )
}

function addEventElement(snap){
    obj = snap.val();
    console.log(obj);
    $("#eventList").append("<li class=\"list-group-item\">\n" +
        "            <h1>" + obj.name + " (" + obj.point_value + "pts)</h1>\n" +
        "            <h6>" + obj.start_time + " to " + obj.end_time+ "</h6>\n" +
        "            <h5>" + obj.notes + "</h5>\n" +
        "            <button id=\"" + obj.key + "_button\">Check In</button>" +
        "          </li>");

    var key = obj.key;
    var points = obj.point_value;
    $("#" + key + "_button").on("click", function() {
        checkInToEvent(key);
    });
}

function buttonClick(){
    //console.log(getEventPointValue("-MD19BNlF5FpA-LO10pH"));
    checkInToEvent("-MD1fIe2sRSNZRA_XX4o");
    //logOut();
    //signupWithEmail("joe", "joe9@gmail.com", "bruhaps123");
    //addEvent("meetup at jopes", 1595483789, 1595570225, 37.319309, -122.029259, 100, "IDEKsdfBRO");
}