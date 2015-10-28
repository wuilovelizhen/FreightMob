angular.module('MobileAPP.controllers', [
    'ionic',
    'ngCordova.plugins.dialogs',
    'ngCordova.plugins.toast',
    'ngCordova.plugins.appVersion',
    'ngCordova.plugins.file',
    'ngCordova.plugins.fileTransfer',
    'ngCordova.plugins.fileOpener2',
    'ngCordova.plugins.datePicker',
    'ngCordova.plugins.barcodeScanner',
    'ui.select',
    'MobileAPP.directives',
    'MobileAPP.services'
])

    .controller('LoadingCtrl',
        ['$state', '$timeout',
        function ($state, $timeout) {
            $timeout(function () {
                $state.go('login', { 'CheckUpdate': 'N' }, { reload: true });
            }, 2500);
        }])

    .controller('LoginCtrl',
        ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$timeout', '$ionicLoading', '$cordovaToast', '$cordovaAppVersion', 'JsonServiceClient', 
        function ($scope, $http, $state, $stateParams, $ionicPopup, $timeout, $ionicLoading, $cordovaToast, $cordovaAppVersion, JsonServiceClient) {
            $scope.logininfo = {};
            $scope.logininfo.strUserName = "";
            $scope.logininfo.strPassword = "";
            $('#iUserName').on('keydown', function (e) {
                if (e.which === 9 || e.which === 13) {
                    $('#iPassword').focus();
                }
            });
            $('#iPassword').on('keydown', function (e) {
                if (e.which === 9 || e.which === 13) {
                    $scope.login();
                }
            });
            if ($stateParams.CheckUpdate === 'Y') {
                var url = strWebServiceURL + strBaseUrl + '/update.json';
                $http.get(url)
                    .success(function (res) {
                        var serverAppVersion = res.version;
                        $cordovaAppVersion.getVersionNumber().then(function (version) {
                            if (version != serverAppVersion) {
                                $state.go('update', { 'Version': serverAppVersion });
                            }
                        });
                    })
                    .error(function (res) {});
            }
            $scope.checkUpdate = function () {
                var url = strWebServiceURL + strBaseUrl + '/update.json';
                $http.get(url)
                    .success(function (res) {
                        var serverAppVersion = res.version;
                        $cordovaAppVersion.getVersionNumber().then(function (version) {
                            if (version != serverAppVersion) {
                                $state.go('update', { 'Version': serverAppVersion });
                            } else {
                                var alertPopup = $ionicPopup.alert({
                                    title: "Already the Latest Version!",
                                    okType: 'button-assertive'
                                });
                                $timeout(function () {
                                    alertPopup.close();
                                }, 2500);
                            }
                        });
                    })
                    .error(function (res) {
                        var alertPopup = $ionicPopup.alert({
                            title: "Connect Update Server Error!",
                            okType: 'button-assertive'
                        });
                        $timeout(function () {
                            alertPopup.close();
                        }, 2500);
                    });
            };
            $scope.setConf = function () {
                $state.go('setting', {}, { reload: true });
            };
            $scope.login = function () {
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.close();
                }
                if ($scope.logininfo.strUserName == "") {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Please Enter User Name.',
                        okType: 'button-assertive'
                    });
                    $timeout(function () {
                        alertPopup.close();
                    }, 2500);
                    return;
                }
                /*
                if ($scope.logininfo.strPassword == "") {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Please Enter Password.',
                        okType: 'button-assertive'
                    });
                    $timeout(function () {
                        alertPopup.close();
                    }, 2500);
                    return;
                }
                */
                $ionicLoading.show();
                var jsonData = { "UserId": $scope.logininfo.strUserName, "Password": hex_md5($scope.logininfo.strPassword) };
                var strUri = "/api/wms/action/list/login";
                var onSuccess = function (response) {
                    $ionicLoading.hide();
                    sessionStorage.clear();
                    sessionStorage.setItem("UserId", $scope.logininfo.strUserName);
                    $state.go('main', {}, { reload: true });
                };
                var onError = function () {
                    $ionicLoading.hide();
                };
                JsonServiceClient.postToService(strUri, jsonData, onSuccess, onError);
            };
        }])

    .controller('SettingCtrl',
        ['$scope', '$state', '$timeout', '$ionicLoading', '$ionicPopup', '$cordovaToast', '$cordovaFile',
        function ($scope, $state, $timeout, $ionicLoading, $ionicPopup, $cordovaToast, $cordovaFile) {
            $scope.Setting = {};
            $scope.Setting.WebServiceURL = strWebServiceURL.replace('http://', '');
            $scope.Setting.BaseUrl = strBaseUrl.replace('/', '');
            $scope.returnLogin = function () {
                $state.go('login', { 'CheckUpdate': 'Y' }, { reload: true });
            };
            $scope.saveSetting = function () {
                if ($scope.Setting.WebServiceURL.length > 0) {
                    strWebServiceURL = $scope.Setting.WebServiceURL;
                    if (strWebServiceURL.length > 0) {
                        strWebServiceURL = "http://" + strWebServiceURL;
                    }
                } else { $scope.Setting.WebServiceURL = strWebServiceURL }
                if ($scope.Setting.BaseUrl.length > 0) {
                    strBaseUrl = $scope.Setting.BaseUrl;
                    if (strBaseUrl.length > 0) {
                        strBaseUrl = "/" + strBaseUrl;
                    }
                } else { $scope.Setting.BaseUrl = strBaseUrl }
                var data = 'BaseUrl=' + $scope.Setting.BaseUrl + '##WebServiceURL=' + $scope.Setting.WebServiceURL;
                var path = cordova.file.externalRootDirectory;
                var directory = "TmsApp";
                var file = directory + "/Config.txt";
                $cordovaFile.writeFile(path, file, data, true)
                    .then(function (success) {
                        $state.go('login', { 'CheckUpdate': 'Y' }, { reload: true });
                    }, function (error) {
                        $cordovaToast.showShortBottom(error);
                    });
            };
            $scope.delSetting = function () {
                var path = cordova.file.externalRootDirectory;
                var directory = "TmsApp";
                var file = directory + "/Config.txt";
                $cordovaFile.removeFile(path, file)
                    .then(function (success) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Delete Config File Success.',
                            okType: 'button-calm'
                        });
                        $timeout(function () {
                            alertPopup.close();
                        }, 2500);
                    }, function (error) {
                        $cordovaToast.showShortBottom(error);
                    });
            };
        }])

    .controller('UpdateCtrl',
        ['$scope', '$stateParams', '$state', '$timeout', '$ionicLoading', '$cordovaToast', '$cordovaFile', '$cordovaFileTransfer', '$cordovaFileOpener2',
        function ($scope, $stateParams, $state, $timeout, $ionicLoading, $cordovaToast, $cordovaFile, $cordovaFileTransfer, $cordovaFileOpener2) {
            $scope.strVersion = $stateParams.Version;
            $scope.returnLogin = function () {
                $state.go('login', { 'CheckUpdate': 'N' }, { reload: true });
            };
            $scope.upgrade = function () {
                $ionicLoading.show({
                    template: "Download  0%"
                });
                var url = strWebServiceURL + strBaseUrl + "/TMS.apk";
                var blnError = false;
                $cordovaFile.checkFile(cordova.file.externalRootDirectory, "TMS.apk")
                .then(function (success) {
                    //
                }, function (error) {
                    blnError = true;
                });
                var targetPath = cordova.file.externalRootDirectory + "TMS.apk";
                var trustHosts = true;
                var options = {};
                if (!blnError) {
                    $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
                        $ionicLoading.hide();
                        $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive'
                        ).then(function () {
                            // success
                        }, function (err) {
                            // error
                        });
                    }, function (err) {
                        $cordovaToast.showShortCenter('Download faild.');
                        $ionicLoading.hide();
                        $state.go('login', { 'CheckUpdate': 'N' }, { reload: true });
                    }, function (progress) {
                        $timeout(function () {
                            var downloadProgress = (progress.loaded / progress.total) * 100;
                            $ionicLoading.show({
                                template: "Download  " + Math.floor(downloadProgress) + "%"
                            });
                            if (downloadProgress > 99) {
                                $ionicLoading.hide();
                            }
                        })
                    });
                } else {
                    $ionicLoading.hide();
                    $cordovaToast.showShortCenter('Check APK file faild.');
                    $state.go('login', { 'CheckUpdate': 'N' }, { reload: true });
                }
            };
        }])

    .controller('MainCtrl',
        ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$timeout', '$cordovaBarcodeScanner', 'JsonServiceClient',
        function ($scope, $http, $state, $stateParams, $ionicPopup, $timeout, $cordovaBarcodeScanner, JsonServiceClient) {
            $scope.GoToRcbp = function () {
                $state.go('rcbpList', {}, { reload: true });
            };
            $scope.scanBarcode = function () {
                $cordovaBarcodeScanner.scan().then(function (imageData) {
                    alert(imageData.text);
                }, function (error) {
                    alert(error);
                });
            };
        }])

    .controller('RcbpListCtrl',
        ['$scope', '$state', '$stateParams', '$http', '$ionicPopup', '$timeout', '$ionicLoading', '$cordovaDialogs', 'JsonServiceClient',
        function ($scope, $state, $stateParams, $http, $ionicPopup, $timeout, $ionicLoading, $cordovaDialogs, JsonServiceClient) {
            $scope.Rcbp = {};
            $scope.Rcbp.BusinessPartyName = "";
            $scope.returnMain = function () {
                $state.go('main', {}, { reload: true });
            };
            $scope.GoToDetail = function (Rcbp1) {
                $state.go('rcbpDetail', { 'TrxNo':Rcbp1.TrxNo }, { reload: true });
            };
            $('#txt-rcbp-list-BusinessPartyName').on('keydown', function (e) {
                if (e.which === 9 || e.which === 13) {
                    getRcbp1($scope.Rcbp.BusinessPartyName);
                }
            });
            var getRcbp1 = function (BusinessPartyName) {
                $ionicLoading.show();
                var strUri = "/api/wms/action/list/rcbp1";
                if (BusinessPartyName != null && BusinessPartyName.length > 0) {
                    strUri = strUri + "/" + $scope.Rcbp.BusinessPartyName;
                }
                var onSuccess = function (response) {
                    $scope.Rcbp1s = response.data.results;
                    $ionicLoading.hide();
                };
                var onError = function (response) {
                    $ionicLoading.hide();
                };
                JsonServiceClient.getFromService(strUri, onSuccess);
            };
            getRcbp1(null);
        }])

    .controller('RcbpDetailCtrl',
        ['$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicHistory', '$ionicLoading', '$ionicPopup', '$ionicModal', 'JsonServiceClient',
        function ($scope, $stateParams, $state, $http, $timeout, $ionicHistory, $ionicLoading, $ionicPopup, $ionicModal, JsonServiceClient) {
            $scope.rcbpDetail = {};
            $scope.rcbp3Detail = {};
            $scope.rcbpDetail.TrxNo = $stateParams.TrxNo;
            $scope.returnList = function () {
                if ($ionicHistory.backView()) {
                    $ionicHistory.goBack();
                }
                else {
                    $state.go('rcbpList', {}, {});
                }
            };
            $scope.GoToDetailEdit = function () {
                $state.go('rcbpDetailEdit', {}, { reload: true });
            };
            $scope.blnContainNameCard = function (rcbp3) {
                if (typeof (rcbp3) == "undefined") return false;
                if (typeof (rcbp3.NameCard) == "undefined") return false;
                if (rcbp3.NameCard.length > 0) {
                    return true;
                } else { return false; }
            };
            var GetRcbp3s = function (BusinessPartyCode) {
                $ionicLoading.show();
                var strUri = "/api/wms/action/list/rcbp3/" + BusinessPartyCode;
                var onSuccess = function (response) {
                    $scope.rcbp3s = response.data.results;
                    $ionicLoading.hide();
                };
                var onError = function (response) {
                    $ionicLoading.hide();
                };
                JsonServiceClient.getFromService(strUri, onSuccess, onError);
            };
            var GetRcbp1Detail = function (TrxNo) {
                $ionicLoading.show();
                var strUri = "/api/wms/action/list/rcbp1/trxNo/" + TrxNo;
                var onSuccess = function (response) {
                    $scope.rcbpDetail = response.data.results[0];
                    $ionicLoading.hide();
                    GetRcbp3s($scope.rcbpDetail.BusinessPartyCode);
                };
                var onError = function (response) {
                    $ionicLoading.hide();
                };
                JsonServiceClient.getFromService(strUri, onSuccess, onError);
            };
            GetRcbp1Detail($scope.rcbpDetail.TrxNo);
            $ionicModal.fromTemplateUrl('rcbp3Detail.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });//Cleanup the modal when done with it!
            $scope.openModal = function (rcbp3) {
                $scope.rcbp3Detail = rcbp3;
                $scope.modal.show();
            };
            $scope.closeModal = function () {
                $scope.modal.hide();
            };
        }])

    .controller('RcbpDetailEditCtrl',
        ['$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicLoading', '$ionicPopup', 'JsonServiceClient',
        function ($scope, $stateParams, $state, $http, $timeout, $ionicLoading, $ionicPopup, JsonServiceClient) {
            $scope.returnDetail = function () {
                //$state.go('rcbpDetail', {}, { reload: true });
            };
        }])