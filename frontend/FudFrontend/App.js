import React from 'react';
import {
  createSwitchNavigator,
  createAppContainer
} from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack';

import { GoalsScreen } from './Views/goals_view'
import { WeekScreen } from './Views/weekly_view'
import { PreferencesScreen } from './Views/preferences_view'
import { AuthLoadingScreen, SignInScreen } from './Views/sign_in_view'
import { SignUpScreen } from './Views/sign_up_view'
import { DailyScreen } from './Views/daily_view'
import { MonthScreen } from './Views/monthly_view'
import { UserProfileScreen } from './Views/user_profile_view'
import { EditAccountInfoScreen } from './Views/edit_account_info_view'
import { EditGoalsScreen } from './Views/edit_goals_view'
import { ChangePasswordScreen } from './Views/change_password_view'

// Adapted from https://snack.expo.io/@react-navigation/auth-flow-v3

/*
This file sets the routes for stack navigation for the application

AppStack contains the homepage, weekly and monthly views, along with the user profile screen

AuthStack handles user authentication with SignIn and SignUp pages

PreferencesStack allows the user to set their profile preferences

A switch navigator handles navigation between the three stacks and checks for user authorization
*/

const AppStack = createStackNavigator(
  {
    Home: DailyScreen,
    Week: WeekScreen,
    Month: MonthScreen,
    Profile: UserProfileScreen,
    EditAccountInfo: EditAccountInfoScreen,
    EditGoals: GoalsScreen,
    ChangePass: ChangePasswordScreen,
  },
  {
    defaultNavigationOptions: {
      cardStyle: { backgroundColor: '#fff' },
      headerStyle: {
        shadowRadius: 0,
        shadowOffset: {
            height: 0,
        },
      },
    },
  }
);

const AuthStack = createStackNavigator(
  {
    SignIn: SignInScreen,
    SignUp: SignUpScreen,
  },
  {
    defaultNavigationOptions: {
      cardStyle: { backgroundColor: '#fff' },
      headerMode: 'none'
    },
  }
);

const PreferencesStack = createStackNavigator(
  {
    Goals: GoalsScreen,
    Prefs: PreferencesScreen,
  },
  {
    defaultNavigationOptions: {
      cardStyle: { backgroundColor: '#fff' },
      headerStyle: {
        shadowRadius: 0,
        shadowOffset: {
            height: 0,
        },
      },
    },
  }
)

export default createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      App: AppStack,
      Auth: AuthStack,
      Prefs: PreferencesStack,
    },
    {
      initialRouteName: 'AuthLoading',
      defaultNavigationOptions: {
        cardStyle: {
          backgroundColor: '#fff'
        },
        headerStyle: {
          shadowRadius: 0,
          shadowOffset: {
              height: 0,
          },
        },
      },
    }
  )
);
