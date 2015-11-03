var appControllers = angular.module('MobileAPP.controllers', [
    'ionic',
	'ionic-material',
    'ngCordova.plugins.toast',
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
]);

appControllers.controller('LoadingCtrl',
        ['$state', '$timeout',
        function ($state, $timeout) {
            $timeout(function () {
                $state.go('login', { 'CheckUpdate': 'N' }, { reload: true });
            }, 2500);
        }]);

appControllers.controller('LoginCtrl',
        ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$timeout', '$ionicLoading', 'ionicMaterialInk', 'ionicMaterialMotion', '$cordovaToast', '$cordovaAppVersion', 'JsonServiceClient', 
        function ($scope, $http, $state, $stateParams, $ionicPopup, $timeout, $ionicLoading, ionicMaterialInk, ionicMaterialMotion, $cordovaToast, $cordovaAppVersion, JsonServiceClient) {
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
            $timeout(function () {
                ionicMaterialInk.displayEffect();
                ionicMaterialMotion.ripple();
            }, 0);
        }]);

appControllers.controller('SettingCtrl',
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
        }]);

appControllers.controller('UpdateCtrl',
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
        }]);

appControllers.controller('MainCtrl',
        ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$timeout', 'ionicMaterialInk', 'ionicMaterialMotion', '$cordovaBarcodeScanner', 'JsonServiceClient',
        function ($scope, $http, $state, $stateParams, $ionicPopup, $timeout, ionicMaterialInk, ionicMaterialMotion, $cordovaBarcodeScanner, JsonServiceClient) {
            $scope.GoToRcbp = function () {
                $state.go('contacts', {}, { reload: true });
            };
            $scope.GoToPa = function () {
                $state.go('paymentApproval', {}, { reload: true });
            };
            $scope.GoToVS = function () {
                $state.go('vesselSchedule', {}, { reload: true });
            };
            $scope.GoToSS = function () {
                $state.go('shipmentStatus', {}, { reload: true });
            };
            $timeout(function () {
                ionicMaterialInk.displayEffect();
                ionicMaterialMotion.ripple();
            }, 0);
            /*
            $scope.scanBarcode = function () {
                $cordovaBarcodeScanner.scan().then(function (imageData) {
                    alert(imageData.text);
                }, function (error) {
                    alert(error);
                });
            };
            */
        }]);

appControllers.controller('ContactsCtrl',
        ['$scope', '$state', '$stateParams', '$http', '$ionicPopup', '$timeout', '$ionicLoading', '$cordovaDialogs', 'ionicMaterialInk', 'ionicMaterialMotion', 'JsonServiceClient',
        function ($scope, $state, $stateParams, $http, $ionicPopup, $timeout, $ionicLoading, $cordovaDialogs, ionicMaterialInk, ionicMaterialMotion, JsonServiceClient) {
            $scope.Rcbp = {};
            $scope.Rcbp.BusinessPartyName = "";
            $scope.returnMain = function () {
                $state.go('main', {}, { reload: true });
            };
            $scope.GoToDetail = function (Rcbp1) {
                $state.go('contactsDetail', { 'TrxNo': Rcbp1.TrxNo }, { reload: true });
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
                    $ionicLoading.hide();
                    $scope.Rcbp1s = response.data.results;
                    $timeout(function () {
                        ionicMaterialMotion.blinds();
                        ionicMaterialInk.displayEffect();
                    }, 0);
                };
                var onError = function (response) {
                    $ionicLoading.hide();
                };
                JsonServiceClient.getFromService(strUri, onSuccess);
            };
            getRcbp1(null);
        }]);

