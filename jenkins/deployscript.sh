npm install
sudo rm /usr/bin/catcli
sudo ln -s $WORKSPACE/$BUILD_NUMBER/cat/catcli /usr/bin/catcli

####### install projects
#cd test/sencha/cat-project
#sudo catcli${BUILD_NUMBER}  -isj
cd $WORKSPACE/$BUILD_NUMBER/cat/test
sudo grunt default

############ Run Sencha ######################################################
echo running sencha ------------------------------------------------------
cd $WORKSPACE/$BUILD_NUMBER/cat/test/sencha/cat-project

sudo pkill node
echo running mobile tests ------------------------------------------------
sudo catcli --task server.start & 
sleep 5
adb install -r phonegap.apk
adb shell am start -e IP 192.168.1.116 -e PORT 8089 -n com.hp.aamobile.cat/.example

# sudo catcli${BUILD_NUMBER}  --task mtest &
sleep 10
sudo pkill node

echo runnung sencha phantom tests -----------------------------------------------
sudo catcli  --task test

############ Run Enyo ######################################################
echo running enyo ------------------------------------------------------
cd $WORKSPACE/$BUILD_NUMBER/cat/test/enyo/cat-project

sudo pkill node
echo running mobile tests ------------------------------------------------
sudo catcli --task server.start & 
sleep 5
adb install -r phonegap.apk
adb shell am start -e IP 192.168.1.116 -e PORT 8087 -n com.hp.aamobile.cat/.example

# sudo catcli${BUILD_NUMBER}  --task mtest &
sleep 10
sudo pkill node

echo runnung enyo phantom tests -----------------------------------------------
sudo catcli  --task test

#catcli${BUILD_NUMBER}  --task mobile.install 
#catcli${BUILD_NUMBER}  --task mobile.test 
 
