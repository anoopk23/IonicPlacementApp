// var qs = new Querystring();
// var sid = qs.get("student_id");
// var sid = document.URL.substring(parent.document.URL.indexOf('=') + 1, parent.document.URL.length);

var app = angular.module('placementApp');




app.controller('editUserCtrl', function($scope, $http, $stateParams, $ionicModal, $state) {
  // Students.find($stateParams.studentid, function(student) {
  //   $scope.student = student;
  // });
  var base_uri = 'http://192.168.43.84:3000/api';
  // var url = 'http://localhost:3000/api/students/?_id=';
  var url = base_uri + '/students/?_id=';
  var param = $stateParams.studentid;

  // $http.get(url)
  //   .success(function(data) {
  //       console.log(data);
  //   })
  //   .error(function(data) {
  //       console.log('data error');
  //   });
  $scope.setData = function(url) {
    $http.get(url)
      .success(function(data) {
          $scope.student = data[0];
          $scope.student1 = data[0];
          console.log('setData success');
      })
      .error(function(data, status, headers, config) {
          console.log('data error');
          $state.go("error", {data:data, status:status, headers:headers, config:config});

      });

  }

  $scope.setData(url + param);
	
	$ionicModal.fromTemplateUrl('templates/editUserPop.html', {
		scope: $scope,
		animation: 'animated bounceInUp'
	}).then(function(modal) {
		$scope.modal = modal;
	});


	$scope.editStudent = function(u) {
    $scope.student = u;

    // $http.put('http://localhost:3000/api/students/' + $stateParams.studentid, {
		$http.put(base_uri + '/students/' + $stateParams.studentid, {
			"name": u.name,
			"branch": u.branch,
			"id": u.id,
			"cgpa": u.cgpa
		})
    .error(function(data, status, headers, config) {
       $state.go("error", {data:data, status:status, headers:headers, config:config});
       // $scope.setData(); 
       // $scope.student = null;
    });

    $scope.modal.hide();
    	// $scope.modal.remove();
	}

  $scope.hideModal = function() {
    $scope.modal.hide();
    $scope.setData(url + param);

  }




});