'use strict';
angular.module('webApp.contractorLogin', ['ngRoute', 'angularMoment', 'firebase', 'ui.bootstrap']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/contractorLogin', {
        templateUrl: 'contractorLogin/contractorLogin.html'
        , controller: 'contractorLoginCtrl'
    });
    }]).controller('contractorLoginCtrl', ['$scope', '$filter', '$uibModal', 'CommonProp', 'moment', '$firebaseArray', '$firebaseObject', '$location', function ($scope, $filter, $uibModal, CommonProp, moment, $firebaseArray, $firebaseObject, $location) {
    /* 
        contractorLoginCtrl takes either a loginPin or a loginPin from the user and uses those to login a contractor while also displaying modals to ensure that contractors are signed in correctly. 
    */
    $scope.loginPin = "";
    $scope.logoutPin = "";
    /* Getting the name and company information from the database for a particular pin number entered.*/
    $scope.contractorLogin = function () {
        var ref = firebase.database().ref().child('Contractors').orderByChild("pin").equalTo($scope.loginPin);
        var fbArray = $firebaseArray(ref);
        console.log(fbArray[0].name);
        ref.child('Contractors').orderByChild("pin").equalTo($scope.loginPin).once("value", function (snapshot) {
            var userData = snapshot.val();
            var values = JSON.stringify(userData);
            console.log(values[0]);
            if (userData) {
                snapshot.forEach(function (childSnapshot) {
                    var value = childSnapshot.val();
                    $scope.name = value.name;
                    $scope.company = value.company;
                });
                 /* $scope.$apply(function () {
                    $("#loginConfirmModal");
                });*/
                 setTimeout(function(){
                    alert("Name: " + $scope.name);
                }, 1000);
            }
            else {
             /*   $scope.$apply(function () {
                    $("#loginConfirmModal").modal('hide');
                });
                */
                setTimeout(function(){
                    alert("Doesn't exist. Please see Admin");
                }, 1000);
            }
        });
    };
    /* 
        Getting the name and company information from the database for a particular pin number entered.
    */
    $scope.contractorLogout = function () {
        var ref = firebase.database().ref();
        ref.child('Contractors').orderByChild("pin").equalTo($scope.logoutPin).once("value", function (snapshot) {
            var userData = snapshot.val();
            if (userData) {
                snapshot.forEach(function (childSnapshot) {
                    var value = childSnapshot.val();
                    $scope.name = value.name;
                    $scope.company = value.company;
                    /*var modalInstance = $uibModal.open({
                        component: 'myModal'
                        , controller: "contractorLoginCtrl"
                        , scope: $scope //passed current scope to the modal
                    });*/
                });
                alert("Name: " + $scope.name + "\n" + "Company: " + $scope.company);
            }
            else {
                alert("Wrong Pin. Please see Admin!");
              /*  $scope.$apply(function () {
                    $("#logoutConfirmModal").modal('hide');
                });*/
            }
        });
    };
    /* 
        Before logging in a model will be displayed to confirm if the information is correct for a particular pin number entered.
    */
    $scope.loginConfirmed = function () {

        var logInformation;
        var logoutTime = $filter('date')(new Date(), 'shortTime');
        var currentDate = new Date();
        var momentDate = moment(currentDate, 'MM/DD/YYYY');
        var loginTime = $filter('date')(new Date(), 'shortTime');
        var logOutTime = "00-00";
        var ref = firebase.database().ref().child('LogInformation');
        logInformation = $firebaseArray(ref);
        var ref = firebase.database().ref();
        ref.child("Contractors").orderByChild("pin").equalTo($scope.loginPin).once("value", function (snapshot) {
            var userData = snapshot.val();
            if (userData) {
                var rootRef = firebase.database().ref().child('Contractors');
                var filterRef;
                filterRef = rootRef.orderByChild('pin').equalTo($scope.loginPin);
                $scope.contractors = $firebaseArray(filterRef);
                $scope.contractors.$loaded().then(function () {
                    angular.forEach($scope.contractors, function (contractor) {
                        console.log(moment(contractor.date).add(1, 'years').year())
                        var updateRef = firebase.database().ref().child('Contractors/' + contractor.$id);
                        // Don't let the contractor sign in if they are already signed in
                        if (contractor.logStatus == 1) {
                            console.log("You're Already Logged in...");
                            return alert("You're Already Logged in...");
                        }
                        // Don't let the contractor sign in if it has been a year since their last safety training. 
                        else if (momentDate.isSame(moment(contractor.date).add(1, 'years'), 'day')) {
                            console.log("THE SAME");
                            alert("Your safety training needs to be updated. Please see admin");
                            return;
                        }
                        // Don't let the contractor sign in if it has been over a year since their last safety training. 
                        else if (momentDate.isAfter(moment(contractor.date).add(1, 'years'), 'day')) {
                            console.log("After");
                            alert("Your safety training needs to be updated. Please see admin");
                            return;
                        }
                        // If the contractor is up to date on their training, sign them in and update the loginformation.
                        else {
                            console.log("Logged in");
                            alert("Please confirm your information:\n\n" + "Name: " + contractor.name + "\n" + "Company: " + contractor.company);
                            updateRef.update({
                                logStatus: 1
                            })
                            logInformation.$add({
                                name: contractor.name
                                , company: contractor.company
                                , pin: contractor.pin
                                , loginTime: loginTime
                                , logOutTime: logOutTime
                                , currentLoginStatus: 1
                                , totalHours: 0
                                , date: $filter('date')(new Date(), 'MM/dd/yyyy')
                            });
                            return;
                        }
                    })
                });
            }
            else if ($scope.loginPin === "" || !userData) {
                return alert("Wrong Pin. Please see admin.");
            }
            $scope.loginPin = "";
        });
    };

    /* 
        Before logging out a model will be displayed to confirm if the information is correct for a particular pin number entered.
    */
    $scope.logoutConfirmed = function () {

    /* Getting the name and company information from the database for a particular pin number entered.*/


        var ref = firebase.database().ref();
        ref.child("Contractors").orderByChild("pin").equalTo($scope.logoutPin).once("value", function (snapshot) {
            var userData = snapshot.val();
            if (userData) {
                var rootRefCon = firebase.database().ref().child('Contractors');
                var filterRefCon;
                filterRefCon = rootRefCon.orderByChild('pin').equalTo($scope.logoutPin);
                $scope.contractors = $firebaseArray(filterRefCon);
                $scope.contractors.$loaded().then(function () {
                    angular.forEach($scope.contractors, function (contractor) {
                        var updateRef = firebase.database().ref().child('Contractors/' + contractor.$id);
                        if (contractor.logStatus == 0) {
                            console.log("You're Already Logged Out!!");
                            alert("You're Already Logged Out...");
                        }
                        else if (contractor.logStatus == 1) {
                            alert("Please confirm your information:\n\n" + "Name: " + contractor.name + "\n" + "Company: " + contractor.company);
                            updateRef.update({
                                logStatus: 0
                            });
                            var rootRefLog = firebase.database().ref().child('LogInformation');
                            var filterRefLog = rootRefLog.orderByChild('pin').equalTo(contractor.pin);
                            $scope.logInformation = $firebaseArray(filterRefLog);
                            $scope.logInformation.$loaded().then(function () {
                                angular.forEach($scope.logInformation, function (logStatuses) {
                                    if (logStatuses.currentLoginStatus == 1) {
                                        console.log("Found one");
                                        var logoutTime = $filter('date')(new Date(), 'shortTime');
                                        var startTime = moment(logStatuses.loginTime, "HH:mm a");
                                        var endTime = moment(logoutTime, "HH:mm a");
                                        var duration = moment.duration(endTime.diff(startTime));
                                        var hours = parseInt(duration.asHours());
                                        var minutes = parseInt(duration.asMinutes()) - hours * 60;
                                        var totalHours = hours + 'hr ' + minutes + 'min';
                                        var updateRefLog = firebase.database().ref().child('LogInformation/' + logStatuses.$id);
                                        updateRefLog.update({
                                            currentLoginStatus: 0
                                            , logOutTime: logoutTime
                                            , totalHours: totalHours
                                        }).then(function (ref) {}, function (error) {
                                            console.log(error);
                                        });
                                    }
                                })
                            });
                            return;
                        }
                    })
                });
            }
            else {
                return alert("Wrong Pin. Please see admin.");
            }
            $scope.logoutPin = "";
        });
    };
}]);