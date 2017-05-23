/**
 * Auth Service Factory
 * @desc Manages all of the functions related to Authorization
 * @param $http, $location
 * @return the user is logged in
 */
myApp.factory('AuthService', ['$http', '$location', '$mdDialog', 'CoachService', '$filter',
  function($http, $location, $mdDialog, CoachService, $filter) {

    var auth = this;

    auth.getTickets = CoachService.getTickets;
    // var code = {}; // CC possibly passed to pass param to validate chance code
/**
 * sendActivation function
 * @desc Send email and activation code to coach,
 *       the code will be expired in 30 days
 * @param userObject from input fields in 'send activation' button adminUser.html
 * @return success response code
 */
    function sendActivation(userObject) {

      //set the expiration date for the chance
      var chance_expiration = new Date();
      console.log('exp', chance_expiration);
      chance_expiration.setDate(chance_expiration.getDate() + 30);
      userObject.chance_expiration = $filter('date')((chance_expiration), "yyyy-MM-dd");
      console.log('expiryDate is: ', userObject.chance_expiration);

      console.log('AuthService line 11', userObject);
      $http.post( '/mail' , userObject ).then(function(response){
      console.log( 'Email sent: ', response.data );
    });
    }
    /**
     * addUserPwd function
     * @desc add the user Pwd, if the chance expiration code is expired, notify the admin
     * if chance is valid, means the get function get the user record,
     * then, triggers post function and send the user object to register.js
     * @param user Object from input fields in submit button createPassword.html
     * @return success redirect to coach page
     */
    function addUserPwd(user) {
      console.log('add pwd user', user);
      $http({
        method: 'GET',
        url: '/register',
        params: user
      })
      .then(function(response) {
        if(response.data.length !== 0) {
          user.userId = response.data[0].id;
          $http.post('/register/addPwd', user).then(function(response) {
             $location.path('/coach');
          });
        }
        else {
          $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('The active code is expired!')
            .textContent('Please contact the AchieveMpls Admin.')
            .ariaLabel('Alert Dialog')
            .ok('OK!')
          );
        }

      });

    }
/**
 * validateCode function
 * @desc validates authorization code with db
 * @param chance code from $routeParams
 * @return success response code
 */
 // function validateCode(authCode) {
 //   console.log('AuthService validateCode', authCode);
 //   $http.put( '/mail' , authCode ).then(function(response){
 //   console.log( 'Code Validated: ', response.data );
 // });
 // }
    /**
     * loginUser function
     * @desc authenticate the username and pwd
     * @param user Object from input fields in login.html
     * @return success to let coach view
     */
  function loginUser(user) {
    console.log('get me here', user);

    $http.post('/', user).then(function(response) {
          console.log('RESPONSE: ', response.data);
          if(response) {
            console.log('success: ', response.data);
            auth.getTickets(response.data);
            // location works with SPA (ng-route)
            console.log('redirecting to user page');
            $location.path('/adminHome');
          } else {
            console.log('failure: ', response);
          }
        });
      }

  /**
   * registerAdmin function
   * @desc
   * @param
   * @return
   */
  function registerAdmin(admin) {
    console.log('registerAdmin', admin);
    $http.post('/register/admin', admin).then(function(response) {
          console.log('RESPONSE: ', response.data);
          if(response.data == 'OK') {
            console.log('success: ', response.data);
            $location.path('/login');
          } else {
            console.log('failure: ', response);
          }
        });
      }
    return {
      sendActivation : sendActivation,
      loginUser: loginUser,
      registerAdmin: registerAdmin,
      addUserPwd: addUserPwd

    };

  }]);
