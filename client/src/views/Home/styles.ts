import styled from 'styled-components';

export const MainBody = styled.section`
    height: calc(100vh - 184px);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

export const MainTitle = styled.h1`
    text-align: center;
    font-size: 3em;
    font-weight: 600;
    margin-bottom: 0;
`;

export const SubTitle = styled.h4`
    text-align: center;
    font-size: 1.75em;
    font-weight: 400;
    color: grey;
    margin-bottom: 1%;
`;

export const By = styled.h6`
    text-align: center;
    font-size: 1.75em;
    font-weight: 400;
    color: grey;
    margin-bottom: 5%;
`;

export const Text = styled.p`
    text-align: center;
    font-size: 1em;
    color: grey;
`;
