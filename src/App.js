import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';

// providers
import I18n from './i18n';

// routes
import Home from './Home';
import SignIn from './scenes/SignIn';
import SignUp from './scenes/SignUp';
import LostPassword from './scenes/LostPassword';
import PasswordReset from './scenes/PasswordReset';
import PasswordChange from './scenes/PasswordChange';
import EditProfile from './scenes/EditProfile';
import DeviceRegistration from './scenes/DeviceRegistration';

const StyledContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 1.25;
  color: #2b2b2b;
  font-size: .875rem;
  font-family: "Helvetica", "儷黑 Pro", "LiHei Pro", "微軟正黑體", "Microsoft JhengHei", sans-serif;
  background: #fff;
  overflow: hidden;
`;

const App = () => (
  <StyledContainer>
    <I18n>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/sign-in" component={SignIn} />
          <Route exact path="/sign-up" component={SignUp} />
          <Route exact path="/edit-profile" component={EditProfile} />
          <Route exact path="/lost-password" component={LostPassword} />
          <Route exact path="/password-reset" component={PasswordReset} />
          <Route exact path="/password-change" component={PasswordChange} />
          <Route exact path="/device-registration" component={DeviceRegistration} />
          {/* <Route component={NoMatch} /> */}
        </Switch>
      </BrowserRouter>
    </I18n>
  </StyledContainer>
);

export default App;
