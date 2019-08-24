module.exports = (function () {
    return function ($q) {
        let ytdl = require('ytdl-core');
        let fs = require('fs');
        const path = require('path');
        const readline = require('readline');
        const ffmpeg = require('fluent-ffmpeg');
        ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);



        downloadService = {};
        downloadService.getInfo = function (url) {
            console.log(url);
            let p = $q.defer();
            ytdl.getInfo(url, (err, info) => {
                if (err) p.reject(err);
                p.resolve(info);
            });
            return p.promise;
        }

        downloadService.downloadVideo = function ({info,savePath}, options, progressEvents) {
            const video = ytdl.downloadFromInfo(info);
            let starttime;
            video.pipe(fs.createWriteStream(savePath));
            video.once('response', () => {
                starttime = Date.now();
                progressEvents.started();
            });
            video.on('progress', (chunkLength, downloaded, total) => {
                progressEvents.progress(calculateData(downloaded, total,starttime));
            });
            video.on('end', () => {
                progressEvents.finished();
            });
        }

        function calculateData(downloaded, total,starttime) {
            const percent = downloaded / total;
            const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
            let percentage = (percent * 100).toFixed(2);
            let sizeRemain = (downloaded / 1024 / 1024).toFixed(2);
            let sizeTotal = (total / 1024 / 1024).toFixed(2);
            let timeLeft = (downloadedMinutes / percent - downloadedMinutes).toFixed(2);
            let timeElapsed = downloadedMinutes.toFixed(2);
            return ({ timeLeft, timeElapsed, sizeRemain, sizeTotal, percentage });
        }

       
        downloadService.bothDownload = function({url,savePath},progressEvents){
            const audioOutput = savePath+"a";
            const mainOutput = savePath;

            ytdl(url, {
                filter: format => format.container === 'm4a' && !format.encoding
              }).on('error', console.error)
                .on('progress', (chunkLength, downloaded, total) => {
                  console.log("hello progress")
                  const percent = downloaded / total;
                  readline.cursorTo(process.stdout, 0);
                  process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
                  process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)`);
                })
              
                // Write audio to file since ffmpeg supports only one input stream.
                .pipe(fs.createWriteStream(audioOutput))
                .on('finish', () => {
                  console.log('\ndownloading video');
                  ffmpeg()
                    .input(ytdl(url, { filter: format => {
                      return format.container === 'mp4' && !format.audioEncoding; } }))
                    .videoCodec('copy')
                    .input(audioOutput)
                    .audioCodec('copy')
                    .save(mainOutput)
                    .on('error', console.error)
                    .on('progress', progress => {
                      console.log("hello video Progress")
                      readline.cursorTo(process.stdout, 0);
                      readline.clearLine(process.stdout, 1);
                      process.stdout.write(progress.timemark);
                    }).on('end', () => {
                      fs.unlink(audioOutput, err => {
                        if(err) console.error(err);
                        else console.log('\nfinished downloading');
                      });
                    });
                });


        }
        

        return downloadService;
    }
})();