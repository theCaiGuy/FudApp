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
email, etc. It also includes a button that lets them change their password.
*/

export class EditAccountInfoScreen extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        user_id: null,
        name: null,
        email: null,
      };
    }

    static navigationOptions = {
      title: 'View & Edit Account Info',
    };

    componentDidMount() {
      return AsyncStorage.getItem('userToken').then((token) => {
        fetch(`http://${API_PATH}/api/users/get_name`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${token}:`)}`
          },
        })
        .then((response) => {
          if (response.status === 401) {
            AsyncStorage.removeItem('userToken').then(() => {
              this.props.navigation.navigate('Auth');
              return;
            });
          }
          if (response.status === 400) {
            {/*
              TODO: Handle 400 response better
            */}
            console.log(response);
            return;
          }
          response.json().then((responseJson) => {
            this.setState({
              name: responseJson['name'],
            });
            console.log(`Recieved response ${JSON.stringify(responseJson)}`);
          });

        })
        fetch(`http://${API_PATH}/api/users/get_email`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${token}:`)}`
          },
        })
        .then((response2) => {
          if (response2.status === 401) {
            AsyncStorage.removeItem('userToken').then(() => {
              this.props.navigation.navigate('Auth');
              return;
            });
          }
          if (response2.status === 400) {
            {/*
              TODO: Handle 400 response better
            */}
            console.log(response2);
            return;
          }
          response2.json().then((responseJson2) => {
            this.setState({
              email: responseJson2['email'],
            });
            console.log(`Recieved response ${JSON.stringify(responseJson2)}`);
          });

        })
      }).catch((error) => {
        console.error(error);
      });

      // return AsyncStorage.getItem('userToken').then((token) => {
      //   Promise.all([
      //     fetch(`http://${API_PATH}/api/users/get_name`, {
      //       method: 'POST',
      //       headers: {
      //         Accept: 'application/json',
      //         'Content-Type': 'application/json',
      //         'Authorization': `Basic ${btoa(`${token}:`)}`
      //       },
      //     }),
      //     fetch(`http://${API_PATH}/api/users/get_email`, {
      //       method: 'POST',
      //       headers: {
      //         Accept: 'application/json',
      //         'Content-Type': 'application/json',
      //         'Authorization': `Basic ${btoa(`${token}:`)}`
      //       },
      //     })
      //   ]).then(([response, response2]) => {
      //     // console.log(response.json());
      //     // console.log(response2.json());
      //     if (response.status === 401 || response2.status === 401) {
      //       AsyncStorage.removeItem('userToken').then(() => {
      //         this.props.navigation.navigate('Auth');
      //         return;
      //       });
      //     }
      //     if (response.status === 400 || response2.status === 400) {
      //       {/*
      //         TODO: Handle 400 response better
      //       */}
      //       return;
      //     }
      //     [response.json(), response2.json()].then(([responseJson, responseJson2]) => {
      //       this.setState({
      //         name: responseJson['name'],
      //         email: responseJson2['email'],
      //       });
      //       console.log(`Recieved response ${JSON.stringify(responseJson)}`);
      //       console.log(`Recieved response ${JSON.stringify(responseJson2)}`);
      //     });
      //   });
      // }).catch((error) => {
      //   console.error(error);
      // });
    }

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
                  defaultValue={(this.state.name) ? String(this.state.name) : ""}
                />

                <Input
                  label = {"Email"}
                  labelStyle={styles.profile_text_input_label}
                  containerStyle={styles.profile_text_input}
                  placeholder = 'Your Email Address'
                  onChangeText = {(text) => this.setState({email: text})}
                  defaultValue={(this.state.email) ? String(this.state.email) : ""}
                />

                <Button
                  title="Submit Changes"
                  onPress={this._submitChangesAsync}
                  buttonStyle={styles.nav_button}
                  titleStyle={styles.central_subheader_text}
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

    _submitChangesAsync = async () => {
      let name = this.state.name;
      let email = this.state.email;
      return AsyncStorage.getItem('userToken').then((token) => {
        Promise.all([
          fetch(`http://${API_PATH}/api/users/change_name`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Basic ${btoa(`${token}:`)}`
            },
            body: JSON.stringify({"name": name})
          }),
          fetch(`http://${API_PATH}/api/users/change_email`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Basic ${btoa(`${token}:`)}`
            },
            body: JSON.stringify({"email": email})
          })
        ]).then(([response, response2]) => {
          if (response.status === 401 || response2.status === 401) {
            AsyncStorage.removeItem('userToken').then(() => {
              this.props.navigation.navigate('Auth');
              return;
            });
          }
          if (response.status === 400 || response2.status === 400) {
            {/*
              TODO: Handle 400 response better
            */}
            return;
          }
          console.log(`New name ${name}`);
          console.log(`New email ${email}`);
          this.props.navigation.navigate('Profile');
        });
      }).catch((error) => {
        console.error(error);
      });
    };

    _changePasswordAsync = () => {
      this.props.navigation.navigate('ChangePass');
    };
  }
