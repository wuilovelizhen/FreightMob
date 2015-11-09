var app = angular.module('MobileAPP', [
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
    'MobileAPP.services',
    'MobileAPP.controllers'
])

app.run(['$ionicPlatform', '$rootScope', '$state', '$location', '$timeout', '$ionicPopup', '$ionicHistory', '$ionicLoading', '$cordovaToast', '$cordovaFile',
    function ($ionicPlatform, $rootScope, $state, $location, $timeout, $ionicPopup, $ionicHistory, $ionicLoading, $cordovaToast, $cordovaFile) {

        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                //
                var data = 'BaseUrl=' + strBaseUrl + '##WebServiceURL=' + strWebServiceURL + '##WebSiteURL=' + strWebSiteURL;
                var path = cordova.file.externalRootDirectory;
                var directory = "FreightApp";
                var file = directory + "/Config.txt";
                $cordovaFile.createDir(path, directory, false)
                    .then(function (success) {
                        $cordovaFile.writeFile(path, file, data, true)
                            .then(function (success) {
                                //
                                if (strBaseUrl.length > 0) {
                                    strBaseUrl = "/" + strBaseUrl;
                                }
                                if (strWebServiceURL.length > 0) {
                                    strWebServiceURL = "http://" + strWebServiceURL;
                                }
                                if (strWebSiteURL.length > 0) {
                                    strWebSiteURL = "http://" + strWebSiteURL;
                                }
                            }, function (error) {
                                $cordovaToast.showShortBottom(error);
                            });
                    }, function (error) {
                        // If an existing directory exists
                        $cordovaFile.checkFile(path, file)
                            .then(function (success) {
                                $cordovaFile.readAsText(path, file)
                                    .then(function (success) {
                                        var arConf = success.split("##");
                                        var arBaseUrl = arConf[0].split("=");
                                        if (arBaseUrl[1].length > 0) {
                                            strBaseUrl = arBaseUrl[1];
                                        }
                                        var arWebServiceURL = arConf[1].split("=");
                                        if (arWebServiceURL[1].length > 0) {
                                            strWebServiceURL = arWebServiceURL[1];
                                        }
                                        var arWebSiteURL = arConf[2].split("=");
                                        if (arWebSiteURL[1].length > 0) {
                                            strWebSiteURL = arWebSiteURL[1];
                                        }
                                        //
                                        if (strBaseUrl.length > 0) {
                                            strBaseUrl = "/" + strBaseUrl;
                                        }
                                        if (strWebServiceURL.length > 0) {
                                            strWebServiceURL = "http://" + strWebServiceURL;
                                        }
                                        if (strWebSiteURL.length > 0) {
                                            strWebSiteURL = "http://" + strWebSiteURL;
                                        }
                                    }, function (error) {
                                        $cordovaToast.showShortBottom(error);
                                    });
                            }, function (error) {
                                // If file not exists
                                $cordovaFile.writeFile(path, file, data, true)
                                    .then(function (success) {
                                        //
                                        if (strBaseUrl.length > 0) {
                                            strBaseUrl = "/" + strBaseUrl;
                                        }
                                        if (strWebServiceURL.length > 0) {
                                            strWebServiceURL = "http://" + strWebServiceURL;
                                        }
                                        if (strWebSiteURL.length > 0) {
                                            strWebSiteURL = "http://" + strWebSiteURL;
                                        }
                                    }, function (error) {
                                        $cordovaToast.showShortBottom(error);
                                    });
                            });
                    });
            } else {
                if (strBaseUrl.length > 0) {
                    strBaseUrl = "/" + strBaseUrl;
                }
                if (strWebServiceURL.length > 0) {
                    strWebServiceURL = "http://" + strWebServiceURL;
                }
                if (strWebSiteURL.length > 0) {
                    strWebSiteURL = "http://" + strWebSiteURL;
                }
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });

        $ionicPlatform.registerBackButtonAction(function (e) {
            e.preventDefault();
            // Is there a page to go back to?  $state.include ??
            if ($state.includes('main') || $state.includes('login') || $state.includes('loading')) {
                if ($rootScope.backButtonPressedOnceToExit) {
                    ionic.Platform.exitApp();
                } else {
                    $rootScope.backButtonPressedOnceToExit = true;
                    $cordovaToast.showShortBottom('Press again to exit.');
                    setTimeout(function () {
                        $rootScope.backButtonPressedOnceToExit = false;
                    }, 2000);
                }
            } else if ($state.includes('setting')) {
                $state.go('login', { 'CheckUpdate': 'Y' }, { reload: true });
            } else if ($state.includes('update')) {
                $state.go('login', { 'CheckUpdate': 'N' }, { reload: true });
            } else if ($state.includes('contacts' || $state.includes('paymentApproval') || $state.includes('vesselSchedule') || $state.includes('shipmentStatus') || $state.includes('invoice') || $state.includes('bl') || $state.includes('awb'))) {
                $state.go('main', { }, { });
            } else if ($ionicHistory.backView()) {
                $ionicHistory.goBack();
            } else {
                // This is the last page: Show confirmation popup
                $rootScope.backButtonPressedOnceToExit = true;
                $cordovaToast.showShortBottom('Press again to exit.');
                setTimeout(function () {
                    $rootScope.backButtonPressedOnceToExit = false;
                }, 2000);
            }
            return false;
        }, 101);
    }]);