appControllers.controller('ContactsDetailCtrl',
        ['$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicHistory', '$ionicLoading', '$ionicPopup', '$ionicModal', 'JsonServiceClient',
        function ($scope, $stateParams, $state, $http, $timeout, $ionicHistory, $ionicLoading, $ionicPopup, $ionicModal, JsonServiceClient) {
            $scope.rcbpDetail = {};
            $scope.rcbp3Detail = {};
            $scope.rcbpDetail.TrxNo = $stateParams.TrxNo;
            $scope.returnList = function () {
                $state.go('contacts', {}, {});
            };
            $scope.GoToDetailEdit = function () {
                $state.go('contactsDetailEdit', {}, { reload: true });
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
        }]);

appControllers.controller('ContactsDetailEditCtrl',
        ['$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicLoading', '$ionicPopup', 'JsonServiceClient',
        function ($scope, $stateParams, $state, $http, $timeout, $ionicLoading, $ionicPopup, JsonServiceClient) {
            $scope.returnDetail = function () {
                $state.go('contactsDetail', {}, { reload: true });
            };
        }]);

appControllers.controller('PaymentApprovalCtl',
        ['$scope', '$http', '$timeout', '$state', '$ionicHistory', 'ionicMaterialInk', 'ionicMaterialMotion',
        function ($scope, $http, $timeout, $state, $ionicHistory, ionicMaterialInk, ionicMaterialMotion) {
            $scope.returnList = function () {
                if ($ionicHistory.backView()) {
                    $ionicHistory.goBack();
                }
                else {
                    $state.go('main', {}, {});
                }
            };
            $scope.returnMain = function () {
                $state.go('main', {}, { reload: true });
            };
            $scope.selectAll = function () {
            };
            $scope.clearAll = function () {
            };
            $scope.StatusCode = { text: "USE", checked: false };
            $scope.statusChange = function () {
                if ($scope.StatusCode.checked) {
                    $scope.StatusCode.text = "APP";
                } else {
                    $scope.StatusCode.text = "USE";
                }
            };
            $scope.data = {
                showReorder: false
            };
            $scope.items = [
                { id: 0 },
                { id: 1 },
                { id: 2 },
                { id: 3 },
                { id: 4 },
                { id: 5 },
                { id: 6 },
                { id: 7 },
                { id: 8 },
                { id: 9 },
                { id: 10 },
                { id: 11 },
                { id: 12 },
                { id: 13 },
                { id: 14 },
                { id: 15 }
            ];
            $timeout(function () {
                ionicMaterialInk.displayEffect();
                ionicMaterialMotion.blinds();
            }, 0);
        }]);

appControllers.controller('VesselScheduleCtl',
        ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$timeout', 'ionicMaterialInk', 'ionicMaterialMotion', 'JsonServiceClient',
        function ($scope, $http, $state, $stateParams, $ionicPopup, $timeout, ionicMaterialInk, ionicMaterialMotion, JsonServiceClient) {
            $scope.returnMain = function () {
                $state.go('main', {}, { reload: true });
            };
            $scope.Rcsv1s = [
                { PortCode: 'All', PortName: 'ALL' },
                { PortCode: 'DEAAH', PortName: 'AACHEN' },
                { PortCode: 'DKAAL', PortName: 'AALBORG' },
                { PortCode: 'JPABA', PortName: 'ABASHIRI, HOKKAIDO' },
                { PortCode: 'PGABW', PortName: 'ABAU' },
                { PortCode: 'DEABH', PortName: 'ABBEHAUSEN' },
                { PortCode: 'DEABF', PortName: 'ABBENFLETH' },
                { PortCode: 'FRABB', PortName: 'ABBEVILLE' },
                { PortCode: 'YEEAB', PortName: 'ABBSE' },
                { PortCode: 'SAAAK', PortName: 'ABU AL KHOOSH' },
                { PortCode: 'AEAUH', PortName: 'ABU DHABI' },
                { PortCode: 'FIAHV', PortName: 'AHVENANMAA MUUT' },
                { PortCode: 'AEAJM', PortName: 'AJMAN' },
                { PortCode: 'GAAKE', PortName: 'AKIENI' },
                { PortCode: 'SAAHA', PortName: 'AL HADA' },
                { PortCode: 'JMALP', PortName: 'ALLIGATOR POND' },
                { PortCode: 'DEAMR', PortName: 'AMRUN I.' },
                { PortCode: 'PFAAA', PortName: 'ANAAB' },
                { PortCode: 'DZAAE', PortName: 'ANNABA (FORMERLY BONE)' },
                { PortCode: 'USAAF', PortName: 'APALACHICOLA, FL' },
                { PortCode: 'DEAPE', PortName: 'APEN' },
                { PortCode: 'BRAAI', PortName: 'ARRAIAS' },
                { PortCode: 'AAAAA', PortName: 'ASASASAS' },
                { PortCode: 'DEASS', PortName: 'ASSEL' },
                { PortCode: 'SABDN', PortName: 'BADANA' },
                { PortCode: 'THBKK', PortName: 'BANGKOK' },
                { PortCode: 'GABGB', PortName: 'BOOUE' },
                { PortCode: 'AOCAB', PortName: 'CABINDA' },
                { PortCode: 'ECCUE', PortName: 'CUENCA' },
                { PortCode: 'AUDAA', PortName: 'DARRA, QL' },
                { PortCode: 'AEDAS', PortName: 'DAS ISLAND' },
                { PortCode: 'BDDAC', PortName: 'DHAKA' },
                { PortCode: 'AEDXB', PortName: 'DUBAI' },
                { PortCode: 'AEFAT', PortName: 'FATEH TERMINAL' },
                { PortCode: 'AEFJR', PortName: 'FUJAIRAH' },
                { PortCode: 'SGSIN', PortName: 'GGGGG' },
                { PortCode: 'SEHAD', PortName: 'HALMSTAD' },
                { PortCode: 'HKHKG', PortName: 'HONG KONG' },
                { PortCode: 'IDJKT', PortName: 'JAKARTA' },
                { PortCode: 'AEJEA', PortName: 'JEBEL ALI' },
                { PortCode: 'AEJED', PortName: 'JEBEL DHANNA' },
                { PortCode: 'TWKEL', PortName: 'KEELUNG' },
                { PortCode: 'AEKLF', PortName: 'KHOR AL FAKKAN' },
                { PortCode: 'BDKHL', PortName: 'KHULNA' },
                { PortCode: 'HKKWN', PortName: 'KOWLOON' },
                { PortCode: 'AUKAH', PortName: 'MELBOURNE-CITY HELIPORT, VI' },
                { PortCode: 'ADZZZ', PortName: 'O P ANDORRA' },
                { PortCode: 'VAZZZ', PortName: 'O P VATICAN CITYSTATE(HOLYSEE)' },
                { PortCode: 'MYPEN', PortName: 'PENANG' },
                { PortCode: 'AEKHL', PortName: 'PORT KHALID' },
                { PortCode: 'CVRAI', PortName: 'PRAIA' },
                { PortCode: 'IDBAP', PortName: 'PULAU BATAM' },
                { PortCode: 'PGRAA', PortName: 'RAKANDA' },
                { PortCode: 'RERUN', PortName: 'REUNION ISL/POINTE DES GALETS' },
                { PortCode: 'ANSAB', PortName: 'SABA IS' },
                { PortCode: 'USSSM', PortName: 'SAULT STE MARIE, MIWWW' },
                { PortCode: 'CNSHA', PortName: 'SHANGHAI' },
                { PortCode: 'VCSVD', PortName: 'ST VINCENT-ARNOS VALE' },
                { PortCode: 'FOFAE', PortName: 'THORSHAVN-VAGAR APT' },
                { PortCode: 'FIVAA', PortName: 'VAASA/VASA' },
                { PortCode: 'SAAWI', PortName: 'WAISUMAH' },
                { PortCode: 'DEAGE', PortName: 'WANGEROOGE' }
            ];
            $timeout(function () {
                ionicMaterialInk.displayEffect();
                ionicMaterialMotion.ripple();
            }, 0);
        }]);

