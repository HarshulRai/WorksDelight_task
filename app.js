const express = require('express')
const multer = require('multer')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const infs = new ffmpeg

const helmet = require("helmet");
const fs = require('fs');
const morgan = require('morgan');
const mongoose = require('mongoose')

const app = express()


app.use(cors())
app.use(bodyParser.json())

const upload = multer({
    storage:multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,"uploads")
        },
        filename:function(req,file,cb){
            cb(null,file.fieldname+".mp4")
        }
    })
}).single("user_file")

app.post("/upload",upload,(req,res)=>{
    res.send("file upload")
})


infs.addInput('/uploads/user_file.mp4').outputOptions([
    '-map 0:0',
    '-map 0:1',
    '-map 0:0',
    '-map 0:1',
    '-s:v:0 2160x3840',
    '-c:v:0 libx264',
    '-b:v:0 2000k',
    '-s:v:1 960x540',
    '-c:v:1 libx264',
    '-b:v:1 365k',
    // '-var_stream_map', '"v:0,a:0 v:1,a:1"',
    '-master_pl_name master.m3u8',
    '-f hls',
    '-max_muxing_queue_size 1024',
    '-hls_time 1',
    '-hls_list_size 0',
    '-hls_segment_filename', 'v%v/fileSequence%d.ts'
]).output('./video.m3u8')
.on('start', function (commandLine) {
    console.log('Spawned Ffmpeg with command: ' + commandLine);
})
.on('error', function (err, stdout, stderr) {
    console.log('An error occurred: ' + err.message, err, stderr);
})
.on('progress', function (progress) {
    console.log('Processing: ' + progress.percent + '% done')
})
.on('end', function (err, stdout, stderr) {
    console.log('Finished processing!' /*, err, stdout, stderr*/)
})
.run()


mongoose.connect('mongodb://localhost:27017/projectDB')
.then(()=>{
    app.listen(3000 , (req,res)=>{
        console.log('running')
    })
})

