'use strict';

var express = require('express'),
    realm = require("realm"), bodyParser = require('body-parser');


var path = require('path');
var firebase = require("firebase");

var cookieParser = require('cookie-parser');
var logger = require('morgan');
var config = {
    apiKey: "AIzaSyBdnvuJ50qQyFTFUiElSnbK-2LG3SRs4po",
    authDomain: "driveraid-37226.firebaseapp.com",
    databaseURL: "https://driveraid-37226.firebaseio.com",
    projectId: "driveraid-37226",
    storageBucket: "driveraid-37226.appspot.com",
    messagingSenderId: "913034035409"
};


const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    "913034035409-8mcefuefimdn0omfd4r4ck2a4h4s7o47.apps.googleusercontent.com", // ClientID
    "GthAyKrzHTCaYdEo8CC4uvUI", // Client Secret
    "https://developers.google.com/oauthplayground" // Redirect URL
);

firebase.initializeApp(config);
var app = express();

app.use(express.static(__dirname));

// var router = express.Router();
// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
//
// });
//

let Content = {
    name: 'Content',
    primaryKey: 'id',
    properties: {
        id: 'string',
        imageUrl: 'string',
        description: 'string',
        type: 'string',
        title: 'string?'
    }
};

let Driver = {
    name: 'Driver',
    primaryKey: 'userId',
    properties: {
        userId: 'string',
        FullName: 'string',
        UserName: 'string',
        Phone: 'string',
        Email: 'string',
        PlateNumber: 'string',
        CarType: 'string',
        NationalID: 'string'
    }
};

exports.DriverLegacy = {
    name: 'DriverLegacy',
    properties: {
        dUsername: 'string?',
        dFullName: 'string?',
        dPassword: 'string?',
        dNationalID: 'string?',
        dEmail: 'string?',
        dPhone: 'string?',
        dCarType: 'string?',
        dPlateNumber: 'string?'
    }
};

let Employee = {
    name: 'Employee',
    properties: {
        empUsername: 'string?',
        empFullName: 'string?',
        empEmail: 'string?',
        empPhone: 'string?',
        empSkills: 'string?',
        empDegree: 'string?',
        empExp: 'string?',
        empPassword: 'string?',
        userId: 'string',
        status: 'string?',
        isAdmin: 'bool?',

    }
};

let Feedback = {
    name: 'Feedback',
    properties: {
        id: 'string',
        userId: 'string?',
        userFullName: 'string?',
        workshopId: 'string?',
        workShopName: 'string?',
        technicianName: 'string?',
        feedbackContent: 'string?',
        time: 'string?',
        orderId: 'string?'
    }
};

let Hint = {
    name: 'Hint',
    primaryKey: 'uuid',
    properties: {
        uuid: 'int',
        Imagediscription: 'string',
        ImageURL: 'string'
    }
};

let Order = {
    name: 'Order',
    primaryKey: 'orderId',
    properties: {
        orderId: 'string',
        driverName: 'string',
        driverID: 'string',
        workshopId: 'string?',
        workshopName: 'string?',
        carType: 'string',
        serviceType: 'string',
        Issue: 'string',
        driverPhone: 'string',
        date: 'string?',
        lat: 'double?',
        lan: 'double?',
        status: 'string?',
        price: 'string?',
        technicianName: 'string?',
        technicianNumber: 'string?'
    }
};

let RepairShop = {
    name: 'RepairShop',
    properties: {
        rsUsername: 'string?',
        rsName: 'string?',
        rsPassword: 'string?',
        rsPhone: 'string?',
        rsBranch: 'string?',
        rsEmail: 'string?'
    }
};

let Shop = {
    name: 'Shop',
    primaryKey: 'userId',
    properties: {
        userId: 'string',
        name: 'string',
        branch: 'string',
        email: 'string',
        phone: 'string',
        userName: 'string'
    }
};

let UserProperties = {
    name: 'UserProperties',
    primaryKey: 'UserId',
    properties: {
        UserId: 'string',
        FullName: 'string?',
        PhoneNumber: 'string?',
        Phone: 'string?',
        Email: 'string',
        PlateNumber: 'string?',
        CarType: 'string?',
        NationalID: 'string'
    }
};