appControllers.controller('ShipmentStatusCtl',
        ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$timeout', 'ionicMaterialInk', 'ionicMaterialMotion', 'JsonServiceClient',
        function ($scope, $http, $state, $stateParams, $ionicPopup, $timeout, ionicMaterialInk, ionicMaterialMotion, JsonServiceClient) {
            $scope.returnMain = function () {
                $state.go('main', {}, { reload: true });
            };
            $scope.Rcsv1s = [
                { PortCode: 'All', PortName: 'ALL' },
                { PortCode: 'DEAAH', PortName: 'AACHEN' },
                { PortCode: 'DKAAL', PortName: 'AALBORG' },
                { PortCode: 'JPABA', PortName: 'ABASHIRI, HOKKAIDO' },
                { PortCode: 'PGABW', PortName: 'ABAU' },
                { PortCode: 'DEABH', PortName: 'ABBEHAUSEN' },
                { PortCode: 'DEABF', PortName: 'ABBENFLETH' },
                { PortCode: 'FRABB', PortName: 'ABBEVILLE' },
                { PortCode: 'YEEAB', PortName: 'ABBSE' },
                { PortCode: 'SAAAK', PortName: 'ABU AL KHOOSH' },
                { PortCode: 'AEAUH', PortName: 'ABU DHABI' },
                { PortCode: 'FIAHV', PortName: 'AHVENANMAA MUUT' },
                { PortCode: 'AEAJM', PortName: 'AJMAN' },
                { PortCode: 'GAAKE', PortName: 'AKIENI' },
                { PortCode: 'SAAHA', PortName: 'AL HADA' },
                { PortCode: 'JMALP', PortName: 'ALLIGATOR POND' },
                { PortCode: 'DEAMR', PortName: 'AMRUN I.' },
                { PortCode: 'PFAAA', PortName: 'ANAAB' },
                { PortCode: 'DZAAE', PortName: 'ANNABA (FORMERLY BONE)' },
                { PortCode: 'USAAF', PortName: 'APALACHICOLA, FL' },
                { PortCode: 'DEAPE', PortName: 'APEN' },
                { PortCode: 'BRAAI', PortName: 'ARRAIAS' },
                { PortCode: 'AAAAA', PortName: 'ASASASAS' },
                { PortCode: 'DEASS', PortName: 'ASSEL' },
                { PortCode: 'SABDN', PortName: 'BADANA' },
                { PortCode: 'THBKK', PortName: 'BANGKOK' },
                { PortCode: 'GABGB', PortName: 'BOOUE' },
                { PortCode: 'AOCAB', PortName: 'CABINDA' },
                { PortCode: 'ECCUE', PortName: 'CUENCA' },
                { PortCode: 'AUDAA', PortName: 'DARRA, QL' },
                { PortCode: 'AEDAS', PortName: 'DAS ISLAND' },
                { PortCode: 'BDDAC', PortName: 'DHAKA' },
                { PortCode: 'AEDXB', PortName: 'DUBAI' },
                { PortCode: 'AEFAT', PortName: 'FATEH TERMINAL' },
                { PortCode: 'AEFJR', PortName: 'FUJAIRAH' },
                { PortCode: 'SGSIN', PortName: 'GGGGG' },
                { PortCode: 'SEHAD', PortName: 'HALMSTAD' },
                { PortCode: 'HKHKG', PortName: 'HONG KONG' },
                { PortCode: 'IDJKT', PortName: 'JAKARTA' },
                { PortCode: 'AEJEA', PortName: 'JEBEL ALI' },
                { PortCode: 'AEJED', PortName: 'JEBEL DHANNA' },
                { PortCode: 'TWKEL', PortName: 'KEELUNG' },
                { PortCode: 'AEKLF', PortName: 'KHOR AL FAKKAN' },
                { PortCode: 'BDKHL', PortName: 'KHULNA' },
                { PortCode: 'HKKWN', PortName: 'KOWLOON' },
                { PortCode: 'AUKAH', PortName: 'MELBOURNE-CITY HELIPORT, VI' },
                { PortCode: 'ADZZZ', PortName: 'O P ANDORRA' },
                { PortCode: 'VAZZZ', PortName: 'O P VATICAN CITYSTATE(HOLYSEE)' },
                { PortCode: 'MYPEN', PortName: 'PENANG' },
                { PortCode: 'AEKHL', PortName: 'PORT KHALID' },
                { PortCode: 'CVRAI', PortName: 'PRAIA' },
                { PortCode: 'IDBAP', PortName: 'PULAU BATAM' },
                { PortCode: 'PGRAA', PortName: 'RAKANDA' },
                { PortCode: 'RERUN', PortName: 'REUNION ISL/POINTE DES GALETS' },
                { PortCode: 'ANSAB', PortName: 'SABA IS' },
                { PortCode: 'USSSM', PortName: 'SAULT STE MARIE, MIWWW' },
                { PortCode: 'CNSHA', PortName: 'SHANGHAI' },
                { PortCode: 'VCSVD', PortName: 'ST VINCENT-ARNOS VALE' },
                { PortCode: 'FOFAE', PortName: 'THORSHAVN-VAGAR APT' },
                { PortCode: 'FIVAA', PortName: 'VAASA/VASA' },
                { PortCode: 'SAAWI', PortName: 'WAISUMAH' },
                { PortCode: 'DEAGE', PortName: 'WANGEROOGE' }
            ];
            $timeout(function () {
                ionicMaterialInk.displayEffect();
                ionicMaterialMotion.ripple();
            }, 0);
        }]);