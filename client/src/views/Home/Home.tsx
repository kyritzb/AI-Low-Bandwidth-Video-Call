import React from 'react';
//react-router
import { Link } from 'react-router-dom';
//material-ui
import { ThemeProvider, createMuiTheme, Button, Grid } from '@material-ui/core';
import { green, blue } from '@material-ui/core/colors';
//styles
import styled from 'styled-components';

import Pic from '../../assets/images/faceMesh.jpg';
import { MainBody, MainTitle, SubTitle, By, Text } from './styles';
//local imports

//styled components
const LoginLink = styled(Link)`
    text-decoration: none;
`;

const theme = createMuiTheme({
    palette: {
        primary: blue,
    },
});

const Home: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <div>
                <MainBody>
                    <MainTitle>Low-Bandwidth Video Calling</MainTitle>
                    <SubTitle>Interactive Demonstration</SubTitle>
                    <img src={Pic} width={300} height={200}></img>

                    <By>By Bryan Kyritz, Andrew D’angelo, and Amein Almoughrabi</By>

                    <Grid
                        container
                        spacing={3}
                        direction="row"
                        justify="center"
                        alignItems="center"
                        style={{ marginBottom: '30px', textDecoration: 'none' }}
                    >
                        <Grid item>
                            <a
                                href={
                                    'https://docs.google.com/document/d/16w16Uhghi6QIsI5x631eKPYfw_5n-oA0Ufv-GxWsXbo/edit'
                                }
                                style={{ textDecoration: 'none' }}
                            >
                                Proposal
                            </a>
                        </Grid>

                        <Grid item>
                            <a
                                href={
                                    'https://docs.google.com/document/d/1_IrvbtpO5UYchul4hYgJ7binIqXnn5dt6NZNazwEVmA/edit'
                                }
                                style={{ textDecoration: 'none' }}
                            >
                                Paper
                            </a>
                        </Grid>
                    </Grid>

                    <LoginLink to="/call">
                        <Button
                            variant="contained"
                            color="primary"
                            style={{
                                color: 'white',
                                width: 'auto',
                                fontSize: '15pt',
                                height: '3.25rem',
                                padding: '30px',
                            }}
                        >
                            Try it
                        </Button>
                    </LoginLink>
                </MainBody>
            </div>
        </ThemeProvider>
    );
};

export default Home;
