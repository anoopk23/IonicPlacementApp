var app = angular.module('placementApp');


app.controller('errorCtrl', function($scope, $http, $ionicModal, $filter, $stateParams){
	$scope.error = $stateParams;
})