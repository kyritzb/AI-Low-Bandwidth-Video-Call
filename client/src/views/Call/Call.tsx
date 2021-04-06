// @ts-nocheck
import React, { useEffect, useState } from 'react';
//react-router
import { Link } from 'react-router-dom';
//material-ui
import { ThemeProvider, createMuiTheme, Button } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
//styles
import styled from 'styled-components';
import { MainBody, MainTitle, SubTitle } from './styles';
import { useDispatch, useSelector } from 'react-redux';
import { P2P } from '../../P2P/P2P';

//local imports
import * as facemesh from '@tensorflow-models/facemesh';

require('@tensorflow/tfjs-backend-webgl');

const theme = createMuiTheme({
    palette: {
        primary: green,
    },
});

const Home: React.FC = () => {
    const [video] = useState(React.createRef<HTMLVideoElement>());
    const [canvas] = useState(React.createRef<HTMLCanvasElement>());
    const p2p: P2P = useSelector((state) => state.room.P2P);

    const NUM_KEYPOINTS = 468;
    const NUM_IRIS_KEYPOINTS = 5;
    const GREEN = '#32EEDB';
    const RED = '#FF2C35';
    const BLUE = '#157AB3';
    const renderPointcloud = true;

    const model = facemesh.load({ maxFaces: 1 });

    function distance(a, b) {
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    }

    function drawPath(ctx, points, closePath) {
        const region = new Path2D();
        region.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            region.lineTo(point[0], point[1]);
        }

        if (closePath) {
            region.closePath();
        }
        ctx.stroke(region);
    }

    async function getMedia() {
        const webcamStream = await p2p.getMedia(true, true);

        video.current.srcObject = webcamStream;
    }
    async function run() {
        console.log('getting webcam');
        await getMedia();
    }

    async function detectFace() {
        console.log('running facial detection');

        video.current.requestVideoFrameCallback(detectFaceInFrame);
    }

    const detectFaceInFrame = async (now, metadata) => {
        const predictions = await (await model).estimateFaces(video.current);

        //console.log(faces);
        const ctx = canvas.current.getContext('2d');

        ctx.fillStyle = GREEN;
        ctx.strokeStyle = GREEN;
        ctx.lineWidth = 0.5;
        ctx.drawImage(video.current, 0, 0, 250, 188);

        if (predictions.length > 0) {
            predictions.forEach((prediction) => {
                const keypoints = prediction.scaledMesh;

                console.log(keypoints);
                if (keypoints == 468) {
                    ctx.strokeStyle = GREEN;
                    ctx.lineWidth = 0.5;

                    for (let i = 0; i < TRIANGULATION.length / 3; i++) {
                        const points = [TRIANGULATION[i * 3], TRIANGULATION[i * 3 + 1], TRIANGULATION[i * 3 + 2]].map(
                            (index) => keypoints[index],
                        );

                        drawPath(ctx, points, true);
                    }
                } else {
                    ctx.fillStyle = GREEN;

                    for (let i = 0; i < NUM_KEYPOINTS; i++) {
                        const x = keypoints[i][0];
                        const y = keypoints[i][1];

                        ctx.beginPath();
                        ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
                        ctx.fill();
                    }
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
        }

        //faces.forEach((face) => console.log(face.scaledMesh));
        // Re-register the callback to be notified about the next frame.

        video.current.requestVideoFrameCallback(detectFaceInFrame);
    };

    useEffect(() => {
        console.log('loaded!');

        run();
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <div>
                <p>Live Video</p>
                <video ref={video} autoPlay={true} playsInline muted onPlay={detectFace} width="250" height="188" />
            </div>

            <div>
                <p>with features</p>
                <canvas ref={canvas} width="250" height="188" />
            </div>
        </ThemeProvider>
    );
};

export default Home;
