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
const k =15;

var dflag=false, kflag=false,strideflag=false, setflag=false;
var initial_height_px=0, height_cm=1,start_point=0,cnfThreshold=0.10,results_cpy;
var lstep_flag=false,rstep_flag=true,n1=0, n2=0,nsteps=0,lr_step_threshold=0;
var min = 0, sec = 0;
var param = [];

//peak detection variables
var pre = 0, curr = 0, forw = 0, flag = 1, threshold = 23.93611908; 



const config ={
    video:{ width: 960, height: 540, fps: 30}
    //video:{ width: 280, height: 440, fps: 30}
};

async function setParameters(button)
{
    // Initializing parameters like height, start point, lr_step_threshold

    //height_cm = document.getElementById("height").value;
    height_cm = 155;


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

function timer()
{
    // Timer Function, Starts when distance button is in detect mode
    // Gets cleared when distance button is in pause mode

    //let sec=0,min=0;

    var time = setInterval(function(){
    	
        //if (!dflag) {
          //  clearInterval(time);
       // }
        
    	document.getElementById('time').innerHTML=min+":"+sec;
        sec++;

        if(sec == 60)
        {
            sec=0;
            min++;
        }
        
    }, 1000);
}

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



    const setBttn = document.getElementById("bttn3");
    const resetBttn = document.getElementById("bttn4");
    const strideBttn = document.getElementById("bttn5");
    const distanceBttn = document.getElementById("bttn8");
    const download = document.getElementById("dow");

    //setBttn.onclick = function(){
      //  setParameters(setBttn)
    //}

    resetBttn.onclick = function(){
        resetParameters(setBttn)
    }

    //strideBttn.onclick = function(){
      //  toggleStrideLength(strideBttn)
    //}

    distanceBttn.onclick = function(){
        setParameters(setBttn)
        toggleDistance(distanceBttn)
        toggleStrideLength(strideBttn)
    }
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


    //video.src = "../assets/videos/video31.mp4";
    video.src = "video/p2s1/c3_0130.mp4";
    //video.src = "../assets/hospital_videos/video4.mp4";
    
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
}*/



function calculateAngle(x1,y1,x2,y2,x3,y3){
    //  Formula:   a^2 + b^2 - 2abCos(C) = c^2

    let a_sq = ((x2-x1)*(x2-x1)) + ((y2-y1)*(y2-y1));
    let b_sq = ((x3-x2)*(x3-x2)) + ((y3-y2)*(y3-y2));
    let c_sq = ((x3-x1)*(x3-x1)) + ((y3-y1)*(y3-y1));

    let value= (a_sq + b_sq - c_sq)/(2* Math.sqrt(a_sq)* Math.sqrt(b_sq) )
    let angle_rad = Math.acos(value)
    let angle = angle_rad *(180.0 / Math.PI)

    return angle // May be changed to (180 - angle)
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
            console.log(curr)
          }
          pre = curr;
          curr = forw;
        }


        //console.log(heelL.y*video.height)

        //Storing values in csv
        
        // data.push(step_d)
         //data.push(kd)
         //data.push(ankleL.y*video.height);
         //data.push(ankleR.y*video.height)
         //data.push(hs);
         //data.push(to);
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


         
        let current_height_px = (distance(shoulderL.x, shoulderL.y, ankleL.x, ankleL.y)+distance(shoulderR.x,shoulderR.y, ankleR.x, ankleR.y))/2;
        //let current_height_px = (distance(0, hipL.y, 0, ankleL.y) + distance(0, hipR.y, 0, ankleR.y))/2 
        //////////////////let current_height_px = (distance(0, eyeL.y, 0, ankleL.y) + distance(0, eyeR.y, 0, ankleR.y))/2
        let px2cm_factor= height_cm/current_height_px;

        /*
        //Right & Left Foot Angle
        let rval = calculateFootAngle(heelR.x, heelR.y, foot_indexR.x, foot_indexR.y);
        let lval = calculateFootAngle(heelL.x, heelL.y, foot_indexL.x, foot_indexL.y)
        document.getElementById("fa-angle-R").innerHTML = rval; 
        document.getElementById("fa-angle-L").innerHTML = lval;
        */
         
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
        

        let kd = 0;
        if(setflag)
        {
            // Knee Distance
            kd = (px2cm_factor * distance(kneeL.x, kneeL.y, kneeR.x, kneeR.y)).toFixed(2)
            document.getElementById("knee-d").innerHTML= kd;   ////y distance only
            ///////////////////document.getElementById("knee-d").innerHTML= (px2cm_factor * abs(kneeR.y - kneeL.y)).toFixed(2);
        }

        
        

        if(dflag && setflag)
        {
            let end_point = (ankleL.x+ankleR.x)/2
            let d = Math.abs(start_point - end_point)
            d = px2cm_factor * d
            document.getElementById("distance") .innerHTML = d.toFixed(2)
            var t = min * 60 + sec;
            document.getElementById("Gait Speed").innerHTML = ((d / 100) / t).toFixed(2)
        }

        if(strideflag && setflag)                 /////////Doubts
        {   
            ///console.log(ankleL.x, ankleL.y, ankleR.x, ankleR.y)
            let sign = (px2cm_factor*(ankleR.y - ankleL.y))
            //let sign = (ankleR.y - ankleL.y)/(current_height_px/initial_height_px)
            ////let step_d = (px2cm_factor * distance(ankleL.x, ankleL.y, ankleR.x, ankleR.y)) - lr_step_threshold
            let step_d = (px2cm_factor * Math.abs(ankleL.x - ankleR.x)).toFixed(2)
            
            //let step_d = px2cm_factor*Math.abs(ankleL.x - ankleR.x)
            //////let r = sigmoid(step_d);
            //console.log("LAx "+ankleL.x*px2cm_factor+ " RAx "+ ankleR.x*px2cm_factor+ " lr_step_threshold "+lr_step_threshold)
            
            

           //console.log(ankleL.x, ankleL.y);
           //console.log(foot_indexL.x, foot_indexR.x)           
            if(rstep_flag && sign>1 && 346 < ankleR.y*video.height < 349)           //doubt
            {
                nsteps++;
                rstep_flag = false
                lstep_flag = true;                           /////change r .94 to .99
                n1=step_d;
                document.getElementById("rs-d").innerHTML = step_d;
                document.getElementById("ls-d").innerHTML = 0;
                /////console.log(step_d.toFixed(1), performance.now())
            }
            else if(lstep_flag && sign<1 )
            {
                nsteps++;
                rstep_flag = true
                lstep_flag = false;
                n2=step_d;
                document.getElementById("rs-d").innerHTML = 0;
                document.getElementById("ls-d").innerHTML = step_d;
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
        } 
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
