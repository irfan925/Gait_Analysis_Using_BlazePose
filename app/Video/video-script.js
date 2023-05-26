//Global Variables
const canvas =  document.getElementById("pose-canvas");
const ctx = canvas.getContext("2d");
const curve = document.getElementById("curve");
const ctx_curve = curve.getContext("2d");
const video = document.getElementById("pose-video");
const pose = new Pose({locateFile: (file) => {
    //return `../assets/blaze/${file}`;
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});

var min = 0, sec = 0;
var param = [];

const config ={
    video:{ width: 960, height: 540, fps: 30}
};

function timer()
{
    // Timer Function, Starts when distance button is in detect mode
    // Gets cleared when distance button is in pause mode

    //let sec=0,min=0;

    var time = setInterval(function(){
        
    	document.getElementById('time').innerHTML=min+":"+sec;
        sec++;

        if(sec == 60)
        {
            sec=0;
            min++;
        }
        
    }, 1000);
}


function distance(x1,y1,x2,y2){

    // calculate eucliedean distance between point(x1,y1) and (x2,y2)

    let a = x2-x1;
    let b = y2-y1;
    let result = Math.sqrt( a*a + b*b);

    return result;
}

function download_csv(){
    //define the heading for each row of the data
    var csv = 'time(in ms), time(in s), hsL, toL, hsR, toR, hipL.x, hipL.y, kneeL.x, kneeL.y, ankleL.x, ankleL.y, hipR.x, hipR.y, kneeR.x, kneeR.y, ankleR.x, ankleR.y, rk_ang, lk_ang, ra_ang, la_ang, hipR_ang, hipL_ang\n';
    
    //merge the data with CSV
    param.forEach(function(row) {
            csv += row.join(',');
            csv += "\n";
    });
 

   
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    
    //provide the name for the CSV file to be downloaded
    hiddenElement.download = 'Gait_data_p5s3.csv';
    hiddenElement.click();
}



async function main()
{
    // Main function
    // Initialize required variables, load model, etc.

    const download = document.getElementById("dow");

   
    download.onclick = function(){
        download_csv()
    }



    pose.setOptions({
        staticImageMode: false,
        upperBodyOnly: false,
        smoothLandmarks: true,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    pose.onResults(onResults);
    video.src = "video/p2s1/c3_0130.mp4";
    
    //video.src ="http://192.168.43.82:4747/"       //  IP web cam

    ///video.playbackRate = 0.2;                // video File
    video.width = config.video.width;
    video.height= config.video.height;

    canvas.width = config.video.width;
    canvas.height = config.video.height;
    //for graph
    curve.width = config.video.width;
    curve.height = config.video.height;

    console.log("Canvas initialized");

    video.onloadedmetadata = function(e) {
        video.play();
    };

    //time duration calculation of the video
    var i = setInterval(function() {
        if(video.readyState > 0) {
            var seconds = video.duration % 60;
            dur = video.duration
            // (Put the minutes and seconds in the display)
            //console.log(dur)
            console.log(seconds)
    
            clearInterval(i);
        }
    }, 200);

    video.addEventListener("play",computeFrame); 
}



function calculateAngle(x1,y1,x2,y2,x3,y3){
    //  Formula:   a^2 + b^2 - 2abCos(C) = c^2

    let a_sq = ((x2-x1)*(x2-x1)) + ((y2-y1)*(y2-y1));
    let b_sq = ((x3-x2)*(x3-x2)) + ((y3-y2)*(y3-y2));
    let c_sq = ((x3-x1)*(x3-x1)) + ((y3-y1)*(y3-y1));

    let value= (a_sq + b_sq - c_sq)/(2* Math.sqrt(a_sq)* Math.sqrt(b_sq) )
    let angle_rad = Math.acos(value)
    let angle = angle_rad *(180.0 / Math.PI)

    return angle 
}


function onResults(results)
{
    // draw image frame,skeleton points
    // calculate right & left step length,stride length, joint angles and display it

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    fps_start_time = performance.now();
    //console.log(results)
    
    ////console.log(new Date().getTime());


    if(results.poseLandmarks)
    {

        results_cpy=results;
        ////console.log(results.poseLandmarks)
        let eyeL = results.poseLandmarks[2]
        let eyeR = results.poseLandmarks[5]
        let shoulderL = results.poseLandmarks[11]
        let shoulderR = results.poseLandmarks[12]
        let hipL = results.poseLandmarks[23]
        let hipR = results.poseLandmarks[24]
        let kneeL = results.poseLandmarks[25]
        let kneeR = results.poseLandmarks[26]
        let ankleL = results.poseLandmarks[27]
        let ankleR = results.poseLandmarks[28]
        let heelL = results.poseLandmarks[29]
        let heelR = results.poseLandmarks[30]
        let foot_indexR = results.poseLandmarks[32];
        let foot_indexL = results.poseLandmarks[31];

        //Heel strike
        //console.log("heelL.y"+heelL.y*video.height)
        //console.log("heelR.y"+heelR.y*video.height)
        //let sacrum = (heelL.x + heelR.x)/2
        //let hs = heelL.x - sacrum;

        //let to = foot_indexL.x - sacrum;
        //Heel strike and toe off
        let hsL = heelL.x - hipL.x;
        let toL = foot_indexL.x - hipL.x;
        let hsR = heelR.x - hipR.x;
        let toR = foot_indexR.x - hipR.x;

        //console.log(heelL.y*video.height)

        //Storing values in csv
        var tm = new Date();
        var data = [];
         data.push(tm.getMilliseconds());
         data.push(tm.getSeconds());
         data.push(hsL*video.width);
         data.push(toL*video.width);
         data.push(hsR*video.width);
         data.push(toR*video.width);

         //Storing values in csv for Bezier curves
         data.push(hipL.x*video.width)
         data.push(hipL.y*video.height)
         data.push(kneeL.x*video.width)
         data.push(kneeL.y*video.height)
         data.push(ankleL.x*video.width)
         data.push(ankleL.y*video.height)
         //data.push(heelL.y*video.height)

         data.push(hipR.x*video.width)
         data.push(hipR.y*video.height)
         data.push(kneeR.x*video.width)
         data.push(kneeR.y*video.height)
         data.push(ankleR.x*video.width)
         data.push(ankleR.y*video.height)
         //data.push(heelL.y*video.height)
               
        //console.log(hipL.x*video.width)
        //for bezier curve
        ctx_curve.beginPath();
        ctx_curve.moveTo(hipL.x*video.width, hipL.y*video.height );
        ctx_curve.quadraticCurveTo(kneeL.x*video.width, kneeL.y*video.height, ankleL.x*video.width, ankleL.y*video.height);
        ctx_curve.stroke();
        
        //Right Knee Angle  & Left Knee Angle 
        let rk_val = (180 - calculateAngle(hipR.x, hipR.y, kneeR.x, kneeR.y, ankleR.x, ankleR.y)).toFixed(2)
        let lk_val = (180 - calculateAngle(hipL.x, hipL.y, kneeL.x, kneeL.y, ankleL.x, ankleL.y)).toFixed(2)
        document.getElementById("k-angle-R").innerHTML = rk_val;
        document.getElementById("k-angle-L").innerHTML = lk_val;

        // Right Ankle Angle &  Left Ankle Angle  //ra_val - 90 should be there
        let ra_val = (calculateAngle(kneeR.x, kneeR.y, ankleR.x, ankleR.y,foot_indexR.x, foot_indexR.y - 90)).toFixed(2);
        let la_val = (calculateAngle(kneeL.x, kneeL.y, ankleL.x, ankleL.y,foot_indexL.x, foot_indexL.y - 90)).toFixed(2);
        document.getElementById("ank-angle-R").innerHTML = ra_val;
        document.getElementById("ank-angle-L").innerHTML = la_val;

        // Hip Angle
        let hipR_val = (180 - calculateAngle(shoulderR.x, shoulderR.y, hipR.x, hipR.y, kneeR.x, kneeR.y)).toFixed(2)
        let hipL_val = (180 - calculateAngle(shoulderL.x, shoulderL.y, hipL.x, hipL.y, kneeL.x, kneeL.y)).toFixed(2)
        document.getElementById("hip-angle-R").innerHTML = hipR_val;
        document.getElementById("hip-angle-L").innerHTML = hipL_val;

        data.push(rk_val);
        data.push(lk_val);
        data.push(ra_val);
        data.push(la_val);
        data.push(hipR_val);
        data.push(hipL_val);

        param.push(data);     //To store whole row in the param array.
    }
    
    time_diff = performance.now() - fps_start_time
            
    if(time_diff ==0)
        fps =0
    else
        fps = 1/ time_diff
                
    fps_text = "FPS:"+(fps).toFixed(2)
    ctx.font = "20px Comic Sans MS";
    ctx.fillStyle = "red";
    ctx.fillText(fps_text, 10, 40);

    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS,{color: '#00FF00', lineWidth: 4});
    drawLandmarks(ctx, results.poseLandmarks,{color: '#FF0000', lineWidth: 1});

}

async function computeFrame()
{
    
    await pose.send({image: video});
    //requestAnimationFrame(computeFrame);
    setTimeout(computeFrame, 1000 / 10);
}

document.addEventListener("DOMContentLoaded",function(){
    main();
});
