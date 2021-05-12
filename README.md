# Image Processing
## _AI-powered Low-Bandwidth video calling_

Video chat powered by artificial intelligence to make video chat over 30 times more bandwidth-efficient. 

[Try the Demo](https://cpe462imageprocessing.azurewebsites.net)

## Introduction

Since the start of the pandemic, last year, people have found themselves restricted to the confines of their apartments and houses. To compensate for the excessive distance brought about by the coronavirus, people were forced to surrender  “physical” society, for one that is “digitized”. As a society, we began working and learning online and jumping from video call to video call to keep in contact with each other. This drastic transformation in our usage of video conferencing platforms exemplified the issues that arise when trying to communicate online. Many of these issues stemming from poor bandwidth and high latency. These problems cause the flow of the conversation to break down and increasingly cause the users to speak over each other, not hear each other, or have to have big pauses between speakers. 


## Objectives

Our main objectives for this project are to bring the video bandwidth usage down as low as possible. In doing this successfully, we can ensure that the users who are trying to communicate will be able to have a better quality of experience when having a video conference on their computers. This technology would also open up video conferencing to the rest of the world in areas with low bandwidth.

## Design Strategy
In our first prototype, we intend on focusing on the video aspect of video conferencing as it is the aspect that makes up the majority of the bandwidth usage. To bring down the data we send over drastically, we plan on using artificial intelligence to generate a 3-dimensional facial feature map of the user’s face and sending the feature map, instead of the video stream. This feature map will then be interpreted by the remote users and we will place an avatar mask over the feature map to make the avatar talk and move as if it’s the user’s face. The reason we want to do this is that currently the most popular video codec, H.264, requires roughly 5.5 Mbps to stream a 720p video at 30 frames per second. If we instead, send over 468 face landmarks, each having an x, y, and z component which can be a floating-point variable, we can drastically decrease the bandwidth usage. Since each x,y, and z component will be a 32 bit floating-point, that means each landmark would take 96 bits. This means each facial feature map would require roughly 5.616 kbps to send plus the additional data which classifies each landmark. If we send over 30 of these facial feature maps every second, we would be looking at roughly 168.48kbps or 0.1685 Mbps plus the addition of the data that classifies each landmark. In this design approach, we would be sending over roughly 33 times fewer data by sending a facial feature map rather than an H.264 encoded 720p 30fps video. 

## To Do
In order to maximize the potential of the work done on this project, there would need to be a way to use the facial points in a valuable way. Two ideas we have to utilize the points is to use the points, along with the facial points, to reconstruct a fact using a GANs network. Another way we can use the facial points is to map it onto an avatars face to make the avatar have the same facial expressions as the user.

## Development

### How to run the client
1) Go to the client folder: `cd client`
2) Install dependencies:  `npm i`
3) Run the react:  `npm start`

### How to run the client
1) Go to the server folder: `cd server`
2) Install dependencies: `npm i`
3) Run the react: `npm run dev`


