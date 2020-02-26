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
This view lets users view and edit their basic account information such as name,
username, email, etc. It also includes a button that lets them change their
password.
*/

export class EditAccountInfoScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        user_id: null,
        name: null,
        username: null,
      };
    }

    static navigationOptions = {
      title: 'View & Edit Account Info',
    };

    render() {

      // CHANGE ALL DEFAULT VALUES TO BE THE VALUES FROM ComponentDidMount()
      return (
        <SafeAreaView style={styles.container}>
          <KeyboardAwareScrollView>
            <View style={styles.container}>
                <Text style={styles.central_header_text}>Your Account Information</Text>

                <Input
                  label = {"Name"}
                  labelStyle={styles.profile_text_input_label}
                  containerStyle={styles.profile_text_input}
                  placeholder = 'Your Name'
                  onChangeText = {(text) => this.setState({name: text})}
                  defaultValue={""}
                />

                <Input
                  label = {"Username"}
                  labelStyle={styles.profile_text_input_label}
                  containerStyle={styles.profile_text_input}
                  placeholder = 'Your Username'
                  onChangeText = {(text) => this.setState({username: text})}
                  defaultValue={""}
                />

                <Button
                  title="Change Password"
                  onPress={this._changePasswordAsync}
                  buttonStyle={styles.nav_button}
                  titleStyle={styles.central_subheader_text}
                />

            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      );
    }

    _changePasswordAsync = () => {
      this.props.navigation.navigate('ChangePass');
    };
  }