exports.__Class = {
    name: '__Class',
    primaryKey: 'name',
    properties: {
        name: 'string',
        permissions: '__Permission[]'
    }
};

exports.__DefaultRealmVersion = {
    name: '__DefaultRealmVersion',
    primaryKey: 'id',
    properties: {
        id: 'int',
        version: 'int'
    }
};

exports.__Permission = {
    name: '__Permission',
    properties: {
        role: '__Role',
        canRead: 'bool',
        canUpdate: 'bool',
        canDelete: 'bool',
        canSetPermissions: 'bool',
        canQuery: 'bool',
        canCreate: 'bool',
        canModifySchema: 'bool'
    }
};

exports.__Realm = {
    name: '__Realm',
    primaryKey: 'id',
    properties: {
        id: 'int',
        permissions: '__Permission[]'
    }
};

exports.__Role = {
    name: '__Role',
    primaryKey: 'name',
    properties: {
        name: 'string',
        members: '__User[]'
    }
};

exports.__User = {
    name: '__User',
    primaryKey: 'id',
    properties: {
        id: 'string',
        role: '__Role'
    }
};


app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

var resources;

app.get('/', function (req, res) {
    // resources = res;
    if (global.currentSyncUser == null) {
        res.sendFile(__dirname + "/login.html");
    } else {
        loadUsers(res);
    }


});

app.get('/login', function (req, res) {
    res.sendFile(__dirname + "/login.html");

});
app.get('/signup', function (req, res) {
    res.sendFile(__dirname + "/signup.html");
})

function loginWithUsernameAndPassword(email, passWord, res) {
// firebase.auth().signInWithEmailAndPassword("mohamed+driver@gmail.com", "aaaaaaaa").then(function (credentials) {
    firebase.auth().signInWithEmailAndPassword(email, passWord).then(function (credentials) {
        console.log('success! welcome ' + credentials.user.displayName);
        var authFucntion = firebase.functions().httpsCallable('myAuthFunction');
        authFucntion().then(function (result) {
            console.log("token result is " + result.data["token"]);
            const token = result.data["token"];


            const credentials = realm.Sync.Credentials.jwt(token);

            realm.Sync.User.login("https://driveraid.us1a.cloud.realm.io/", credentials).then(function (user) {
                console.log("Login successful!" + user)
                global.currentSyncUser = user;
                loadUsers(res)
            })


        }).catch(function (error) {
            // Getting the Error details.
            var code = error.code;
            var message = error.message;
            var details = error.details;
            console.log("error ! " + message)
            // ...
        });
    }).catch(function (error) {
        console.log("fail" + error.message)

    });
}

app.post('/login', function (req, res) {

    let email = req.body['email'],
        passWord = req.body['pass'];

    loginWithUsernameAndPassword(email, passWord, res);

    // blogRealm.write(() => {
    //     blogRealm.create('Post', {userName: userName, email: email, passWord: passWord});
    // });

})

async function sendEmail(newState, empEmail) {
    oauth2Client.setCredentials({
        refresh_token: "1/Pfn60bGok6kptrHsUqPbYO7MI4n_PQ-OapX2-i23MnI"
    });
    const tokens = await oauth2Client.refreshAccessToken()
    const accessToken = tokens.credentials.access_token
    const smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: "applicationaide@gmail.com",
            clientId: "913034035409-8mcefuefimdn0omfd4r4ck2a4h4s7o47.apps.googleusercontent.com",
            clientSecret: "GthAyKrzHTCaYdEo8CC4uvUI",
            refreshToken: "1/Pfn60bGok6kptrHsUqPbYO7MI4n_PQ-OapX2-i23MnI",
            accessToken: accessToken
        }
    });

    const mailOptions = {
        from: global.currentSyncUser,
        to: empEmail,
        subject: "Aid Admin",
        generateTextFromHTML: true,
        html: "<b>your new employment status is </b>" + "<b>"+newState+"</b>"
    };

    smtpTransport.sendMail(mailOptions, (error, response) => {
        error ? console.log(error) : console.log(response);
        smtpTransport.close();
    }).then(()=>{
        console.log("email sent")
    }).catch((reason => {
        console.log("reason"+reason)
    }));
}

