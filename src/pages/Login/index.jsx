import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Redirect, Link } from 'react-router-dom';

import firebase from 'firebase.js';
import { auth, setPassword, authCleanUp } from 'state/actions/auth';
import { useChangeHandler, useFormatMessage } from 'hooks';
import { inputValidations } from 'utils';
import paths from '../Router/paths';
import classes from './Login.module.scss';

const Login = () => {
  const { error, isAuth, loading, locale } = useSelector(
    state => ({
      error: state.auth.error,
      isAuth: !!state.auth.userData.id,
      loading: state.auth.loading,
      locale: state.preferences.locale
    }),
    shallowEqual
  );

  const dispatch = useDispatch();

  const [authData, setAuthData] = useState({
    email: '',
    password: ''
  });

  const onChangeHandler = useChangeHandler(setAuthData);

  useEffect(() => {
    document.documentElement.classList.remove(
      'has-aside-left',
      'has-navbar-fixed-top'
    );
    return () => {
      document.documentElement.classList.add(
        'has-aside-left',
        'has-navbar-fixed-top'
      );
      dispatch(authCleanUp());
    };
  }, [dispatch]);

  const isEmailLink = firebase
    .auth()
    .isSignInWithEmailLink(window.location.href);

  // const isEmailLink = firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
  //     var errorCode = error.code;
  //     var errorMessage = error.message;
  //     // ...
  // });
  const onSubmitHandler = event => {
    event.preventDefault();
    if (isEmailLink) {
      dispatch(
        setPassword(authData.email, authData.password, window.location.href)
      );
    } else {
      dispatch(auth(authData.email, authData.password));
    }
  };

  const modifierLoading = loading && 'is-loading';

  const inputs = isEmailLink
    ? inputValidations(authData.email, authData.password, locale)
    : {
        email: {
          modifier: null,
          message: null
        },
        password: {
          modifier: null,
          message: null
        },
        canSubmit: false
      };

  const redirect = isAuth && <Redirect to={paths.ROOT} />;

  const setNewPasswordMessage = useFormatMessage('Login.setNewPassword');

  const loginMessage = useFormatMessage('Login.login');

  const setPasswordMessage = useFormatMessage('Login.setPassword');

  const forgotPasswordMessage = useFormatMessage('Login.forgotPassword');

  return (
    <section className="section hero is-fullheight is-error-section">
      {redirect}
      {console.log("isAuth====",isAuth)}
      <div className="hero-body">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-two-fifths">
              <div className="card has-card-header-background">
                <header className="card-header">
                  <p className="card-header-title">
                    <span className="icon">
                      <i className="mdi mdi-lock default" />
                    </span>
                    <span>
                      {isEmailLink ? setNewPasswordMessage : loginMessage}
                    </span>
                  </p>
                </header>
                <div className="card-content">
                  <form onSubmit={onSubmitHandler}>
                    <div className="field">
                      <p className="label">{useFormatMessage('Login.email')}</p>
                      <div className="control is-clearfix">
                        <input
                          className={`input ${inputs.email.modifier}`}
                          type="email"
                          name="email"
                          required
                          value={authData.email}
                          onChange={onChangeHandler}
                        />
                      </div>
                      {inputs.email.message && (
                        <p className={`help ${inputs.email.modifier}`}>
                          {inputs.email.message}
                        </p>
                      )}
                    </div>
                    <div className="field">
                      <p className="label">
                        {useFormatMessage('Login.password')}
                      </p>
                      <div className="control is-clearfix">
                        <input
                          className={`input ${inputs.password.modifier}`}
                          type="password"
                          name="password"
                          required
                          value={authData.password}
                          onChange={onChangeHandler}
                        />
                      </div>
                      {inputs.password.message && (
                        <p className={`help ${inputs.password.modifier}`}>
                          {inputs.password.message}
                        </p>
                      )}
                    </div>
                    <hr />
                    <div className="field is-grouped">
                      <div className="control">
                        <button
                          type="submit"
                          className={`button is-black ${modifierLoading}`}
                          disabled={isEmailLink ? !inputs.canSubmit : false}
                        >
                          {isEmailLink ? setPasswordMessage : loginMessage}
                        </button>
                      </div>
                      {!isEmailLink && (
                        <div className="control">
                          <Link
                            to={paths.RESET_PASSWORD}
                            className="button is-outlined"
                          >
                            {forgotPasswordMessage}
                          </Link>
                        </div>
                      )}
                    </div>
                    {error && (
                      <p className={`has-text-danger ${classes.errorMessage}`}>
                        {error}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
