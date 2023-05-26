//Global Variables
const canvas =  document.getElementById("pose-canvas");
const ctx = canvas.getContext("2d");
const curve = document.getElementById("curve");
const ctx_curve = curve.getContext("2d");
/*const curveL = document.getElementById("curveL");
const ctx_curveL = curveL.getContext("2d");
const curveR = document.getElementById("curveR");
const ctx_curveR = curveR.getContext("2d");
const curveAvgL = document.getElementById("curveAvgL");
const ctx_curveAvgL = curveAvgL.getContext("2d");
const curveAvgR = document.getElementById("curveAvgR");
const ctx_curveAvgR = curveAvgR.getContext("2d");
*/
const video = document.getElementById("pose-video");
const pose = new Pose({locateFile: (file) => {
    return `node_modules/@mediapipe/pose/${file}`;
    //return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});

/*const k =15;

var dflag=false, kflag=false,strideflag=false, setflag=false;
var initial_height_px=0, height_cm=1,start_point=0,cnfThreshold=0.10,results_cpy;
var lstep_flag=false,rstep_flag=true,n1=0, n2=0,nsteps=0,lr_step_threshold=0;
*/
var min = 0, sec = 0;
var param = [];

const bezier_points = [];


//peak detection 
var pre = 0, curr = 0, forw = 0, flag = 1, threshold = 23, steps = 0; 



const config ={
    video:{ width: 960, height: 540, fps: 30}
    //video:{ width: 480, height: 640, fps: 30}
    //video:{ width: 280, height: 440, fps: 30}
};
/*
async function setParameters(button)
{
    // Initializing parameters like height, start point, lr_step_threshold

    height_cm = document.getElementById("height").value;
    //height_cm = 155;


    if(setflag==false && height_cm>1)
    {
        let eyeL = results_cpy.poseLandmarks[2]
        let eyeR = results_cpy.poseLandmarks[5]
        let hipL = results_cpy.poseLandmarks[23]
        let hipR = results_cpy.poseLandmarks[24]
        let kneeR = results_cpy.poseLandmarks[26]
        let ankleL = results_cpy.poseLandmarks[27]
        let ankleR = results_cpy.poseLandmarks[28]
        let count =0;
        let timeFrame = 500
        let start = new Date().getTime();
        let end = start;

    
        while(end - start < timeFrame)
        {
            
            start_point = start_point+ (ankleL.x +ankleR.x)/2
            ////lr_step_threshold = lr_step_threshold + distance(ankleL.x, ankleL.y, ankleR.x, ankleR.y)
            lr_step_threshold = lr_step_threshold + Math.abs(ankleL.x - ankleR.x)
            initial_height_px = initial_height_px+ (distance(0, eyeL.y, 0, ankleL.y) + distance(0, eyeR.y, 0, ankleR.y))/2;
            count = count +1;
            button.innerHTML = "Initializing ...."

            end = new Date().getTime();
        }

        initial_height_px  = (initial_height_px / count).toFixed(2);
        start_point = (start_point / count).toFixed(2)
        lr_step_threshold = ((lr_step_threshold/count) * (height_cm/initial_height_px)).toFixed(2);

        button.innerHTML = "Done"
        setflag=true;
    }
}

function resetParameters(button)
{
    if(setflag==true)
    {
        height_cm=0;
        initial_height_px=0;
        start_point=0;
        lr_step_threshold=0;
        button.innerHTML = "Initialize Parameters";
        setflag=false;
    }  
}

function toggleDistance(button)
{
    // To Toggle distance button between detect and pause

    if (dflag)
    {
        dflag = false;
        button.innerHTML= "Start"; 
    } 
    else 
    {
        dflag = true;
        timer()
        button.innerHTML= "Stop";     
    }
}
*/
function timer()
{
     // Timer Function, Starts when video starts playing-> This fn has changed.

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
/*
function toggleStrideLength(button){

// To toggle stride length button between Detect and pause
// Activates only when both right and left step length is in detect mode

    if (strideflag) {

        strideflag = false;
        button.innerHTML= "Detect"; 
    } 
    else {

            strideflag = true;
            button.innerHTML= "Pause"; 
    }
}*/

function distance(x1,y1,x2,y2){

    // calculate eucliedean distance between point(x1,y1) and (x2,y2)

    let a = x2-x1;
    let b = y2-y1;
    let result = Math.sqrt( a*a + b*b);

    return result;
}

function download_csv(){
    //define the heading for each row of the data
    var csv = 'hipL_x, hipL_y, kneeL_x, kneeL_y, ankleL_x, ankleL_y, hipR_x, hipR_y, kneeR_x, kneeR_y, ankleR_x, ankleR_y\n';
    
    //merge the data with CSV
    bezier_points.forEach(function(row) {
            csv += row.join(',');
            csv += "\n";
    });
 

   
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    
    //provide the name for the CSV file to be downloaded
    hiddenElement.download = 'BezierControlPoints.csv';
    hiddenElement.click();
}



async function main()
{
    // Main function
    // Initialize required variables, load model, etc.

    const download = document.getElementById("dow");
    /*
    const setBttn = document.getElementById("bttn3");
    const resetBttn = document.getElementById("bttn4");
    const strideBttn = document.getElementById("bttn5");
    const distanceBttn = document.getElementById("bttn8");
    

    setBttn.onclick = function(){
        setParameters(setBttn)
    }

    resetBttn.onclick = function(){
        resetParameters(setBttn)
    }

    /*strideBttn.onclick = function(){
        toggleStrideLength(strideBttn)
    }

    distanceBttn.onclick = function(){
        //setParameters(setBttn)
        toggleDistance(distanceBttn)
        toggleStrideLength(strideBttn)
    }
    */
    download.onclick = function(){
        download_csv()
    }



    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: true,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

    pose.onResults(onResults);


    //video.src = "../assets/videos/video31.mp4";
    //video.src = "video/p1s1/c3_0195.mp4";
    //video.src = "../assets/hospital_videos/video4.mp4";
    
    //video.src ="http://192.168.43.82:4747/"       //  IP web cam

    //video.playbackRate = 0.2;                // video File
    video.width = config.video.width;
    video.height= config.video.height;

    canvas.width = config.video.width;
    canvas.height = config.video.height;
    //console.log("Canvas initialized");


    
    //for graph
    curve.width = config.video.width;
    curve.height = config.video.height;
    /*
    //for graph
    curveL.width = config.video.width;
    curveL.height = config.video.height;

    
    curveR.width = config.video.width;
    curveR.height = config.video.height;

    curveAvgL.width = config.video.width;
    curveAvgL.height = config.video.height;

    curveAvgR.width = config.video.width;
    curveAvgR.height = config.video.height;

    */

    video.onloadedmetadata = function(e) {
        video.play();
    };

    /*

    //for bezier curve
        ctx_curve.beginPath();
        ctx_curve.moveTo(hipL.x*video.width, hipL.y*video.height );
        ctx_curve.quadraticCurveTo(kneeL.x*video.width, kneeL.y*video.height, ankleL.x*video.width, ankleL.y*video.height);
        ctx_curve.stroke();

    //Text in canvas
    ctx_curveL.font = "50px Comic Sans MS";
    ctx_curveL.fillStyle = "red";
    ctx_curveL.fillText("Left Leg", 400, 50);

    
    ctx_curveR.font = "50px Comic Sans MS";
    ctx_curveR.fillStyle = "red";
    ctx_curveR.fillText("Right Leg", 400, 50);

    ctx_curveAvgL.font = "50px Comic Sans MS";
    ctx_curveAvgL.fillStyle = "red";
    ctx_curveAvgL.fillText("Left Leg(Avg)", 360, 50);

    ctx_curveAvgR.font = "50px Comic Sans MS";
    ctx_curveAvgR.fillStyle = "red";
    ctx_curveAvgR.fillText("Right Leg(Avg)", 360, 50);



    */
    
    //Text in canvas
    ctx_curve.font = "50px Comic Sans MS";
    ctx_curve.fillStyle = "red";
    ctx_curve.fillText("Left Leg Bezier Curve", 200, 50);

    video.addEventListener("play",computeFrame);
}

/*
function calculateAngle(x1,y1,x2,y2,x3,y3)
{
    // calculate angle between the lines
    // considering a line of slope 0 at point (x2,y2)
     
    let m1 = (y2-y1)/(x2-x1)    
    let m2 = 0
    let m3 = (y3-y2)/(x3-x2)    

    let a1 = Math.abs((m2-m1)/(1+ m1*m2))
    let a2 = Math.abs((m3-m2)/(1+ m3*m2))

    let angle_rad1 = Math.atan(a1)
    let angle_rad2 = Math.atan(a2)
        
    let angle1 = angle_rad1 *(180.0 / Math.PI)
    let angle2 = angle_rad2 *(180.0 / Math.PI)
    
    let angle = (angle1+ angle2).toFixed(2)

    return angle
}

/*function calculateFootAngle(x1,y1,x2,y2){
 
    let m1 = (y2-y1)/(x2-x1)    
    let m2 = 0

    let a1 = Math.abs((m2-m1)/(1+ m1*m2))
    let angle_rad = Math.atan(a1)
    let angle = angle_rad *(180.0 / Math.PI)

    return (90-angle).toFixed(2)
}

function calculateAnkleAngle(x1,y1,x2,y2,x3,y3){
    
    //  Formula:   a^2 + b^2 - 2abCos(C) = c^2

    let a_sq = ((x2-x1)*(x2-x1)) + ((y2-y1)*(y2-y1));
    let b_sq = ((x3-x2)*(x3-x2)) + ((y3-y2)*(y3-y2));
    let c_sq = ((x3-x1)*(x3-x1)) + ((y3-y1)*(y3-y1));

    let value= (a_sq + b_sq - c_sq)/(2* Math.sqrt(a_sq)* Math.sqrt(b_sq) )
    let angle_rad = Math.acos(value)
    let angle = angle_rad *(180.0 / Math.PI)       

    return angle  // May be changed to (angle - 90)
}
*/
function calculateAngle(x1,y1,x2,y2,x3,y3){  //Previously calculateHipAngle()
    //  Formula:   a^2 + b^2 - 2abCos(C) = c^2

    let a_sq = ((x2-x1)*(x2-x1)) + ((y2-y1)*(y2-y1));
    let b_sq = ((x3-x2)*(x3-x2)) + ((y3-y2)*(y3-y2));
    let c_sq = ((x3-x1)*(x3-x1)) + ((y3-y1)*(y3-y1));

    let value= (a_sq + b_sq - c_sq)/(2* Math.sqrt(a_sq)* Math.sqrt(b_sq) )
    let angle_rad = Math.acos(value)
    let angle = angle_rad *(180.0 / Math.PI)

    return angle // May be changed to (180 - angle)
}

function sigmoid(x){
    return 1 / (1 + Math.exp(-x/k));
}

function peak(first, second, third)
{
    if(second > first && second > third)
       return second;
}

function bezierAvg(arr){
    var res = [];
    var len = arr.length - 1;
    
    for(j = 0; j < 12; j++){

        var sum = 0;
        for(i = 1; i <= len; i++){
            sum += arr[i][j];
        }
        res.push(sum/len);
    }
    return res;
}



function onResults(results)
{
    // draw image frame,skeleton points
    // calculate right & left step length,stride length, joint angles and display it

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    fps_start_time = performance.now();
    //console.log(results)


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
        //console.log(heelL.x , heelL.y)
       // console.log(eyeL.x, eyeL.y, eyeL.z)


        //let to = foot_indexL.x - sacrum;
        //Heel strike and toe off
        let hsL = (heelL.x - hipL.x)*video.width;
        //console.log(hsL);
        let toL = foot_indexL.x - hipL.x;
        let hsR = heelR.x - hipR.x;
        let toR = foot_indexR.x - hipR.x;



        //strike detection code
        if(flag == 1)
        {
          pre = hsL;
          flag += 1;
        }
        else if( flag == 2)
        {
          curr = hsL;
          flag += 1;
        }
        else     
        {
          forw = hsL;
          flag += 1;
          if(curr > pre && curr > forw && curr > threshold)
          {
            console.log(curr);
            steps++;
            document.getElementById("LStrikes").innerHTML = steps;
            //data.push(curr);
          }
          pre = curr;
          curr = forw;
        }


        /*
        let current_height_px = (distance(0, hipL.y, 0, ankleL.y) + distance(0, hipR.y, 0, ankleR.y))/2 
        //////////////////let current_height_px = (distance(0, eyeL.y, 0, ankleL.y) + distance(0, eyeR.y, 0, ankleR.y))/2
        let px2cm_factor= height_cm/current_height_px;

          
        let kd = 0;
        if(dflag && setflag)
        {
            let end_point = (ankleL.x+ankleR.x)/2
            let d = Math.abs(start_point - end_point)
            d = px2cm_factor * d
            document.getElementById("distance") .innerHTML = d.toFixed(2)
            var t = min * 60 + sec;
            document.getElementById("Gait Speed").innerHTML = ((d / 100) / t).toFixed(2)

             // Knee Distance
             kd = (px2cm_factor * distance(kneeL.x, kneeL.y, kneeR.x, kneeR.y)).toFixed(2)
             document.getElementById("knee-d").innerHTML= kd;   ////y distance only
             ///////////////////document.getElementById("knee-d").innerHTML= (px2cm_factor * abs(kneeR.y - kneeL.y)).toFixed(2);
            

              /*
            //Right & Left Foot Angle
            let rval = calculateFootAngle(heelR.x, heelR.y, foot_indexR.x, foot_indexR.y);
            let lval = calculateFootAngle(heelL.x, heelL.y, foot_indexL.x, foot_indexL.y)
            document.getElementById("fa-angle-R").innerHTML = rval; 
            document.getElementById("fa-angle-L").innerHTML = lval;
            */

             //Storing values in csv for Bezier curves
             var data = [];
             data.push(hipL.x)
             data.push(hipL.y)
             data.push(kneeL.x)
             data.push(kneeL.y)
             data.push(ankleL.x)
             data.push(ankleL.y)
 
             data.push(hipR.x)
             data.push(hipR.y)
             data.push(kneeR.x)
             data.push(kneeR.y)
             data.push(ankleR.x)
             data.push(ankleR.y)
 
             bezier_points.push(data);

        
              //for bezier curve
        ctx_curve.beginPath();
        ctx_curve.moveTo(hipL.x*video.width, hipL.y*video.height );
        ctx_curve.quadraticCurveTo(kneeL.x*video.width, kneeL.y*video.height, ankleL.x*video.width, ankleL.y*video.height);
        ctx_curve.stroke();
        console.log("*******"+hipL.x*video.width)

             /*
            //Left leg bezier curves
            ctx_curveL.beginPath();
            ctx_curveL.moveTo(hipL.x*video.width, hipL.y*video.height );
            ctx_curveL.quadraticCurveTo(kneeL.x*video.width, kneeL.y*video.height, ankleL.x*video.width, ankleL.y*video.height);
            ctx_curveL.stroke();

        
            //Right leg Bezier curves
            ctx_curveR.beginPath();
            ctx_curveR.moveTo(hipR.x*video.width, hipR.y*video.height );
            ctx_curveR.quadraticCurveTo(kneeR.x*video.width, kneeR.y*video.height, ankleR.x*video.width, ankleR.y*video.height);
            ctx_curveR.stroke();

            //Avg leg Bezier curve
            var bezAvg = [];
            bezAvg = bezierAvg(bezier_points);

            //Left leg avg bezier
            ctx_curveAvgL.beginPath();
            ctx_curveAvgL.moveTo(bezAvg[0]*video.width, bezAvg[1]*video.height); //hip
            ctx_curveAvgL.quadraticCurveTo(bezAvg[2]*video.width, bezAvg[3]*video.height, bezAvg[4]*video.width, bezAvg[5]*video.height)
            ctx_curveAvgL.stroke();

            //Right leg avg bezier
            ctx_curveAvgR.beginPath();
            ctx_curveAvgR.moveTo(bezAvg[6]*video.width, bezAvg[7]*video.height); //hip
            ctx_curveAvgR.quadraticCurveTo(bezAvg[8]*video.width, bezAvg[9]*video.height, bezAvg[10]*video.width, bezAvg[11]*video.height)
            ctx_curveAvgR.stroke();


            */




            //Right Knee Angle  & Left Knee Angle 
            let rk_val = (180 -  calculateAngle(hipR.x, hipR.y, kneeR.x, kneeR.y, ankleR.x, ankleR.y)).toFixed(2)
            let lk_val = (180 -  calculateAngle(hipL.x, hipL.y, kneeL.x, kneeL.y, ankleL.x, ankleL.y)).toFixed(2)
            document.getElementById("k-angle-R").innerHTML = rk_val;
            document.getElementById("k-angle-L").innerHTML = lk_val;

            // Right Ankle Angle &  Left Ankle Angle  //ra_val - 90 should be there
            let ra_val = (calculateAngle(kneeR.x, kneeR.y, ankleR.x, ankleR.y,foot_indexR.x, foot_indexR.y) - 90).toFixed(2);
            let la_val = (calculateAngle(kneeL.x, kneeL.y, ankleL.x, ankleL.y,foot_indexL.x, foot_indexL.y) - 90).toFixed(2);
            document.getElementById("ank-angle-R").innerHTML = ra_val;
            document.getElementById("ank-angle-L").innerHTML = la_val;

            // Hip Angle
            document.getElementById("hip-angle-R").innerHTML = (180 - calculateAngle(shoulderR.x, shoulderR.y, hipR.x, hipR.y, kneeR.x, kneeR.y)).toFixed(2)
            document.getElementById("hip-angle-L").innerHTML = (180 - calculateAngle(shoulderL.x, shoulderL.y, hipL.x, hipL.y, kneeL.x, kneeL.y)).toFixed(2)

 
        }

        /*
        if(strideflag && setflag)                 /////////Doubts
        {   
            ///console.log(ankleL.x, ankleL.y, ankleR.x, ankleR.y)
            let sign = (px2cm_factor*(ankleR.y - ankleL.y))
            //let sign = (ankleR.y - ankleL.y)/(current_height_px/initial_height_px)
            ////let step_d = (px2cm_factor * distance(ankleL.x, ankleL.y, ankleR.x, ankleR.y)) - lr_step_threshold
            let step_d = (px2cm_factor * Math.abs(ankleL.x - ankleR.x)).toFixed(2)
            
            //let step_d = px2cm_factor*Math.abs(ankleL.x - ankleR.x)
            //let r = sigmoid(step_d);
            //console.log("LAx "+ankleL.x*px2cm_factor+ " RAx "+ ankleR.x*px2cm_factor+ " lr_step_threshold "+lr_step_threshold)
            
            

           //console.log(step_d);
           if(flag == 1)
           {
            pre = step_d;
            flag += 1;
           }
           else if( flag == 2)
           {
            curr = step_d;
            flag += 1;
           }
           else     
           {

            
            forw = step_d;
            flag += 1;
            
           
            let dis = peak(pre, curr, forw);
            //if(rstep_flag && sign>1 && r>=0.99)           //doubt
            if(rstep_flag && sign > 1 )
            {
                nsteps++;
                rstep_flag = false
                lstep_flag = true;                           /////change r .94 to .99
                //n1=step_d;
                n1 = dis;
                document.getElementById("rs-d").innerHTML = dis;
                document.getElementById("ls-d").innerHTML = 0;
                /////console.log(step_d.toFixed(1), performance.now())
            }
            else if(lstep_flag && sign<1 )
            //else if(lstep_flag && sign<1 && r>=0.99)
            {
                nsteps++;
                rstep_flag = true
                lstep_flag = false;
                //n2=step_d;
                n2 = dis;
                document.getElementById("rs-d").innerHTML = 0;
                document.getElementById("ls-d").innerHTML = dis;
                /////console.log(step_d.toFixed(1), performance.now())
            }
            
            if( n1 > 0 && n2 > 0 ){
                let s = parseInt(n1) + parseInt(n2);
                document.getElementById("stride").innerHTML = s;
                //console.log(n1, n2)
            }
            else
                document.getElementById("stride").innerHTML = 0;
            
            document.getElementById("nsteps").innerHTML=nsteps;

            //Cadence
            let cad = nsteps/(min + sec/60)
            document.getElementById("cad").innerHTML = cad.toFixed(2);

            pre = curr;
            curr = forw;
          }
        } */
    
    
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


async function init_camera_canvas()
{
    const constraints ={
        audio: false,
        video:{
        width: config.video.width,           
        height: config.video.height,
        facingMode: 'environment',
        frameRate: { max: config.video.fps }
        }
    };
    
    video.width = config.video.width;     
    video.height= config.video.height;

    canvas.width = config.video.width;
    canvas.height = config.video.height;
    console.log("Canvas initialized");

    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        video.srcObject = stream;
        main();
    });

}

document.addEventListener("DOMContentLoaded",function(){
    init_camera_canvas();
});
