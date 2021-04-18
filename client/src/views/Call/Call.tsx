// @ts-nocheck
import React, { useEffect, useState } from 'react';
//react-router
import { Link } from 'react-router-dom';
//material-ui
import { ThemeProvider, createMuiTheme, Button, Grid } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
//styles
import styled from 'styled-components';
import { MainBody, MainTitle, SubTitle } from './styles';
import { useDispatch, useSelector } from 'react-redux';
import { P2P } from '../../P2P/P2P';

import Plot from 'react-plotly.js';
import Peer from '../../components/peer';
//local imports
import * as facemesh from '@tensorflow-models/facemesh';

//require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');

const theme = createMuiTheme({
    palette: {
        primary: green,
    },
});

const Home: React.FC = () => {
    const [video] = useState(React.createRef<HTMLVideoElement>());
    const [canvas] = useState(React.createRef<HTMLCanvasElement>());
    const [points, setPoints] = useState([]);
    const [remotePoints, setRemotePoints] = useState([]);
    const [bytes, setBytes] = useState(0);
    const [mbps, setMBPS] = useState(0);
    const [fps, setFPS] = useState(0);

    const p2p: P2P = useSelector((state) => state.room.P2P);
    const peers: P2P = useSelector((state) => state.room.peers);

    const NUM_KEYPOINTS = 468;
    const NUM_IRIS_KEYPOINTS = 5;
    const GREEN = '#32EEDB';
    const RED = '#FF2C35';
    const BLUE = '#157AB3';

    const dataChannelName = 'faceData';

    let lastCalledTime;
    let curFps;

    const start = Date.now();

    let ctx;
    let bytesSent = 0;

    const model = facemesh.load({ maxFaces: 1 });

    document.addEventListener('data_channel_message', function (event) {
        if (event.detail.currentTarget.label == dataChannelName) {
            recievedRemoteFace(event.detail.data);
        }
    });

    function recievedRemoteFace(data) {
        const typedArray = new Int16Array(data);
        const dataArray = Array.from(typedArray);

        const x = [];
        const y = [];
        const z = [];

        for (let i = 0; i < dataArray.length; i += 3) {
            x.push(dataArray[i]);
            y.push(dataArray[i + 1]);
            z.push(dataArray[i + 2]);
        }

        const arrOfPoints = [];

        arrOfPoints.push({
            x: z,
            y: x,
            z: y,
            type: 'scatter3d',
            mode: 'markers',
            marker: {
                color: GREEN,
                size: 2,
                symbol: 'circle',
                line: {
                    color: 'rgb(0, 0, 0)',
                    width: 1,
                },
                opacity: 0.8,
            },
        });

        setRemotePoints(arrOfPoints);
    }

    function distance(a, b) {
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    }

    async function getMedia() {
        const webcamStream = await p2p.getMedia(true, true);

        video.current.srcObject = webcamStream;
    }
    async function run() {
        await getMedia();
    }

    async function detectFace() {
        ctx = canvas.current.getContext('2d');

        ctx.translate(video.current?.videoWidth, 0);
        ctx.scale(-1, 1);
        ctx.fillStyle = GREEN;
        ctx.strokeStyle = GREEN;
        ctx.lineWidth = 0.5;

        video.current.requestVideoFrameCallback(detectFaceInFrame);
    }

    function calculateFps() {
        if (!lastCalledTime) {
            lastCalledTime = Date.now();
            curFps = 0;
        }

        const delta = (Date.now() - lastCalledTime) / 1000;
        lastCalledTime = Date.now();
        curFps = parseInt(1 / delta);
        setFPS(curFps);
    }
    const detectFaceInFrame = async (now, metadata) => {
        calculateFps();

        const predictions = await (await model).estimateFaces(video.current);

        ctx.drawImage(video.current, 0, 0, video.current?.videoWidth, video.current?.videoHeight);

        if (predictions.length > 0) {
            predictions.forEach((prediction) => {
                const keypoints = prediction.scaledMesh;

                ctx.fillStyle = GREEN;

                for (let i = 0; i < NUM_KEYPOINTS; i++) {
                    const x = keypoints[i][0];
                    const y = keypoints[i][1];

                    ctx.beginPath();
                    ctx.arc(x, y, 1, 0, 2 * Math.PI);
                    ctx.fill();
                }

                if (keypoints.length > NUM_KEYPOINTS) {
                    ctx.strokeStyle = RED;
                    ctx.lineWidth = 1;

                    const leftCenter = keypoints[NUM_KEYPOINTS];
                    const leftDiameterY = distance(keypoints[NUM_KEYPOINTS + 4], keypoints[NUM_KEYPOINTS + 2]);
                    const leftDiameterX = distance(keypoints[NUM_KEYPOINTS + 3], keypoints[NUM_KEYPOINTS + 1]);

                    ctx.beginPath();
                    ctx.ellipse(leftCenter[0], leftCenter[1], leftDiameterX / 2, leftDiameterY / 2, 0, 0, 2 * Math.PI);
                    ctx.stroke();

                    if (keypoints.length > NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS) {
                        const rightCenter = keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS];
                        const rightDiameterY = distance(
                            keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 2],
                            keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 4],
                        );
                        const rightDiameterX = distance(
                            keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 3],
                            keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 1],
                        );

                        ctx.beginPath();
                        ctx.ellipse(
                            rightCenter[0],
                            rightCenter[1],
                            rightDiameterX / 2,
                            rightDiameterY / 2,
                            0,
                            0,
                            2 * Math.PI,
                        );
                        ctx.stroke();
                    }
                }
            });

            //render 3d
            const pointsData = predictions.map((prediction) => {
                const scaledMesh = prediction.scaledMesh;
                return scaledMesh.map((point) => [-point[0], -point[1], -point[2]]);
            });

            let flattenedPointsData = [];

            for (let i = 0; i < pointsData.length; i++) {
                flattenedPointsData = flattenedPointsData.concat(pointsData[i]);
            }

            let superFlattenedPointsData = [];

            for (let i = 0; i < flattenedPointsData.length; i++) {
                superFlattenedPointsData = superFlattenedPointsData.concat(flattenedPointsData[i]);
            }
            const arrOfPoints = [];
            const X = [];
            const Y = [];
            const Z = [];

            const scaleFactor = 5;

            for (let i = 0; i < flattenedPointsData.length; i++) {
                let x = flattenedPointsData[i][0] / scaleFactor;
                let y = flattenedPointsData[i][1] / scaleFactor;
                let z = flattenedPointsData[i][2] / scaleFactor;

                //const normal = normalize3dCoordinate(x, y, z);

                //prevent values from going over bounds
                if (x > 128) {
                    x = 128;
                }
                if (x < -127) {
                    x = -127;
                }

                if (x > 128) {
                    x = 128;
                }
                if (y < -127) {
                    y = -127;
                }

                if (z > 128) {
                    z = 128;
                }
                if (z < -127) {
                    z = -127;
                }

                X.push(x);
                Y.push(y);
                Z.push(z);
            }

            arrOfPoints.push({
                x: Z,
                y: X,
                z: Y,
                type: 'scatter3d',
                mode: 'markers',
                marker: {
                    color: GREEN,
                    size: 2,
                    symbol: 'circle',
                    line: {
                        color: 'rgb(0, 0, 0)',
                        width: 1,
                    },
                    opacity: 0.8,
                },
            });

            setPoints(arrOfPoints);
            sendFace(superFlattenedPointsData);
        }

        // Re-register the callback to be notified about the next frame.

        video.current.requestVideoFrameCallback(detectFaceInFrame);
    };

    function normalize3dCoordinate(x, y, z) {
        const length = Math.sqrt(x * x + y * y + z * z);
        console.log(length);
        return [x / length, y / length, z / length];
    }

    function sendFace(points) {
        //convert array to ArrayBuffer
        const bufferedArray = arrayToInt8ArrayBuffer(points);

        bytesSent += bufferedArray.byteLength;
        const mb = bytesSent / 1000000;
        const timeDeltaMS = Date.now() - start; // milliseconds elapsed since start
        const timeDeltaSeconds = Math.floor(timeDeltaMS / 1000); // in seconds
        const mbps = mb / timeDeltaSeconds;
        setBytes(mb.toFixed(3));
        setMBPS(mbps.toFixed(3));

        p2p.sendMessageAll(dataChannelName, bufferedArray);
    }

    //2 bytes each
    function arrayToInt8ArrayBuffer(array) {
        const length = array.length;
        const buffer = new ArrayBuffer(length * 1);
        const view = new Int16Array(buffer);
        for (let i = 0; i < length; i++) {
            view[i] = array[i];
        }
        return buffer;
    }

    //2 bytes each
    function arrayToInt16ArrayBuffer(array) {
        const length = array.length;
        const buffer = new ArrayBuffer(length * 2);
        const view = new Int16Array(buffer);
        for (let i = 0; i < length; i++) {
            view[i] = array[i];
        }
        return buffer;
    }

    function joinDataChannel() {
        p2p.createDataChannel(dataChannelName);
    }

    function loadp2p() {
        p2p.joinRoom('hello');
    }

    useEffect(() => {
        console.log('loaded!');

        loadp2p();
        run();
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <Button onClick={joinDataChannel}>data channel</Button>
            <h1>MBs sent: {bytes}</h1>
            <h1>Mbps: {mbps}</h1>
            <Grid container spacing={1}>
                <Grid item>
                    <p>Live Video</p>
                    <video ref={video} autoPlay={true} playsInline muted onPlay={detectFace} width="640" height="360" />
                </Grid>
                <Grid item>
                    <p>with features</p>
                    <p>fps: {fps}</p>
                    <canvas ref={canvas} width="640" height="360" />
                </Grid>
                <Grid item>
                    <Plot data={points} layout={{ width: 600, height: 600, showlegend: 'false', dragmode: 'orbit' }} />
                </Grid>
                {peers.map((peer, i) => {
                    return (
                        <Grid key={i} item>
                            <Peer key={i} peer={peer} />
                        </Grid>
                    );
                })}
            </Grid>
        </ThemeProvider>
    );
};

export default Home;
