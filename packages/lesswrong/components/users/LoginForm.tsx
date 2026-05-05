import React, { useCallback, useRef, useState } from 'react';
import { reCaptchaSiteKeySetting, isAF, isEAForum, isWorldDaemons } from '../../lib/instanceSettings';
import { useMutation } from "@apollo/client/react";
import { gql } from '@/lib/generated/gql-codegen';
import { useMessages } from '../common/withMessages';
import { getUserABTestKey } from '../../lib/abTestImpl';
import { useClientId } from '../hooks/useClientId.ts';
import { useLocation } from '../../lib/routeUtil';
import ContentStyles from "../common/ContentStyles";
import ReCaptcha from "../common/ReCaptcha";
import SignupSubscribeToCurated from "./SignupSubscribeToCurated";
import DeferRender from '../common/DeferRender';
import { ErrorLike } from '@apollo/client';
import useCookies from '@/lib/vendor/react-cookie/useCookies.tsx';
import { defineStyles, useStyles } from '../hooks/useStyles.tsx';

const styles = defineStyles('LoginForm', (theme: ThemeType) => ({
  root: {
    wordBreak: "normal",
    padding: 16,
    marginTop: 0,
    marginBottom: 0,
    width: 252
  }, 
  input: {
    font: 'inherit',
    color: 'inherit',
    display: 'block',
    fontSize: '1.2rem',
    marginBottom: 8,
    padding: 8,
    backgroundColor: theme.palette.panelBackground.darken03,
    width: '100%'
  },
  submit: {
    font: 'inherit',
    color: 'inherit',
    background: theme.palette.grey[200],
    display: 'block',
    textTransform: 'uppercase',
    width: '100%',
    height: 32,
    marginTop: 16,
    cursor: 'pointer',
    fontSize: '1rem'
  }, 
  error: {
    padding: 8,
    color: theme.palette.error.main 
  },
  options: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1rem',
    marginTop: 4,
    padding: 4
  },
  oAuthBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    '&.ea-forum': {
      maxWidth: 400,
      justifyContent: 'space-around',
      padding: '8px 20px',
    }
  },
  oAuthComment: {
    textAlign: 'center',
    fontSize: '0.8em',
    margin: 10
  },
  oAuthLink: {
    color: `${theme.palette.text.slightlyDim2} !important`,
    fontSize: '0.9em',
    padding: 6,
    textTransform: 'uppercase'
  },
  primaryBtn: {
    background: theme.palette.primary.main,
    color: `${theme.palette.buttons.primaryDarkText} !important`,
    fontSize: '0.9em',
    padding: '6px 12px',
    textTransform: 'uppercase',
    borderRadius: 4
  },
  toggle: {
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.link.dim,
    }
  },
  daemonStepHeader: {
    ...theme.typography.body2,
    fontStyle: 'italic',
    color: theme.palette.greyAlpha(0.7),
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  }
}))

type possibleActions = "login" | "signup" | "pwReset"

const currentActionToButtonText: Record<possibleActions, string> = {
  login: "Log In",
  signup: "Sign Up",
  pwReset: "Request Password Reset"
}

