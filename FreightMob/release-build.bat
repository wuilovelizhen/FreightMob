@echo on

call cordova prepare

call cordova compile --release android

pause 