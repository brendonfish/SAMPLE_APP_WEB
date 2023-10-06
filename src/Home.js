import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
const StyledContainer = styled.div`
  display: flex;
  height: 100%;
  padding-top: 15vh;
  padding-bottom: 15vh;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
`;

const Home = () => (
  <StyledContainer>
    <Link to="/sign-in"><button>Sign In</button></Link>
    <Link to="/sign-up"><button>Sign Up</button></Link>
    <Link to="/password-change"><button>Password Change</button></Link>
    <Link to="/lost-password"><button>Lost Password</button></Link>
    <Link to="/sample-registration"><button>Device Registration</button></Link>
  </StyledContainer>
);

export default Home;
