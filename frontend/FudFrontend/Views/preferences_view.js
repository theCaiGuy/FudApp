import React from 'react';
import {
  StatusBar,
  AsyncStorage,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { styles } from '../Styles/styles'

const PROTEIN_DATA = [
  {
    id: '1',
    title: 'Chicken',
    clicked: 0,
  },
  {
    id: '2',
    title: 'Turkey',
    clicked: 1,
  },
  {
    id: '3',
    title: 'Steak',
    clicked: 0,
  },
  {
    id: '4',
    title: 'Egg Whites',
    clicked: 1,
  },
  {
    id: '5',
    title: 'Salmon',
    clicked: 0,
  },
  {
    id: '6',
    title: 'Tofu',
    clicked: 0,
  },
];
const CARB_DATA = [
  {
    id: '1',
    title: 'Brown Rice',
    clicked: 1,
  },
  {
    id: '2',
    title: 'Pasta',
    clicked: 0,
  },
  {
    id: '3',
    title: 'Bread',
    clicked: 0,
  },
  {
    id: '4',
    title: 'White Rice',
    clicked: 0,
  },
  {
    id: '5',
    title: 'Candy',
    clicked: 0,
  },
  {
    id: '6',
    title: 'Sweet Potato',
    clicked: 1,
  },
];
const FAT_DATA = [
  {
    id: '1',
    title: 'Peanut Butter',
    clicked: 0,
  },
  {
    id: '2',
    title: 'Olive Oil',
    clicked: 1,
  },
  {
    id: '3',
    title: 'Avacado',
    clicked: 1,
  },
  {
    id: '4',
    title: 'Butter',
    clicked: 0,
  },
  {
    id: '5',
    title: 'Cheese',
    clicked: 0,
  },
  {
    id: '6',
    title: 'Dark Chocolate',
    clicked: 0,
  },
];

function Item({ title, clicked }) {
  return (
    <View style={clicked===0?local_styles.item1:local_styles.item2}>
      <Text style={local_styles.title}>{title}</Text>
    </View>
  );
}

export class PreferencesScreen extends React.Component {
    static navigationOptions = {
      title: 'Set Food Preferences',
    };


    render() {
      return (
        <SafeAreaView style={styles.container}>
          <Text style={styles.central_subheader_text}>Protein</Text>
          <FlatList
            data={PROTEIN_DATA}
            renderItem={({item}) =>
              <TouchableOpacity onPress={() => item.clicked=1} >
                <Item title={item.title} clicked={item.clicked} />
              </TouchableOpacity>
            }
            keyExtractor={item => item.id}
          />

          <Text style={styles.central_subheader_text}>Carbs</Text>
          <FlatList
            data={CARB_DATA}
            renderItem={({item}) =>
              <TouchableOpacity onPress={() => item.clicked=1} >
                <Item title={item.title} clicked={item.clicked} />
              </TouchableOpacity>
            }
            keyExtractor={item => item.id}
          />

          <Text style={styles.central_subheader_text}>Fats</Text>
          <FlatList
            data={FAT_DATA}
            renderItem={({item}) =>
              <TouchableOpacity onPress={() => item.clicked=1} >
                <Item title={item.title} clicked={item.clicked} />
              </TouchableOpacity>
            }
            keyExtractor={item => item.id}
          />
          <Button title="Generate Meals" onPress={this._showMoreApp} />
          <StatusBar barStyle="default" />
        </SafeAreaView>
      );
    }

    _showMoreApp = () => {
      this.props.navigation.navigate('Detail');
    };

    _setGenerateMealsAsync = () => {
        this.props.navigation.navigate('App');
      };

    _goToMainAsync = () => {
        this.props.navigation.navigate('App');
      };
  }

const local_styles = StyleSheet.create({
  item1: {
    backgroundColor: '#419A1C',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  item2: {
    backgroundColor: '#00FF00',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 16,
  },
});
