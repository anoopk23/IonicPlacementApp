// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
// run chrome:
// "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --user-data-dir="C:/Chrome dev session" --disable-web-security

var app = angular.module('placementApp', ['ionic', 'ngMessages'])

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  
  // $ionicConfigProvider.views.transition('android'); //none, ios

  $stateProvider

    .state('home', {
      url: '/home',
      templateUrl: 'templates/main.html'
      // controller: 'AppCtrl'
    })

    .state('students', {
      cache: false,
      url: '/student',
      templateUrl: 'templates/userList.html',
      controller: 'userListCtrl'
    })

    .state('companies', {
      cache: false,
      url: '/company',
      templateUrl: 'templates/companyList.html',
      controller: 'companyListCtrl'
    })

    .state('editStudent', {
      url: '/student/:studentid',
      templateUrl: 'templates/editUser.html',
      controller: 'editUserCtrl'
    })
    
    .state('editCompany', {
      url: '/company/:companyid',
      templateUrl: 'templates/editCompany.html',
      controller: 'editCompanyCtrl'
    })

    .state('regList', {
      url: '/company/:companyid/reg-list',
      templateUrl: 'templates/regList.html',
      controller: 'regListCtrl'
    })

    .state('regStudent', {
      url: '/company/:companyid/reg-list/:studentid',
      templateUrl: 'templates/regStudent.html',
      controller:'regStudentCtrl'
    })

    .state('error', {
      url: '/error',
      templateUrl: 'templates/error.html',
      controller: 'errorCtrl',
      params: {data:null, status:null, headers:null, config:null}
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');
});


app.factory('Students', function($http) {
  // var cachedData = [
  //     {
  //       name: "Pearl",
  //       branch: "CE",
  //       id: "10562",
  //       cgpa: "5.9"

  //     },
      
  //     {
  //       name: "Avrill",
  //       branch: "CSE",
  //       id: "10821",
  //       cgpa: "8.3"
  //     }
  //   ];

  var cachedData;
  
  var url = 'http://localhost:3000/api/students';
  // $http.get(url)
  //   .then(function(response) {
  //       cachedData = response.data;
  //   });
  //   console.log(cachedData);
  // function getData(studentname, callback) {
 
  //   // var url = 'http://api.themoviedb.org/3/',
  //   //   mode = 'search/movie?query=',
  //   //   name = '&query=' + encodeURI(moviename),
  //   //   key = '&api_key=5fbddf6b517048e25bc3ac1bbeafb919';
 
  //   // $http.get(url + mode + key + name).success(function(data) {
 
  //   //   cachedData = data.results;
  //   //   callback(data.results);
  //   // });
  //   $http.get(url).success(function(data) {
  //     cachedData = data.results;
  //     callback(cachedData);
  //   });

  // }
 
  return {
    list: $http.get(url)

  };

  // return {
  //   list: getData,
  //   find: function(name, callback) {
  //     console.log(name);
  //     var student = cachedData.filter(function(entry) {
  //       return entry.id == name;
  //     })[0];
  //     callback(student);
  //   }
  // };
 
});

var http_config = {    headers: {
      "Access-Control-Allow-Origin": "http://localhost:*"
    }
};





app.directive('holdList', ['$ionicGesture', function ($ionicGesture) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $ionicGesture.on('hold', function (e) {

                var content = element[0].querySelector('.item-content');

                var buttons = element[0].querySelector('.item-options');
                var buttonsWidth = buttons.offsetWidth;

                ionic.requestAnimationFrame(function() {
          content.style[ionic.CSS.TRANSITION] = 'all ease-out .25s';

          if (!buttons.classList.contains('invisible')) {
            content.style[ionic.CSS.TRANSFORM] = '';
            setTimeout(function() {
              buttons.classList.add('invisible');
            }, 250);        
          } else {
            buttons.classList.remove('invisible');
            content.style[ionic.CSS.TRANSFORM] = 'translate3d(-' + buttonsWidth + 'px, 0, 0)';
          }
        });


            }, element);
        }
    };
} ]);
