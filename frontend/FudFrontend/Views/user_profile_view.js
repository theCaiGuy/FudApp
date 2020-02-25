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
