var app = angular.module('placementApp');


app.controller('companyListCtrl', function($scope, $http, $ionicModal, $filter, $state) {

  base_uri = 'http://192.168.43.84:3000/api';
  $scope.setData = function(url) {

    $http.get(url)
      .success(function(data) {

        $scope.companies = [];
        for (var i = 0; i < data.length; i++) {
          // data[i].date = $filter('date')(data[i].date, "dd/MM/yyyy")

          var d = $filter('date')(data[i].date, "dd/MM/yyyy");
          d = d.split('/');
          var month_names = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
            ];
          data[i].date = parseInt(d[0]).toString() + ' ' + month_names[parseInt(d[1]) - 1] + ' ' + d[2];
          $scope.companies.push(data[i]);
        }
          // date = ($scope.companies[0].date);
          // date = $filter('date')(date, "dd/MM/yyyy");
          // console.log(date);
          console.log('setData success');
          // console.log($scope.companies)
      })
      .error(function(data, status, headers, config) {
          // console.log('data error');
          // $window.location.href = "/templates/error.html";
          $state.go("error", {data:data, status:status, headers:headers, config:config});
      });
  }

    
  // $scope.setData('http://localhost:3000/api/companies');
  $scope.setData(base_uri + '/companies');

  $ionicModal.fromTemplateUrl('templates/addCompanyPop.html', {
    scope: $scope,
    animation: 'animated bounceInUp'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
  $scope.createCompany = function(u) {        
    var req = {
      method: 'POST',
      // url: 'http://localhost:3000/api/companies',
      url: base_uri + '/companies',
      headers: {
        'Content-Type': 'application/json'
        // "Access-Control-Allow-Origin": "*"
      },
      data: {
        "name": u.name,
        "branches": u.branches,
        "date": u.date,
        "reg_list": []
        
      }

    }
    

    $http(req).then(function(rsp) {
      // console.log('successfully posted:');
      // console.log(rsp);
      var d = $filter('date')(rsp.data.date, "dd/MM/yyyy");
      d = d.split('/');
      var month_names = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ];
      rsp.data.date = parseInt(d[0]).toString() + ' ' + month_names[parseInt(d[1]) - 1] + ' ' + d[2];
      // $scope.companies.push(data[i]);
      $scope.companies.push(rsp.data);
    },
    function(rsp) {
      console.log(rsp);
      $state.go("error", {data:rsp.data, status:rsp.status, headers:rsp.headers, config:rsp.config});

    });

    $scope.modal.hide();
  };
 
});