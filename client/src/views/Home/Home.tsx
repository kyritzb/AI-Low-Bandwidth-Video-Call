import React from 'react';
//react-router
import { Link } from 'react-router-dom';
//material-ui
import { ThemeProvider, createMuiTheme, Button } from '@material-ui/core';
import { green, blue } from '@material-ui/core/colors';
//styles
import styled from 'styled-components';
import { MainBody, MainTitle, SubTitle, By } from './styles';
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
                    <By>By Bryan Kyritz, Andrew D’angelo, and Amein Almoughrabi</By>
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
