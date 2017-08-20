var app = angular.module('placementApp');

// app.service('userService', function() {
//   this.sharedInfo= 'default value';
// });

app.controller('userListCtrl', function($scope, $http, $ionicModal, $state) {

    // Students.list.
    // then(function(response) {
    //       $scope.students = response.data;
    // });
  // console.log(Students.list);
  // $scope.student = {
  //   name: 'Bill Colins'
  // }
  var base_uri = 'http://192.168.43.84:3000/api';
  $scope.setData = function(url) {

    $http.get(url)
      .success(function(data) {
          $scope.students = data;
          // console.log('data success');
          // console.log($scope.students)
      })
      .error(function(data, status, headers, config) {
        console.log('data error');
        $state.go("error", {data:data, status:status, headers:headers, config:config});

      });
  }

    
  // $scope.setData('http://localhost:3000/api/students');
  $scope.setData(base_uri + '/students');

  $ionicModal.fromTemplateUrl('templates/addUserPop.html', {
    scope: $scope,
    animation: 'animated bounceInUp'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
  $scope.createStudent = function(u) {        
    // $scope.contacts.push({ name: u.firstName + ' ' + u.lastName });

    var req = {
      method: 'POST',
      // url: 'http://localhost:3000/api/students',
      url: base_uri + '/students',
      headers: {
        'Content-Type': 'application/json'
        // "Access-Control-Allow-Origin": "*"
      },
      data: {
        "name": u.name,
        "branch": u.branch,
        "id": u.id,
        "cgpa": u.cgpa
      }

    }
    

    $http(req).then(function(rsp) {
      // console.log('successfully posted:');
      // console.log(rsp);
      $scope.students.push(rsp.data);
    },
    function(rsp) {
      // console.log('failed: ' + rsp.data);
      $state.go("error", {data:rsp.data, status:rsp.status, headers:rsp.headers, config:rsp.config});

    });

    $scope.modal.hide();
  };
 

});