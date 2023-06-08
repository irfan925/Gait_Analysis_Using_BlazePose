# Gait Analysis Using BlazePose
This project is about gait analysis with the help of laptop webcam or resource constrained computing devices such as mobile phone camera. The aim of this project is to classify the gait pattern as Normal or Abnormal or Near Abnormal using Bezier Curves. We are using hip, knee and ankle keypoints to find the Bezier curve of a particular leg of the subject(see the below figure).
![Idea](hypo.jpg)

## For Live demo in browser using BlazePose model [click here](https://irfan925.github.io/BlazePoseLive/)

### Range of Angles
In the below figure, each cycle represents the range of ankle angle for the left leg of the subject and gait cycle(%) represents a complete gait cylce which is the duration of the first heel strike to the second heel strike of the same leg. S1Video1 is the first video of the first subject. Each subject has two video recordings.
![Left Ankle](data\Joint_Angle_Graphs\Subject1_Video1\Left_Ankle.png)  

Similarly, for the other joints the figures are given below. 
![Right Ankle](data\Joint_Angle_Graphs\Subject1_Video1\Right_Ankle.png)
![Left Knee](data\Joint_Angle_Graphs\Subject1_Video1\Left_Knee.png)
![Right Knee](data\Joint_Angle_Graphs\Subject1_Video1\Right_Knee.png)
![Left Hip](data\Joint_Angle_Graphs\Subject1_Video1\Left_Hip.png)
![Right Hip](data\Joint_Angle_Graphs\Subject1_Video1\Right_Hip.png)

Also, the performance on the laptop of the developed system is given in the Performance.xlsx file in the data folder.

### app Folder
This folder contains the application files. You can directly open and run it in the Visual Studio Code. The folder app\video contains the video of straight walk from left to right from the dataset [Dataset](https://link.springer.com/article/10.1007/s11042-019-07945-y){:target="_blank"}. Each subject has 2 recorded video. For example, p1s1 represents first subject's first video and p1s3 represents first subject's second video.

### data Folder 
This folder contains the data of the gait cycle in an excel sheet and graphs. data\Joint_Angle_Graphs contains different joint angles graph of 20 subjects with each subject having 2 videos. 
