let electron = require('electron');
let ipc = electron.ipcRenderer;

const { dialog } = require('electron').remote;
require('angular');

angular
.module("mYTD", [])
.controller('mainController', function ($scope,$timeout) {
    $scope.urlInput = "";
    $scope.metadata = null;
    $scope.isLoading = false;


    $scope.downloadClicked = function(){
        $scope.isLoading = true;
        ipc.send('video:getMetadata',$scope.urlInput)
    }

    $scope.downloadVideoClicked = function(){
        console.log(dialog)
        let savePath = dialog.showSaveDialog();
        ipc.send("video:download",{url:$scope.urlInput,path:savePath});
    }

    ipc.on("video:metadata",function(event,data){
        $timeout(function(){
            console.log(data)
            $scope.metadata = data;
            $scope.isLoading = false;
        })
    });

    ipc.on("video:downloadComplete",function(event,msg){
        console.log("Download Complete")
    })

 

})