app.get('/toggleAdmin/:userId',function (req, res) {
    Realm.open(global.currentSyncUser.createConfiguration({schema: [Driver, Content, Employee, Order, Shop, Feedback]}))
        .then((remoteRealm) => {

            remoteRealm.write(() => {
            let targetEmpList=remoteRealm.objects("Employee").filtered('userId = "'+req.params.userId+'"');
            let targetEmp=targetEmpList[0]

                let newState=targetEmp.status==="confirmed"?"unconfirmed":"confirmed";
                targetEmp.status=newState
                sendEmail(newState,targetEmp.empEmail).catch(reason => {
                    console.log(reason)
                }).then(()=>{
                    console.log("email sent")
                });
                loadUsers(res)
                res.redirect("/")
            });
        })
});


app.get('/logout', function (req, res) {
    console.log("logout clicked");
    global.currentSyncUser = null
    firebase.auth().signOut();
    res.sendFile(__dirname + "/login.html");

});

function generateAdmin(user, fullName, phone) {
    Realm.open(user.createConfiguration({schema: [Driver, Content, Employee, Order, Shop, Feedback]}))
        .then((remoteRealm) => {
            remoteRealm.write(() => {
                remoteRealm.create('Employee', {
                    empFullName: fullName,
                    empEmail: user.email,
                    empPhone: phone,
                    userId: user.identity,
                    isAdmin: true,

                });
            });
        })
}

function loadUsers(res) {
    Realm.open(global.currentSyncUser.createConfiguration({schema: [Driver, Content, Employee, Order, Shop, Feedback]}))
        .then((remoteRealm) => {

            let itemResults = remoteRealm.objects('Employee');
            itemResults.subscribe().addListener((sub, state) => {

            })
            // console.log("result is =>"+itemResults.length)
            for (let i = 0; i < itemResults.length; i++) {
                // console.log("item =>"+i+" "+itemResults[i].empFullName)
            }
            res.render('employeeAdmin.ejs', {empList: itemResults});
        })
}

app.post('/signup', function (req, res) {

    let name = req.body['name'],
        email = req.body['email'],
        phone = req.body['phone'],
        passWord = req.body['pass'],
        repeatedPass = req.body['repeat-pass'];

    if (passWord !== repeatedPass) {
        return;
    }
    // firebase.auth().signInWithEmailAndPassword("mohamed+driver@gmail.com", "aaaaaaaa").then(function (credentials) {

    firebase.auth().createUserWithEmailAndPassword(email, passWord).then(function (credentials) {
        console.log('success! welcome ' + credentials.user.displayName);
        var authFucntion = firebase.functions().httpsCallable('myAuthFunction');
        authFucntion().then(function (result) {
            console.log("token result is " + result.data["token"]);
            const token = result.data["token"];


            const credentials = realm.Sync.Credentials.jwt(token);

            realm.Sync.User.login("https://driveraid.us1a.cloud.realm.io/", credentials).then(function (user) {
                console.log("Login successful!" + user)
                global.currentSyncUser = user;
                generateAdmin(user, name, phone);
                // var realmRemote=require("./RealmRemoteManager");
                // loadUsers(res)
                res.sendFile(__dirname + "/login.html");

                // res.get(__dirname + "/")
            })


        }).catch(function (error) {
            // Getting the Error details.
            var code = error.code;
            var message = error.message;
            var details = error.details;
            console.log("error ! " + message)
            // ...
        });
    }).catch(function (error) {
        console.log("fail" + error.message)

    });

    // blogRealm.write(() => {
    //     blogRealm.create('Post', {userName: userName, email: email, passWord: passWord});
    // });

});

// Realm.open(user.createConfiguration({schema:[Driver,Content,Employee,Order,Shop,Feedback]}))
//     .then((r)=>{
//
//         let itemResults = r.objects('Driver');
//         itemResults.subscribe().addListener((sub,state)=>{
//
//         })
//         for (i = 0; i < itemResults.length; i++) {
//             console.log(`driver=> :${itemResults[i].FullName} with carType ${itemResults[i].CarType} phone number:${itemResults[i].Phone}`)
//         }
//
//     })
var port = 8000; // you can use any port
app.listen(port);
console.log('server is running on ' + port);
//
// module.exports = router;
