var express = require( 'express' );
var router = express.Router();
var nodeMailer = require( 'nodemailer' );
var pg = require( 'pg' );
var Chance = require( 'chance' );
var chance = new Chance();
var pool = require( '../modules/db' );

var transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gradcoaches@gmail.com',
        pass: '@chievempls'  // DO NOT HOST THIS INFO ON GITHUB!
    }
});

router.post('/', function(req, res, next) {
      var mailer = req.body;
      // console.log('log mailer ', mailer.email);
      var user = {
        code : chance.string({length : 10}),
        id : req.body.id,
        email : req.body.email
      };
      console.log('user: ', user);
      // generate a random string and store in database for user with e-mail & id
      pool.connect(function(errConnectingToDb, db, done) {
         if (errConnectingToDb) {
           console.log('Error Connecting: ', err);
           next(err);
         }
         db.query('UPDATE "users" SET "chance_token" = ($1) WHERE "id" = ($2) AND "email" = ($3);',
         [user.code, user.id, user.email],
         function(queryError, result) {
           done();
           if (queryError) {
             console.log('Error making query. : ', queryError);
             res.sendStatus(500);
           } else {
           }
         });
       });
       var mailOptions = {
          from: '"Achieve Mpls" gradcoaches@gmail.com',
          to: mailer.email,
          subject: 'TEST',
          text: mailer.fname + ' ' + mailer.lname + ' Custom message. Activate here ' +
          'http://localhost:5000/#/activation/' + user.code
      //     html: '<b>' + mailer.message + '</b>' // html body
      };
      transporter.sendMail(mailOptions, function(error, info){
          if (error) {
              return console.log(error);
          }
          console.log('Message sent: ', info.messageId, info.response);
      });
      res.send(200);
});

// router.put('/activate/:code', function(req, res) {
//   var code = req.params.code;
//   // req.body.password // <- user will be sending password & e-mail
//
// });

module.exports = router;
