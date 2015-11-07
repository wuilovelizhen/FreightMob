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

appControllers.controller('LoadingCtl',
        ['$state', '$timeout',
        function ($state, $timeout) {
            $timeout(function () {
                $state.go('login', { 'CheckUpdate': 'N' }, { reload: true });
            }, 2500);
        }]);

appControllers.controller('LoginCtl',
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
                var url = strWebSiteURL + '/update.json';
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
                                    ionicMaterialInk.displayEffect();
                                }, 0);
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
                            ionicMaterialInk.displayEffect();
                        }, 0);
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
                        ionicMaterialInk.displayEffect();
                    }, 0);
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

appControllers.controller('SettingCtl',
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
                if ($scope.Setting.WebSiteUrl.length > 0) {
                    strWebSiteURL = $scope.Setting.WebSiteUrl;
                    if (strWebSiteURL.length > 0) {
                        strWebSiteURL = "http://" + strWebSiteURL;
                    }
                } else { $scope.Setting.WebSiteUrl = strWebSiteURL }
                var data = 'BaseUrl=' + $scope.Setting.BaseUrl + '##WebServiceURL=' + $scope.Setting.WebServiceURL + '##WebSiteURL=' + strWebSiteURL;
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
                        ionicMaterialInk.displayEffect();
                    }, 0);
                    $timeout(function () {
                        alertPopup.close();
                    }, 2500);
                }, function (error) {
                    $cordovaToast.showShortBottom(error);
                });
            };
        }]);

