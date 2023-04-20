import { useEffect, useState } from "react";
import { Text, View, Linking, Button } from "react-native";

import { Amplify, Auth, Hub } from "aws-amplify";
import awsconfig from "./aws-exports";
import { CognitoUser } from "amazon-cognito-identity-js";
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';


Amplify.configure(awsconfig);

export default function App() {
  const [user, setUser] = useState<CognitoUser>();
  const [customState, setCustomState] = useState(null);

  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          setUser(data);
          break;
        case "signOut":
          setUser(undefined);
          break;
        case "customOAuthState":
          setCustomState(data);
      }
    });

    Auth.currentAuthenticatedUser()
      .then(currentUser => {
        setUser(currentUser)
      })
      .catch(() => console.log("Not signed in"));

    return unsubscribe;
  }, []);

  console.log("customState", user?.getUserAttributes((err, result) => {
    if (err) {
      console.log('error inside getUserAttributes', err)
    } else {
      console.log('result inside getUserAttributes', result, user)
    }
  }))

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
    }}>
      <Button
        title="Open Amazon"
        onPress={() => {
          // @ts-ignore
          Auth.federatedSignIn({
            provider: CognitoHostedUIIdentityProvider.Google,
          })
        }}
      />
      <Button title="Open Hosted UI" onPress={() => Auth.federatedSignIn()} />
      <Button title="Sign Out" onPress={() => {
        Auth.signOut({ global: true })
      }} />
      <Text>{user && user.getUsername()}</Text>
    </View>
  );
}