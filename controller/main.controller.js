module.exports = (function () {
    return function ($scope, downloadService, databaseService, $timeout) {
        let { dialog } = require('electron').remote;
        let remote = require('electron').remote;
        let ytdl = require('ytdl-core')
        
        $scope.urlInput = "https://www.youtube.com/watch?v=E3x_dLVTEuA";
        $scope.metadata = null;
        $scope.isLoading = false;
        $scope.downloadProgress = 0;
        $scope.downloadStarted = false;


        function processMetadata(data){




            



            let obj = {};
            obj.title = data.title;
            obj.formats = data.formats;
            // console.log(data);
            let vd = {};
            obj.videos = ytdl.filterFormats(data.formats, 'videoonly')
            obj.audio = ytdl.filterFormats(data.formats, 'audioonly')
            obj.audiovideo = ytdl.filterFormats(data.formats, 'audioandvideo')
            vd.author = data.player_response.videoDetails.author;
            vd.views = data.player_response.videoDetails.viewCount;
            vd.length = data.player_response.videoDetails.lengthSeconds;
            vd.thubms = data.player_response.videoDetails.thumbnail.thumbnails;
            obj.vd = vd;
            console.log(obj)
            return obj;
        }

        $scope.downloadClicked = function () {
            databaseService.saveData()
            $scope.isLoading = true;
            downloadService.getInfo($scope.urlInput).then(function (data) {
                $scope.metadata = data;
                // $scope.metadata = processMetadata(data);
                $scope.isLoading = false;
            }).catch(function (err) {
                console.log(err);
                alert("No Video Found");
                $scope.isLoading = false;
            })
        }

        $scope.downloadVideoClicked = function () {
            let savePath = dialog.showSaveDialog({ title: "Milan's Downloader", defaultPath: $scope.metadata.title + ".mp4", filters: [{ name: "mp4", extensions: ['mp4'] }] });
            let url = $scope.urlInput;
            downloadService.downloadVideo({ info:$scope.metadata, savePath },{}, {
                started: function () {
                    $scope.downloadStarted = true;
                    $scope.$digest();
                },
                progress: function (data) {
                    $scope.info = data;
                    $scope.$digest();
                },
                finished: function (data) {
                    $scope.downloadFinished = true;
                    $scope.$digest();
                }
            });
        }


        $scope.closeWindow = function(){

            remote.getCurrentWindow().close();
        }
        $scope.minimizeWindow = function(){
            remote.getCurrentWindow().minimize();
        }
    }
})();