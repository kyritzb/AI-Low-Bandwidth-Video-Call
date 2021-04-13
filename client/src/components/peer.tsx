// @ts-nocheck
import React, { useEffect, useState } from 'react';

//material-ui
import { ThemeProvider, createMuiTheme, Button, Grid } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
//styles
import styled from 'styled-components';

import { useDispatch, useSelector } from 'react-redux';

const Peer: React.FC = ({ peer }) => {
    const [loading, setLoading] = useState(true);
    const [video] = useState<React.RefObject<any>>(React.createRef<any>());

    function loadWebcam() {
        if (peer.streams !== undefined) {
            peer.streams.forEach((stream) => {
                if (stream.type === 'webcam') {
                    if (video.current) {
                        console.log('loading ', stream.stream);
                        video.current.srcObject = stream.stream;
                    }
                }
            });
        }
    }

    function onPlay(e) {
        setLoading(false);
    }
    //lifecycles
    useEffect(() => {
        setLoading(true);
        loadWebcam();
    }, [peer.streams.length, peer.name, peer.isWebcamOn, video.current]);

    return (
        <React.Fragment>
            {loading ? <p>loading...</p> : null}
            <video ref={video} width={200} height={200} autoPlay={true} playsInline onPlay={onPlay} />
        </React.Fragment>
    );
};

export default Peer;