appControllers.controller('UpdateCtl',
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
                var url = strWebSiteURL + "/FreightApp.apk";
                var blnError = false;
                $cordovaFile.checkFile(cordova.file.externalRootDirectory, "FreightApp.apk")
                .then(function (success) {
                    //
                }, function (error) {
                    blnError = true;
                });
                var targetPath = cordova.file.externalRootDirectory + "FreightApp.apk";
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

appControllers.controller('MainCtl',
        ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$timeout', 'ionicMaterialInk', 'ionicMaterialMotion', '$cordovaBarcodeScanner', 'JsonServiceClient',
        function ($scope, $http, $state, $stateParams, $ionicPopup, $timeout, ionicMaterialInk, ionicMaterialMotion, $cordovaBarcodeScanner, JsonServiceClient) {
            $scope.GoToSA = function () {
                $state.go('salesmanActivity', {}, { reload: true });
            };
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
            $scope.GoToInv = function () {
                $state.go('invoice', {}, { reload: true });
            };
            $scope.GoToBL= function () {
                $state.go('bl', {}, { reload: true });
            };
            $scope.GoToAWB = function () {
                $state.go('awb', {}, { reload: true });
            };
            // Set Motion
            //$timeout(function () {
            //    ionicMaterialMotion.slideup({
            //        selector: '.slide-up'
            //    });
            //}, 300);
            //$timeout(function () {
            //    ionicMaterialMotion.fadeSlideInRight({
            //        startVelocity: 3000
            //    });
            //}, 700);
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

appControllers.controller('SalesmanActivityCtl',
        ['$scope', '$state', '$stateParams', '$http', '$ionicPopup', '$timeout', '$ionicLoading', '$cordovaDialogs', 'ionicMaterialInk', 'ionicMaterialMotion', 'JsonServiceClient',
        function ($scope, $state, $stateParams, $http, $ionicPopup, $timeout, $ionicLoading, $cordovaDialogs, ionicMaterialInk, ionicMaterialMotion, JsonServiceClient) {
            $scope.returnMain = function () {
                $state.go('main', {}, { reload: true });
            };
            // initial echarts
            var myChart = echarts.init(document.getElementById('echartsPie'));
            var option = {
                title: {
                    text: 'Salesman',
                    subtext: 'Access Source',
                    x: 'center'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    x: 'left',
                    data: ['DA', 'EDM', 'ADs', 'VedioADs', 'SE']
                },
                toolbox: {
                    show: false,
                    feature: {
                        magicType: {
                            show: true,
                            type: ['pie', 'funnel'],
                            option: {
                                funnel: {
                                    x: '25%',
                                    width: '50%',
                                    funnelAlign: 'left',
                                    max: 1548
                                }
                            }
                        },
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                calculable: true,
                series: [
                    {
                        name: 'Access Source',
                        type: 'pie',
                        radius: '55%',
                        center: ['50%', '60%'],
                        data: [
                            { value: 335, name: 'DA' },
                            { value: 310, name: 'EDM' },
                            { value: 234, name: 'ADs' },
                            { value: 135, name: 'VedioADs' },
                            { value: 1548, name: 'SE' }
                        ]
                    }
                ]
            };
            myChart.setOption(option);
        }]);

appControllers.controller('ContactsCtl',
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

appControllers.controller('ContactsDetailCtl',
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

appControllers.controller('ContactsDetailEditCtl',
        ['$scope', '$stateParams', '$state', '$http', '$timeout', '$ionicLoading', '$ionicPopup', 'JsonServiceClient',
        function ($scope, $stateParams, $state, $http, $timeout, $ionicLoading, $ionicPopup, JsonServiceClient) {
            $scope.returnDetail = function () {
                $state.go('contactsDetail', {}, { reload: true });
            };
        }]);

appControllers.controller('PaymentApprovalCtl',
        ['$scope', '$http', '$timeout', '$state', '$ionicHistory', '$ionicPopup', 'ionicMaterialInk', 'ionicMaterialMotion',
        function ($scope, $http, $timeout, $state, $ionicHistory, $ionicPopup, ionicMaterialInk, ionicMaterialMotion) {
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
            $scope.showApproval = function () {
                var alertPopup = $ionicPopup.alert({
                    title: "Approval Success!",
                    okType: 'button-calm'
                });
                $timeout(function () {
                    ionicMaterialInk.displayEffect();
                }, 0);
                $timeout(function () {
                    alertPopup.close();
                }, 2500);
            };
            $scope.StatusCode = { text: "USE", checked: false };
            $scope.statusChange = function () {
                if ($scope.StatusCode.checked) {
                    $scope.StatusCode.text = "APP";
                } else {
                    $scope.StatusCode.text = "USE";
                }
            };
            $scope.items = [
                { id: 0, VoucherNo: 'PV15031101', Amt: '760', VendorName: 'SysMagic', Date: 'Mar 16,2015' },
                { id: 1, VoucherNo: 'PV15031533', Amt: '785', VendorName: 'SysMagic', Date: 'Mar 16,2015' },
                { id: 2, VoucherNo: 'PV15031684', Amt: '349', VendorName: 'SysMagic', Date: 'Mar 16,2015' },
                { id: 3, VoucherNo: 'PV15031244', Amt: '965', VendorName: 'SysMagic', Date: 'Mar 16,2015' },
                { id: 4, VoucherNo: 'PV15031963', Amt: '407', VendorName: 'SysMagic', Date: 'Mar 16,2015' },
                { id: 5, VoucherNo: 'PV15031148', Amt: '663', VendorName: 'SysMagic', Date: 'Mar 16,2015' },
                { id: 6, VoucherNo: 'PV15031823', Amt: '472', VendorName: 'SysMagic', Date: 'Mar 16,2015' },
                { id: 7, VoucherNo: 'PV15031473', Amt: '524', VendorName: 'SysMagic', Date: 'Mar 16,2015' },
                { id: 8, VoucherNo: 'PV15031726', Amt: '810', VendorName: 'COSCO', Date: 'Mar 15,2015' },
                { id: 9, VoucherNo: 'PV1503152', Amt: '591', VendorName: 'COSCO', Date: 'Mar 15,2015' },
                { id: 10, VoucherNo: 'PV1503129', Amt: '232', VendorName: 'COSCO', Date: 'Mar 15,2015' },
                { id: 11, VoucherNo: 'PV15031490', Amt: '574', VendorName: 'COSCO', Date: 'Mar 15,2015' },
                { id: 12, VoucherNo: 'PV15031106', Amt: '465', VendorName: 'SysFreight', Date: 'Mar 16,2015' },
                { id: 13, VoucherNo: 'PV15031374', Amt: '124', VendorName: 'SysFreight', Date: 'Mar 16,2015' },
                { id: 14, VoucherNo: 'PV15031841', Amt: '539', VendorName: 'SysFreight', Date: 'Mar 16,2015' },
                { id: 15, VoucherNo: 'PV1503115', Amt: '6', VendorName: 'SysFreight', Date: 'Mar 16,2015' }
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
            $scope.GoToDetail = function (Rcvs1) {
                $state.go('vesselScheduleDetail', { 'PortCode' : Rcvs1.PortCode }, { reload: true });
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

appControllers.controller('VesselScheduleDetailCtl',
        ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$timeout', 'ionicMaterialInk', 'ionicMaterialMotion', 'JsonServiceClient',
        function ($scope, $http, $state, $stateParams, $ionicPopup, $timeout, ionicMaterialInk, ionicMaterialMotion, JsonServiceClient) {
            $scope.Rcsv1Detail = {};
            $scope.Rcsv1Detail.POD = $stateParams.PortCode;
            $scope.returnList = function () {
                $state.go('vesselSchedule', {}, { reload: true });
            };
            $scope.Rcsv1s = [
                { PortCode: 'All', PortName: 'ALL', DepartureDate: '04/11/2015', VesselVoyage: 'A P MOLLER', Carrier: 'SysMagic SHIPPING (S) PTE LTD', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '2' },
                { PortCode: 'DEAAH', PortName: 'AACHEN', DepartureDate: '04/11/2015', VesselVoyage: 'KEE', Carrier: 'JOSINDO CONTAINER SERVICES', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '1' },
                { PortCode: 'DKAAL', PortName: 'AALBORG', DepartureDate: '04/11/2015', VesselVoyage: 'HAI XIONG', Carrier: 'HEUNG-A (SPORE) PTE LTD', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '1' },
                { PortCode: 'JPABA', PortName: 'ABASHIRI, HOKKAIDO', DepartureDate: '04/11/2015', VesselVoyage: 'SOPHIA BRITTANIA', Carrier: 'DELMAS SHIPPING (S) PTE LTD', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '0' },
                { PortCode: 'PGABW', PortName: 'ABAU', DepartureDate: '04/11/2015', VesselVoyage: 'A&B&C', Carrier: 'ADVANCE CONTAINER LINES (PTE) LTD', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '0' },
                { PortCode: 'DEABH', PortName: 'ABBEHAUSEN', DepartureDate: '04/11/2015', VesselVoyage: 'HAMMURABI', Carrier: 'SAL AGENCIES', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '1' },
                { PortCode: 'DEABF', PortName: 'ABBENFLETH', DepartureDate: '04/11/2015', VesselVoyage: 'GENIKI', Carrier: 'FOONG SUN SHIPPING & TRADING', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '1' },
                { PortCode: 'FRABB', PortName: 'ABBEVILLE', DepartureDate: '04/11/2015', VesselVoyage: 'WQSDA12313', Carrier: 'SysMagic SHIPPING (S) PTE LTD', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '7' },
                { PortCode: 'YEEAB', PortName: 'ABBSE', DepartureDate: '04/11/2015', VesselVoyage: 'H-A CARM', Carrier: 'KIE GWAN SHIPPING', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '7' },
                { PortCode: 'SAAAK', PortName: 'ABU AL KHOOSH', DepartureDate: '04/11/2015', VesselVoyage: 'J FASTER', Carrier: 'SINO EXPRESS PTE LTD', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '1' },
                { PortCode: 'AEAUH', PortName: 'ABU DHABI', DepartureDate: '04/11/2015', VesselVoyage: 'JEEWE', Carrier: 'SAMUDERA SHIPPING LINE PTE LTD', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '5' },
                { PortCode: 'FIAHV', PortName: 'AHVENANMAA MUUT', DepartureDate: '04/11/2015', VesselVoyage: 'KADIMA', Carrier: 'KADIMA PTE LTD', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '2' },
                { PortCode: 'AEAJM', PortName: 'AJMAN', DepartureDate: '04/11/2015', VesselVoyage: 'BEAUTE', Carrier: 'FAIRMACS MULTILINE', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '0' },
                { PortCode: 'GAAKE', PortName: 'AKIENI', DepartureDate: '04/11/2015', VesselVoyage: 'KINGKONG', Carrier: 'SysMagic SHIPPING (S) PTE LTD', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '8' },
                { PortCode: 'SAAHA', PortName: 'AL HADA', DepartureDate: '04/11/2015', VesselVoyage: 'WQSDA12313', Carrier: 'SysMagic SHIPPING (S) PTE LTD', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '0' },
                { PortCode: 'JMALP', PortName: 'ALLIGATOR POND', DepartureDate: '04/11/2015', VesselVoyage: 'WQSDA12313', Carrier: 'SysMagic SHIPPING (S) PTE LTD', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '0' },
                { PortCode: 'DEAMR', PortName: 'AMRUN I.', DepartureDate: '04/11/2015', VesselVoyage: 'WQSDA12313', Carrier: 'SysMagic SHIPPING (S) PTE LTD', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '5' },
                { PortCode: 'PFAAA', PortName: 'ANAAB', DepartureDate: '04/11/2015', VesselVoyage: 'WQSDA12313', Carrier: 'SysMagic SHIPPING (S) PTE LTD', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '2' },
                { PortCode: 'DZAAE', PortName: 'ANNABA (FORMERLY BONE)', DepartureDate: '04/11/2015', VesselVoyage: 'WQSDA12313', Carrier: 'SysMagic SHIPPING (S) PTE LTD', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '1' },
                { PortCode: 'DEAGE', PortName: 'WANGEROOGE', DepartureDate: '04/11/2015', VesselVoyage: 'WQSDA12313', Carrier: 'SysMagic SHIPPING (S) PTE LTD', POD: 'XMN', ArrivalDate: '06/11/2015', TransitTime: '2' }
            ];
            $timeout(function () {
                ionicMaterialInk.displayEffect();
                ionicMaterialMotion.ripple();
            }, 0);
        }]);

appControllers.controller('ShipmentStatusCtl',
        ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$timeout', 'ionicMaterialInk', 'ionicMaterialMotion', 'JsonServiceClient',
        function ($scope, $http, $state, $stateParams, $ionicPopup, $timeout, ionicMaterialInk, ionicMaterialMotion, JsonServiceClient) {
            $scope.Tracking = {};
            $scope.returnMain = function () {
                $state.go('main', {}, { reload: true });
            };
            $scope.GoToDetail = function (FilterName) {
                var FilterValue = '';
                if (FilterName === 'ContainerNo') { FilterValue = $scope.Tracking.ContainerNo }
                else if (FilterName === 'JobNo') { FilterValue = $scope.Tracking.JobNo }
                else if (FilterName === 'BLNo') { FilterValue = $scope.Tracking.BLNo }
                else if (FilterName === 'AWBNo') { FilterValue = $scope.Tracking.AWBNo }
                else if (FilterName === 'OrderNo') { FilterValue = $scope.Tracking.OrderNo }
                else if (FilterName === 'ReferenceNo') { FilterValue = $scope.Tracking.ReferenceNo }
                $state.go('shipmentStatusDetail', { 'FilterName': FilterName, 'FilterValue': FilterValue }, { reload: true });
            };
            $timeout(function () {
                ionicMaterialInk.displayEffect();
                ionicMaterialMotion.blinds();
            }, 0);
        }]);

appControllers.controller('ShipmentStatusDetailCtl',
        ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$timeout', 'ionicMaterialInk', 'ionicMaterialMotion', 'JsonServiceClient',
        function ($scope, $http, $state, $stateParams, $ionicPopup, $timeout, ionicMaterialInk, ionicMaterialMotion, JsonServiceClient) {
            $scope.Detail = {};
            $scope.Detail.FilterName = $stateParams.FilterName;
            $scope.Detail.FilterValue = $stateParams.FilterValue;
            $scope.returnList = function () {
                $state.go('shipmentStatus', {}, { reload: true });
            };
            $scope.items= [
                { JobNo: 'SESIN0905182-00', BLNo: 'SESIN0905182-00', RefNo: 'RN0907033', ETD: '04/11/2015', ETA: '07/11/2015', Origin: 'XMN', Destination: 'SIN', Vessel: 'S A ORANJE 123', Pcs: '100', Weight: '1000', Volume: '1000', Status: 'USE' },
                { JobNo: 'SESIN1511137-02', BLNo: 'SESIN1511137-02', RefNo: 'RN1511051', ETD: '04/11/2015', ETA: '07/11/2015', Origin: 'SIN', Destination: 'XMN', Vessel: 'KADIMA', Pcs: '500', Weight: '50,000', Volume: '50,000', Status: 'USE' }
            ];
            $timeout(function () {
                ionicMaterialInk.displayEffect();
                ionicMaterialMotion.ripple();
            }, 0);
        }]);

appControllers.controller('InvoiceCtl',
        ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$ionicLoading', '$timeout', '$cordovaFile', '$cordovaFileTransfer', '$cordovaFileOpener2', 'ionicMaterialInk', 'ionicMaterialMotion', 'JsonServiceClient',
        function ($scope, $http, $state, $stateParams, $ionicPopup, $ionicLoading, $timeout, $cordovaFile, $cordovaFileTransfer, $cordovaFileOpener2, ionicMaterialInk, ionicMaterialMotion, JsonServiceClient) {
            $scope.returnMain = function () {
                $state.go('main', {}, { reload: true });
            };
            $scope.items = [
                { InvoiceNo: 'SESIN0905182-00', InvoiceDate: '04/11/2015', CustomerName: 'S A ORANJE 123', Amt: '100' },
                { InvoiceNo: 'SESIN1511137-02', InvoiceDate: '04/11/2015', CustomerName: 'KADIMA', Amt: '500' }
            ];
            $scope.download = function () {
                $ionicLoading.show({
                    template: "Download  0%"
                });
                var url = strWebServiceURL + "/mobileapp/INVOICE.pdf";
                var blnError = false;
                if (window.cordova) {
                    $cordovaFile.checkFile(cordova.file.externalRootDirectory, "INVOICE.pdf")
                    .then(function (success) {
                        //
                    }, function (error) {
                        blnError = true;
                    });
                    var targetPath = cordova.file.externalRootDirectory + "INVOICE.pdf";
                    var trustHosts = true;
                    var options = {};
                    if (!blnError) {
                        $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
                            $ionicLoading.hide();
                            $cordovaFileOpener2.open(targetPath, 'application/pdf'
                            ).then(function () {
                                // success
                            }, function (err) {
                                // error
                            });
                        }, function (err) {
                            $cordovaToast.showShortCenter('Download faild.');
                            $ionicLoading.hide();
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
                        $cordovaToast.showShortCenter('Download PDF file faild.');
                    }
                } else {
                    $ionicLoading.hide();
                    window.open(url);               
                }                
            };
            $timeout(function () {
                ionicMaterialInk.displayEffect();
                ionicMaterialMotion.ripple();
            }, 0);
        }]);

appControllers.controller('BlCtl',
        ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$ionicLoading', '$timeout', '$cordovaFile', '$cordovaFileTransfer', '$cordovaFileOpener2', 'ionicMaterialInk', 'ionicMaterialMotion', 'JsonServiceClient',
        function ($scope, $http, $state, $stateParams, $ionicPopup, $ionicLoading, $timeout, $cordovaFile, $cordovaFileTransfer, $cordovaFileOpener2, ionicMaterialInk, ionicMaterialMotion, JsonServiceClient) {
            $scope.returnMain = function () {
                $state.go('main', {}, { reload: true });
            };
            $scope.items = [
                { InvoiceNo: 'SESIN0905182-00', InvoiceDate: '04/11/2015', CustomerName: 'S A ORANJE 123', Amt: '100' },
                { InvoiceNo: 'SESIN1511137-02', InvoiceDate: '04/11/2015', CustomerName: 'KADIMA', Amt: '500' }
            ];
            $scope.download = function () {
                $ionicLoading.show({
                    template: "Download  0%"
                });
                var url = strWebServiceURL + "/mobileapp/INVOICE.pdf";
                var blnError = false;
                if (window.cordova) {
                    $cordovaFile.checkFile(cordova.file.externalRootDirectory, "INVOICE.pdf")
                    .then(function (success) {
                        //
                    }, function (error) {
                        blnError = true;
                    });
                    var targetPath = cordova.file.externalRootDirectory + "INVOICE.pdf";
                    var trustHosts = true;
                    var options = {};
                    if (!blnError) {
                        $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
                            $ionicLoading.hide();
                            $cordovaFileOpener2.open(targetPath, 'application/pdf'
                            ).then(function () {
                                // success
                            }, function (err) {
                                // error
                            });
                        }, function (err) {
                            $cordovaToast.showShortCenter('Download faild.');
                            $ionicLoading.hide();
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
                        $cordovaToast.showShortCenter('Download PDF file faild.');
                    }
                } else {
                    $ionicLoading.hide();
                    window.open(url);
                }
            };
            $timeout(function () {
                ionicMaterialInk.displayEffect();
                ionicMaterialMotion.ripple();
            }, 0);
        }]);

appControllers.controller('AwbCtl',
        ['$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$ionicLoading', '$timeout', '$cordovaFile', '$cordovaFileTransfer', '$cordovaFileOpener2', 'ionicMaterialInk', 'ionicMaterialMotion', 'JsonServiceClient',
        function ($scope, $http, $state, $stateParams, $ionicPopup, $ionicLoading, $timeout, $cordovaFile, $cordovaFileTransfer, $cordovaFileOpener2, ionicMaterialInk, ionicMaterialMotion, JsonServiceClient) {
            $scope.returnMain = function () {
                $state.go('main', {}, { reload: true });
            };
            $scope.items = [
                { InvoiceNo: 'SESIN0905182-00', InvoiceDate: '04/11/2015', CustomerName: 'S A ORANJE 123', Amt: '100' },
                { InvoiceNo: 'SESIN1511137-02', InvoiceDate: '04/11/2015', CustomerName: 'KADIMA', Amt: '500' }
            ];
            $scope.download = function () {
                $ionicLoading.show({
                    template: "Download  0%"
                });
                var url = strWebServiceURL + "/mobileapp/INVOICE.pdf";
                var blnError = false;
                if (window.cordova) {
                    $cordovaFile.checkFile(cordova.file.externalRootDirectory, "INVOICE.pdf")
                    .then(function (success) {
                        //
                    }, function (error) {
                        blnError = true;
                    });
                    var targetPath = cordova.file.externalRootDirectory + "INVOICE.pdf";
                    var trustHosts = true;
                    var options = {};
                    if (!blnError) {
                        $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
                            $ionicLoading.hide();
                            $cordovaFileOpener2.open(targetPath, 'application/pdf'
                            ).then(function () {
                                // success
                            }, function (err) {
                                // error
                            });
                        }, function (err) {
                            $cordovaToast.showShortCenter('Download faild.');
                            $ionicLoading.hide();
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
                        $cordovaToast.showShortCenter('Download PDF file faild.');
                    }
                } else {
                    $ionicLoading.hide();
                    window.open(url);
                }
            };
            $timeout(function () {
                ionicMaterialInk.displayEffect();
                ionicMaterialMotion.ripple();
            }, 0);
        }]);