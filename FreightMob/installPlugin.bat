@echo on
call npm install
call npm install -g bower
call cordova platform add android

call cordova plugin add cordova-plugin-crosswalk-webview
call cordova plugin add cordova-pugin-device
call cordova plugin add cordova-plugin-file
call cordova plugin add cordova-plugin-file-transfer
call cordova plugin add cordova-plugin-whitelist
call cordova plugin add cordova-plugin-vibration
call cordova plugin add cordova-plugin-splashscreen
call cordova plugin add cordova-plugin-dialogs
call cordova plugin add cordova-plugin-statusbar
call cordova plugin add cordova-plugin-console
call cordova plugin add cordova-plugin-camera
call cordova plugin add cordova-plugin-datepicker
call cordova plugin add cordova-plugin-contacts
call cordova plugin add cordova-plugin-network-information
call cordova plugin add cordova-plugin-media
call cordova plugin add cordova-plugin-geolocation
call cordova plugin add cordova-plugin-globalization
call cordova plugin add cordova-plugin-battery-status
call cordova plugin add cordova-plugin-media-capture
call cordova plugin add cordova-plugin-barcode-scanner2

call cordova plugin add com.ionic.keyboard
call cordova plugin add io.github.pwlin.cordova.plugins.fileopener
call cordova plugin add nl.x-services.plugins.toast
call cordova plugin add uk.co.whiteoctober.cordova.appversion

pause