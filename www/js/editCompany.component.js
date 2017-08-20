
var app = angular.module('placementApp');




app.controller('editCompanyCtrl', function($scope, $http, $stateParams, $ionicModal, $filter, $state) {
  var base_uri = 'http://192.168.43.84:3000/api';
  // var url = 'http://localhost:3000/api/companies/?_id=';
  var url = base_uri + '/companies/?_id=';
  var param = $stateParams.companyid;

  $scope.setData = function(url) {
    $http.get(url)
      .success(function(data) {
          d = $filter('date')(data[0].date, "yyyy/MM/dd");
          // console.log(d);
          // d = d.split('/');
          // var month_names = ["January", "February", "March", "April", "May", "June",
          //   "July", "August", "September", "October", "November", "December"
          //   ];
          // data[0].date = parseInt(d[0]).toString() + ' ' + month_names[parseInt(d[1]) - 1] + ' ' + d[2];
          data[0].date = d;
          data[0].branches = data[0].branches.join();
          $scope.company = data[0];
          $scope.company_edit = data[0];
      })
      .error(function(data, status, headers, config) {
        // console.log('data error');
        $state.go("error", {data:data, status:status, headers:headers, config:config});

      });
  }

  $scope.setData(url + param);
	
	$ionicModal.fromTemplateUrl('templates/editCompanyPop.html', {
		scope: $scope,
		animation: 'animated bounceInUp'
	}).then(function(modal) {
		$scope.modal = modal;
  });

	$scope.editCompany = function(u) {

    // $http.put('http://localhost:3000/api/companies/' + $stateParams.companyid, {
		$http.put(base_uri + '/companies/' + $stateParams.companyid, {
			"name": u.name,
			"branches": (u.branches + '').split(/\s*,\s*/),
			"date": u.date,
			"reg_list": u.reg_list
		}).success(function(data) {
      console.log('successfully updated to following:')
      console.log(data)
    }).error(function(data, status, headers, config) {
      // console.log("error: " + status)
      $state.go("error", {data:data, status:status, headers:headers, config:config});

    });

    $scope.modal.hide();
    // $scope.company = $scope.company_edit;
  }

  $scope.showModal = function(u) {
    // $scope.company_edit = u;
    $scope.modal.show();
  }

  $scope.hideModal = function() {
    $scope.modal.hide();
    $scope.setData(url + param);
    // $scope.modal = null;
  }





});

app.controller('regListCtrl', function($scope, $http, $stateParams, $ionicModal, $q, $state) {
  // var url = 'http://localhost:3000/api/companies/?_id=';
  var base_uri = 'http://192.168.43.84:3000/api';
  var url = base_uri + '/companies/?_id=';
  var param = $stateParams.companyid;


  $http.get(url + param)
    .success(function(data) {
      $scope.company = data[0];
    })
    .error(function(data, status, headers, config) {
      console.log('data error');
      $state.go("error", {data:data, status:status, headers:headers, config:config});

    });

  // var url = 'http://localhost:3000/api/companies/' + $stateParams.companyid + '/reg-list';
  var url = base_uri + '/companies/' + $stateParams.companyid + '/reg-list';
  console.log("GET1: " + url);
  // reg_get = $http.get(url);
    
  $http.get(url).success(function(data) {
      $scope.reg_student_list = data.reg_list;
      // console.log($scope.reg_student_list);
      
    }).error(function(data, status, headers, config) {
      console.log('data error');
      $state.go("error", {data:data, status:status, headers:headers, config:config});

    });

  $ionicModal.fromTemplateUrl('templates/unRegStudentPop.html', {
    scope: $scope,
    animation: 'animated bounceInUp'
  }).then(function(modal) {
    $scope.modal = modal;

    $scope.createList = function() {
      // var url = 'http://localhost:3000/api/companies/' + $stateParams.companyid + '/reg-list';
      var url = base_uri + '/companies/' + $stateParams.companyid + '/reg-list';
      console.log("GET2: " + url);
      $http.get(url).then(function(res) {
        $scope.students = [];
        var unreg_list = res.data.unreg_list.filter(function(entry) {
          return $scope.company.branches.indexOf(entry.branch) >= 0;
        });
        for (var i = 0; i < unreg_list.length; i++) {
          $scope.students.push({value:unreg_list[i], checked:false});
        }
        
        // console.log(res.data);
        // console.log($scope.students);


        
      },
      function(rsp) {
        // console.log('failed: ' + rsp.data);
        $state.go("error", {data:rsp.data, status:rsp.status, headers:rsp.headers, config:rsp.config});

      });
    }

    $scope.showRegList = function() {
      $scope.createList();
      $scope.modal.show();
    }

    $scope.addStudents = function() {
      $scope.createList();
      // $http.put('http://localhost:3000/api/companies/' + $stateParams.companyid, {
      for (var i = $scope.students.length - 1; i >= 0; i--) {
        if($scope.students[i].checked) {
          $scope.company.reg_list.push($scope.students[i].value._id);
          $scope.reg_student_list.push($scope.students[i].value)
        }
      }

      $http.put(base_uri + '/companies/' + $stateParams.companyid, {
        "name": $scope.company.name,
        "branches": $scope.company.branches,
        "date": $scope.company.date,
        "reg_list": $scope.company.reg_list
      })
      .error(function(data, status, headers, config) {
        $state.go("error", {data:data, status:status, headers:headers, config:config});
        for (var i = 0; i < $scope.students.length; i++) {
          $scope.students[i].checked = false;
        }
        // $scope.createList();
      });
      modal.hide();
    }
      

  });



});

app.controller('regStudentCtrl', function($scope, $http, $stateParams) {
  
  // var url = 'http://localhost:3000/api/companies/' + $stateParams.companyid + '/reg-list';
  var base_uri = 'http://192.168.43.84:3000/api';
  var url = base_uri + '/companies/' + $stateParams.companyid + '/reg-list';
  
  $http.get(url).then(function(res) {
      $scope.student = res.data.reg_list.filter(function(s) {
        return s._id == $stateParams.studentid;
      })[0];
      
    })

})

