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
    },
    meal_date_item: {
      backgroundColor: '#3b821b',
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginVertical: 8,
      marginHorizontal: 16,
    },
    central_header: {
      alignItems: 'center'
    },
    central_header_text: {
      fontSize: 28,
      textAlign: 'center',
      marginTop: 20,
    },
    central_subheader_text: {
      fontSize: 20,
      textAlign: 'center',
      marginTop: 5,
      marginBottom: 5,
    },
    meal_date: {
      fontSize: 20,
      color: '#fff'
    },
    meal_item: {
      backgroundColor: '#3b821b',
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    meal_item_text: {
      color: '#fff'
    },
    meal: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    radioform_style: {
      marginHorizontal: 10,
    },
    separator: {
      marginVertical: 8,
      borderBottomColor: '#737373',
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    text_subcontainer: {
      marginHorizontal: 10
    },
    menu_style: {
      marginVertical: 10,
      marginHorizontal: 10,
      flex: 1,
      alignItems: 'center',
    },
    goal_selection_button: {
      backgroundColor: '#3b821b',
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
      alignItems: 'center',
    },
    goal_selection_text: {
      fontSize: 20,
      textAlign: 'center',
      marginTop: 5,
      marginBottom: 5,
      color: 'white'
    },
  });

export { styles }