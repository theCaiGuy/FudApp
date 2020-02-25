import React from 'react';
import {
  AsyncStorage,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import { styles } from '../Styles/styles'
import {
  Button,
  ButtonGroup,
  Input,
} from 'react-native-elements'
import { API_PATH } from '../assets/constants'
import {encode as btoa} from 'base-64'

/*
This view serves as a place for users to view and edit any of the information
they have given us, including their account info (username, password, etc.),
fitness goals, current physical state, dietary restrictions + preferences, etc.
This will also be the page from which users can sign out of the app.

TODO:
(1) Determine a clear flow with the rest of the app.
(2) Figure out all the routing. 
*/

export class UserProfileScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        user_id: null,
      };
    }

    render() {

      return (
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView>
            <View style={styles.container}>
                <Text style={styles.central_header_text}>User Profile Page</Text>
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      );
    }

  }
