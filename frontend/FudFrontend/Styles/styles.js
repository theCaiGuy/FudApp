import React from 'react';
import {
  StyleSheet,
} from 'react-native';
import Constants from 'expo-constants';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'stretch',
      justifyContent: 'center',
    },
    info_item: {
      backgroundColor: '#3b821b',
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
    },
    title: {
      fontSize: 28,
      color: 'white',
    },
    detail: {
      fontSize: 16,
      color: 'white',
      marginVertical: 3,
    },
    daily_list: {
      flex: 1,
    },
    button: {
      marginBottom: 30,
      width: 260,
      alignItems: 'center',
      backgroundColor: '#2196f3'
    },
    welcome: {
      fontSize: 28,
      color: 'black',
      textAlign: 'center',
      margin: 20
    },
    sign_in_button: {
      backgroundColor: '#3b821b',
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
      alignItems: 'center',
    },
    sign_up_button: {
      backgroundColor: '#3b821b',
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
      alignItems: 'center',
    },
    profile_text_input:{ 
      height: 40, 
      borderColor: 'gray', 
      borderWidth: 1,
      marginHorizontal: 16,
      marginVertical: 8,
    },
    logo: {
      alignSelf: 'center',
      marginVertical: 30
    },
    sign_in_container: {
      flex: 1,
      alignItems: 'stretch',
      marginVertical: 0,
    }
  });

export { styles }