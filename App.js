import React, { useState, useEffect } from 'react';
import { View, Text, PermissionsAndroid, Button, TextInput } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import firebase from 'firebase';

const App = () => {
  const [location, setLocation] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can access the location');
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      position => {
        setLocation(position.coords);
        setLoading(false);
        // console.log('App.js getCurrentLocation callled1111 and location was set to: ', location);
      },
      error => {
        setError(error.message);
        setLoading(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  useEffect(() => {
    console.log(location);
    storeLocation();
  }, [location]);
  

  const storeLocation = () => {
    if (!location.latitude || !location.longitude) {
      return console.log('Location not available');
    }

    // Get the current user's ID
    const userId = firebase.auth().currentUser.uid;

    // Set the location data for the current user
    firebase.database().ref(`locations/${userId}`).set({
      latitude: location.latitude,
      longitude: location.longitude
    });
  }

  useEffect(() => {
  requestLocationPermission();
  // Initialize Firebase
  firebase.initializeApp({
    apiKey: 'AIzaSyAtz6RUaAkK3cPUeU_YpERhawWhioODBbA',
    authDomain: '170555641205-902ub0ldtkslbu2hqrs9nbciamqlretv.apps.googleusercontent.com',
    databaseURL: 'https://hatzola-fd503-default-rtdb.firebaseio.com',
    projectId: 'hatzola-fd503',
    storageBucket: 'hatzola-fd503.appspot.com',
    messagingSenderId: '170555641205',
    appId: '1:170555641205:android:91add776cd7eb891fd973c'
  });

  // Get the current location immediately upon startup
  // getCurrentLocation();
  // console.log('App.js useEffect callled and location was set to: ', location);
}, []);


  const signInWithEmailAndPassword = (email, password) => {
    firebase.auth().signInWithEmailAndPassword(email, password).catch((error) => {
      // Handle errors here
      console.error(error);
    });
  }

  const signUpWithEmailAndPassword = (email, password) => {
    firebase.auth().createUserWithEmailAndPassword(email, password).catch((error) => {
      // Handle errors here
      console.error(error);
    });
  }

  const checkData = () => {
    const userId = firebase.auth().currentUser.uid;
    // Get the location data for the current user
    firebase.database().ref(`locations/${userId}`).once('value')
      .then(snapshot => {
        const location = snapshot.val();
        console.log(location);
      })
      .catch(error => {
        console.error(error);
      });
  }

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    // Start getting the location every 10 seconds
    setInterval(() => {
      getCurrentLocation();
    }, 10000);

    return () => unsubscribe();
  }, [user]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {user ? (
        <>
          <Text>Welcome, {user.email}</Text>
          <Button title="Check data" onPress={checkData} />
          <Button title="Sign out" onPress={() => firebase.auth().signOut()} />
        </>
      ) : (
        <>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            style={{ width: 200, height: 40, borderWidth: 1 }}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={{ width: 200, height: 40, borderWidth: 1 }}
          />
          <Button title="Sign in" onPress={() => signInWithEmailAndPassword(email, password)} />
          <Button title="Sign up" onPress={() => signUpWithEmailAndPassword(email, password)} />
        </>
      )}
      {loading && <Text>Loading</Text>}
      {error && <Text>Error: {error}</Text>}
      {location.latitude && (
        <Text>
          Location: {location.latitude}, {location.longitude}
        </Text>
      )}
    </View>
  );  
};

export default App;
