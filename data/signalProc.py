import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.signal import find_peaks
import csv


# Reading excel file data
df = pd.read_excel(r'G:\VSCode\GaitAnalysis\Analysis_data\Gait_data_p20s3.xlsx')
#df = pd.read_csv(r'G:\VSCode\GaitAnalysis\Analysis_data\Gait_data_p4s3.csv')
print(df)
print(df.columns)
data1 = df[' hsL']
data2 = df[' hsR']
#print(data1)

# Compute the noise level as the median absolute deviation (MAD)
noise_level1 = 1.4826 * np.median(np.abs(data1 - np.median(data1)))  #peaks must have a height above the noise level to be detected
print(noise_level1)                                                #1.4826 is to make the MAD an unbiased estimator of the standard 
                                                                  #deviation for normally distributed data. In other words, if the 
                                                                  #data is normally distributed, then the MAD divided by this constant will give an estimate of the standard deviation of the data.

# Detect the peaks using the find_peaks function
peaks1, _ = find_peaks(data1, height=noise_level1, distance=1)       #peaks must be at least one data point away from each other, because there are sudden spikes

# Print the peak indices and values
print(peaks1)
print([data1[i] for i in peaks1])



# Compute the noise level as the median absolute deviation (MAD)
noise_level2 = 1.4826 * np.median(np.abs(data2 - np.median(data2)))  #peaks must have a height above the noise level to be detected
print(noise_level2)                                                #1.4826 is to make the MAD an unbiased estimator of the standard 
                                                                  #deviation for normally distributed data. In other words, if the 
                                                                  #data is normally distributed, then the MAD divided by this constant will give an estimate of the standard deviation of the data.

# Detect the peaks using the find_peaks function
peaks2, _ = find_peaks(data2, height=noise_level2, distance=1)       #peaks must be at least one data point away from each other, because there are sudden spikes

# Print the peak indices and values
print(peaks2)
print([data2[i] for i in peaks2])


# store = ['21', noise_level]
# for i in peaks:
#    store.append(data[i])


#print(store)


# # Open the CSV file in append mode and write the data to it row wise
# with open('hsRData_New.csv', 'a', newline='') as csvfile:
#     writer = csv.writer(csvfile)
#     writer.writerow(store)

for i in range(len(peaks1)-1):
   yval = (df.iloc[peaks1[i]:peaks1[i+1]])[' hipL_ang']
   xval = 100*(np.arange(len(yval))/(len(yval)-1))
   plt.plot(xval, yval, label=f'Cycle {i+1}')

plt.xlabel("Gait Cycle (%)")
plt.ylabel("Left Hip Angle(deg)")
plt.title("S20Video2")
plt.legend()
plt.show()


for i in range(len(peaks1)-1):
   yval = (df.iloc[peaks1[i]:peaks1[i+1]])[' lk_ang']
   xval = 100*(np.arange(len(yval))/(len(yval)-1))
   plt.plot(xval, yval, label=f'Cycle {i+1}')

plt.xlabel("Gait Cycle (%)")
plt.ylabel("Left Knee Angle(deg)")
plt.title("S20Video2")
plt.legend()
plt.show()

for i in range(len(peaks1)-1):
   yval = (df.iloc[peaks1[i]:peaks1[i+1]])[' la_ang']
   xval = 100*(np.arange(len(yval))/(len(yval)-1))
   plt.plot(xval, yval, label=f'Cycle {i+1}')

plt.xlabel("Gait Cycle (%)")
plt.ylabel("Left Ankle Angle(deg)")
plt.title("S20Video2")
plt.legend()
plt.show()



for i in range(len(peaks2)-1):
   yval = (df.iloc[peaks2[i]:peaks2[i+1]])[' hipR_ang']
   xval = 100*(np.arange(len(yval))/(len(yval)-1))
   plt.plot(xval, yval, label=f'Cycle {i+1}')

plt.xlabel("Gait Cycle (%)")
plt.ylabel("Right Hip Angle(deg)")
plt.title("S20Video2")
plt.legend()
plt.show()


for i in range(len(peaks2)-1):
   yval = (df.iloc[peaks2[i]:peaks2[i+1]])[' rk_ang']
   xval = 100*(np.arange(len(yval))/(len(yval)-1))
   plt.plot(xval, yval, label=f'Cycle {i+1}')

plt.xlabel("Gait Cycle (%)")
plt.ylabel("Right Knee Angle(deg)")
plt.title("S20Video2")
plt.legend()
plt.show()

for i in range(len(peaks2)-1):
   yval = (df.iloc[peaks2[i]:peaks2[i+1]])[' ra_ang']
   xval = 100*(np.arange(len(yval))/(len(yval)-1))
   plt.plot(xval, yval, label=f'Cycle {i+1}')

plt.xlabel("Gait Cycle (%)")
plt.ylabel("Right Ankle Angle(deg)")
plt.title("S20Video2")
plt.legend()
plt.show()

