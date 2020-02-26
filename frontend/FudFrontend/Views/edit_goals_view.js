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
This view lets users view and edit their physical information (age, height,
weight, etc.), their goals (bulk, cut, etc.), and their dietary restrictions
(vegetarian, nut-free, etc.).
*/

export class EditGoalsScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        user_id: null,
      };
    }

    static navigationOptions = {
      title: 'View & Edit Fitness Goals',
    };

    render() {

      return (
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView>
            <View style={styles.container}>
                <Text style={styles.central_header_text}>
                  Your Physical Goals and Dietary Restrictions
                </Text>
                <Text style={styles.left_align_subheader_text}>
                  (NOTE: Just copy and paste Goals View code once that is
                  finalized, but make it route back to User Profiles
                  instead of Preferences.)
                </Text>
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      );
    }
  }
