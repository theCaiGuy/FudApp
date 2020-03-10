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
DEPRECATED!!
This view lets users view and edit their food preferences of proteins, carbs,
fats, etc. for the purposes better meal generation.
*/

export class EditPreferencesScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        user_id: null,
      };
    }

    static navigationOptions = {
      title: 'View & Edit Food Preferences',
    };

    render() {

      return (
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView>
            <View style={styles.container}>
                <Text style={styles.central_header_text}>
                  Your Food Preferences
                </Text>
                <Text style={styles.left_align_subheader_text}>
                  (NOTE: Just copy and paste Preferences View code once that is
                  finalized, but make it route back to User Profiles
                  instead of Daily View.)
                </Text>
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      );
    }
  }
