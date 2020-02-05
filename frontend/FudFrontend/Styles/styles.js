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
      marginButtom: 30,
      width: 260,
      alignItems: 'center',
      backgroundColor: '#2196f3'
    }
  });

export { styles }