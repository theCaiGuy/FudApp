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
      backgroundColor: '#419A1C',
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
    }
  });

export { styles }