app.config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider',
    function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $ionicConfigProvider.backButton.previousTitleText(false);
        $stateProvider
            .state('loading', {
                url: '/loading',
                cache: 'false',
                templateUrl: 'view/loading.html',
                controller: 'LoadingCtl'
            })
            .state('login', {
                url: '/login/:CheckUpdate',
                cache: 'false',
                templateUrl: 'view/login.html',
                controller: 'LoginCtl'
            })
            .state('setting', {
                url: '/setting',
                cache: 'false',
                templateUrl: 'view/setting.html',
                controller: 'SettingCtl'
            })
            .state('update', {
                url: '/update/:Version',
                cache: 'false',
                templateUrl: 'view/update.html',
                controller: 'UpdateCtl'
            })
            .state('main', {
                url: "/main",
                templateUrl: "view/main.html",
                controller: 'MainCtl'
            })
            .state('salesmanActivity', {
                url: '/salesmanActivity',
                templateUrl: 'view/crm/SalesmanActivity.html',
                controller: 'SalesmanActivityCtl'
            })
            .state('contacts', {
                url: '/contacts',
                templateUrl: 'view/crm/Contacts.html',
                controller: 'ContactsCtl'
            })
            .state('contactsDetail', {
                url: '/contacts/detail/:TrxNo',
                templateUrl: 'view/crm/Contacts-detail.html',
                controller: 'ContactsDetailCtl'
            })
            .state('contactsDetailEdit', {
                url: '/contacts/detail/Edit/:TrxNo',
                templateUrl: 'view/crm/Contacts-detail-Edit.html',
                controller: 'ContactsDetailEditCtl'
            })
            .state('paymentApproval', {
                url: '/paymentApproval',
                cache: 'false',
                templateUrl: 'view/productivity/PaymentApproval.html',
                controller: 'PaymentApprovalCtl'
            })
            .state('vesselSchedule', {
                url: '/vesselSchedule',
                cache: 'false',
                templateUrl: 'view/tracking/VesselSchedule.html',
                controller: 'VesselScheduleCtl'
            })
            .state('vesselScheduleDetail', {
                url: '/vesselSchedule/detail/:PortCode',
                cache: 'false',
                templateUrl: 'view/tracking/VesselSchedule-detail.html',
                controller: 'VesselScheduleDetailCtl'
            })
            .state('shipmentStatus', {
                url: '/shipmentStatus',
                cache: 'false',
                templateUrl: 'view/tracking/ShipmentStatus.html',
                controller: 'ShipmentStatusCtl'
            })
            .state('shipmentStatusDetail', {
                url: '/shipmentStatus/detail/:FilterName/:FilterValue',
                cache: 'false',
                templateUrl: 'view/tracking/ShipmentStatus-detail.html',
                controller: 'ShipmentStatusDetailCtl'
            })
            .state('invoice', {
                url: '/invoice',
                cache: 'false',
                templateUrl: 'view/tracking/Invoice.html',
                controller: 'InvoiceCtl'
            })
            .state('bl', {
                url: '/bl',
                cache: 'false',
                templateUrl: 'view/tracking/BL.html',
                controller: 'BlCtl'
            })
            .state('awb', {
                url: '/awb',
                cache: 'false',
                templateUrl: 'view/tracking/AWB.html',
                controller: 'AwbCtl'
            })
            .state('memo', {
                url: '/Memo',
                cache: 'false',
                templateUrl: 'view/productivity/Memo.html',
                controller: 'MemoCtl'
            })
            .state('reminder', {
                url: '/Reminder',
                cache: 'false',
                templateUrl: 'view/productivity/Reminder.html',
                controller: 'ReminderCtl'
            });
        $urlRouterProvider.otherwise('/login/N');
    }]);

app.constant('$ionicLoadingConfig', {
    template: '<div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div>'
});

app.constant('ApiEndpoint', {
    url: strWebServiceURL + "/" + strBaseUrl
});