const LoginForm = ({ startingState = "login", returnTo }: {
  startingState?: possibleActions,
  returnTo?: string
}) => {
  const classes = useStyles(styles);
  const hasSubscribeToCuratedCheckbox = !isEAForum() && !isAF();
  const hasOauthSection = !isEAForum();

  const { pathname } = useLocation()
  const reCaptchaToken = useRef<string|null>(null);
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [daemonName, setDaemonName] = useState<string>("")
  const [daemonSpecies, setDaemonSpecies] = useState<string>("")
  const [inviteCode, setInviteCode] = useState<string>("")
  const { flash } = useMessages();
  const [currentAction, setCurrentAction] = useState<possibleActions>(startingState)
  // For World Daemons, signup is a 2-step flow:
  //   step 1 — email + username + password (the "credentials" step)
  //   step 2 — daemon name + animal manifestation (the "daemon" step)
  // For other forum types, signup is single-step.
  const [signupStep, setSignupStep] = useState<"credentials"|"daemon">("credentials")
  const [subscribeToCurated, setSubscribeToCurated] = useState<boolean>(hasSubscribeToCuratedCheckbox)
  const [_, setCookie] = useCookies(["loginToken"]);
  const wdMode = isWorldDaemons();

  const saveLoginToken = useCallback((token: string) => {
    // The graphql request with a "login" or "signup" mutation returns a login
    // token in the graphql response. It will also use a header to set a cookie,
    // but only if using the non-streaming graphql API, so we have to convert
    // the token into a cookie ourselves.
    setCookie("loginToken", token, {
      maxAge: 315360000,
      path: "/",
    });
  }, [setCookie]);


  const [loginMutation] = useMutation(gql(`
    mutation login($username: String, $password: String) {
      login(username: $username, password: $password) {
        token
      }
    }
  `), { errorPolicy: 'all' })

  const [signupMutation] = useMutation(gql(`
    mutation signup($email: String, $username: String, $password: String, $subscribeToCurated: Boolean, $reCaptchaToken: String, $abTestKey: String, $daemonName: String, $daemonSpecies: String, $inviteCode: String) {
      signup(email: $email, username: $username, password: $password, subscribeToCurated: $subscribeToCurated, reCaptchaToken: $reCaptchaToken, abTestKey: $abTestKey, daemonName: $daemonName, daemonSpecies: $daemonSpecies, inviteCode: $inviteCode) {
        token
      }
    }
  `), { errorPolicy: 'all' })

  const [pwResetMutation] = useMutation(gql(`
    mutation resetPassword($email: String) {
      resetPassword(email: $email)
    }
  `), { errorPolicy: 'all' })

  const [displayedError, setDisplayedError] = useState<string|null>(null);
  const clientId = useClientId();

  const showError = (error: ErrorLike) => {
    setDisplayedError(error.message);
  }
  
  const loginSuccess = useCallback(() => {
    if (returnTo) {
      window.location.href = returnTo;
    } else {
      location.reload()
    }
  }, [returnTo])

  const submitFunction = async (e: AnyBecauseTodo) => {
    e.preventDefault();
    const signupAbTestKey = getUserABTestKey({clientId});

    // For World Daemons, the first signup click advances to the daemon step
    // rather than submitting. Validate credentials + invite code inline first.
    if (currentAction === 'signup' && wdMode && signupStep === 'credentials') {
      if (!email || !username || !password) {
        showError({message: "Email, username and password are all required."});
        return;
      }
      if (!inviteCode.trim()) {
        showError({message: "An invite code is required."});
        return;
      }
      setDisplayedError(null);
      setSignupStep('daemon');
      return;
    }

    if (currentAction === 'login') {
      const { data, error } = await loginMutation({
        variables: { username, password }
      })
      if (error) {
        showError(error);
      }
      if (data?.login?.token) {
        saveLoginToken(data.login.token);
        loginSuccess();
      }
    } else if (currentAction === 'signup') {
      const { data, error } = await signupMutation({
        variables: {
          email, username, password,
          reCaptchaToken: reCaptchaToken.current,
          abTestKey: signupAbTestKey,
          subscribeToCurated,
          daemonName: wdMode ? daemonName.trim() : undefined,
          daemonSpecies: wdMode ? daemonSpecies.trim() : undefined,
          inviteCode: wdMode ? inviteCode.trim() : undefined,
        }
      })
      if (error) {
        showError(error);
      }
      if (data?.signup?.token) {
        saveLoginToken(data.signup.token);
        loginSuccess();
      }
    } else if (currentAction === 'pwReset') {
      const { data, error } = await pwResetMutation({
        variables: { email }
      })
      if (error) {
        showError(error);
      }
      if (data?.resetPassword) {
        flash(data?.resetPassword)
      }
    }
  }

  const oauthReturnTo = encodeURIComponent(returnTo ?? pathname);

  return <ContentStyles contentType="commentExceptPointerEvents">
    {reCaptchaSiteKeySetting.get() && <DeferRender ssr={false}>
      <ReCaptcha verifyCallback={(token) => reCaptchaToken.current = token} action="login/signup"/>
    </DeferRender>}
    <form className={classes.root} onSubmit={submitFunction}>
      {/* Step 1 (credentials) — shown for login, password reset, and the
          first stage of signup. Hidden during step 2 of WorldDaemons signup. */}
      {(currentAction === "pwReset" || (currentAction === "signup" && (!wdMode || signupStep === "credentials"))) &&
        <input value={email} type="text" name="email" placeholder="email" className={classes.input} onChange={event => setEmail(event.target.value)} />}
      {(currentAction === "login" || (currentAction === "signup" && (!wdMode || signupStep === "credentials"))) && <>
        <input
          value={username} type="text" name="username"
          autoComplete="username"
          placeholder={currentAction === "signup" ? "username" : "username or email"}
          className={classes.input}
          onChange={event => setUsername(event.target.value)}
        />
        <input
          value={password} type="password" name="password"
          autoComplete={currentAction==="signup" ? "new-password" : "current-password"}
          placeholder={(currentAction==="signup") ? "create password" : "password"}
          className={classes.input}
          onChange={event => setPassword(event.target.value)}
        />
      </>}
      {/* Invite code on credentials step for WorldDaemons signup. */}
      {currentAction === "signup" && wdMode && signupStep === "credentials" && (
        <input
          value={inviteCode} type="text" name="inviteCode"
          placeholder="invite code"
          className={classes.input}
          onChange={event => setInviteCode(event.target.value)}
        />
      )}
      {/* Step 2 (daemon) — only for WorldDaemons signup, shown after step 1. */}
      {currentAction === "signup" && wdMode && signupStep === "daemon" && <>
        <div className={classes.daemonStepHeader}>
          Now name your daemon and pick its animal manifestation.
        </div>
        <input
          value={daemonName} type="text" name="daemonName"
          placeholder="your daemon's name (e.g. Pantalaimon)"
          className={classes.input}
          onChange={event => setDaemonName(event.target.value)}
        />
        <input
          value={daemonSpecies} type="text" name="daemonSpecies"
          placeholder="your daemon's animal (e.g. pine marten)"
          className={classes.input}
          onChange={event => setDaemonSpecies(event.target.value)}
        />
      </>}
      <input
        type="submit"
        className={classes.submit}
        value={
          currentAction === "signup" && wdMode && signupStep === "credentials"
            ? "Sign Up"
            : currentAction === "signup" && wdMode && signupStep === "daemon"
            ? "Enter the world"
            : currentActionToButtonText[currentAction]
        }
      />
      
      {currentAction === "signup" && hasSubscribeToCuratedCheckbox &&
        <SignupSubscribeToCurated defaultValue={subscribeToCurated} onChange={(checked: boolean) => setSubscribeToCurated(checked)} />
      }
      <div className={classes.options}>
        {currentAction !== "login" && <span className={classes.toggle} onClick={() => setCurrentAction("login")}> Log In </span>}
        {currentAction !== "signup" && <span className={classes.toggle} onClick={() => setCurrentAction("signup")}> Sign Up </span>}
        {currentAction !== "pwReset" && <span className={classes.toggle} onClick={() => setCurrentAction("pwReset")}> Reset Password </span>}
      </div>
      {hasOauthSection && <>
        <div className={classes.oAuthComment}>...or continue with</div>
        <div className={classes.oAuthBlock}>
          <a className={classes.oAuthLink} href={`/auth/google?returnTo=${oauthReturnTo}`}>GOOGLE</a>
          <a className={classes.oAuthLink} href={`/auth/github?returnTo=${oauthReturnTo}`}>GITHUB</a>
        </div>
      </>}
      {displayedError && <div className={classes.error}>{displayedError}</div>}
    </form>
  </ContentStyles>;
}

export default LoginForm;


