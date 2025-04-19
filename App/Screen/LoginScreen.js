import { View, Text, Image, TouchableOpacity, Modal, TextInput, Alert } from 'react-native'
import React, { useState } from 'react'
import * as WebBrowser from "expo-web-browser";
import app from './../../assets/images/app.png'
import Colors from '../Utils/Colors'
import { useOAuth } from "@clerk/clerk-expo";

import google from './../../assets/images/google.png'
import { useWarmUpBrowser } from '../../hooks/warmUpBrowser';
import AdminPage from './AdminPage'; // Import the AdminPage component

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    useWarmUpBrowser();
 
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Admin credentials stored in an array
  const adminCredentials = [
    {
      email: "admin123@gmail.com",
      password: "123456"
    }
  ];
 
  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();
 
      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);
  
  const handleAdminLogin = () => {
    // Find admin with matching credentials
    const admin = adminCredentials.find(
      admin => admin.email === email && admin.password === password
    );
    
    if (admin) {
      setModalVisible(false);
      setIsAdminLoggedIn(true);
    } else {
      Alert.alert("Login Failed", "Invalid email or password");
    }
  };

  // If admin is logged in, show the admin page
  if (isAdminLoggedIn) {
    return <AdminPage onLogout={() => setIsAdminLoggedIn(false)} />;
  }

  // Otherwise show the login screen
  return (
    <View style={{display:'flex',alignItems:'center'}}>
      <Image source={app}
        style={{width:250,height:500,
          objectFit:'contain',marginTop:70}} />
      <View style={{
        height:400,
        backgroundColor:Colors.PRIMARY,
        width:'100%',
        marginTop:-100,
        padding:20
      }}>
        <Text style={{textAlign:'center',
          fontSize:35,color:Colors.WHITE,
          fontFamily:'outfit-bold',marginTop:30}}>CODEBOX</Text>
        <Text style={{textAlign:'center',
          fontSize:20,marginTop:20,
          color:Colors.LIGHT_PRIMARY,
          fontFamily:'outfit'}}>Your Ultimate Programming Learning Box</Text>
        
        <TouchableOpacity 
          onPress={onPress}
          style={{backgroundColor:Colors.WHITE,
            display:'flex',flexDirection:'row',
            alignItems:'center',gap:10,
            justifyContent:'center',
            padding:10,
            borderRadius:99,marginTop:25}}>
          <Image source={google} 
            style={{width:40,height:40}}/>
          <Text style={{fontSize:20,
            color:Colors.PRIMARY,
            fontFamily:'outfit'}}>Sign In with Google</Text>
        </TouchableOpacity>
        
        {/* Admin Login Button */}
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          style={{backgroundColor:Colors.LIGHT_PRIMARY,
            display:'flex',flexDirection:'row',
            alignItems:'center',
            justifyContent:'center',
            padding:10,
            borderRadius:99,marginTop:15}}>
          <Text style={{fontSize:18,
            color:Colors.WHITE,
            fontFamily:'outfit'}}>Admin Login</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Login Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            width: '80%',
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 20,
            alignItems: 'center',
            elevation: 5
          }}>
            <Text style={{
              fontSize: 22,
              fontFamily: 'outfit-bold',
              marginBottom: 20
            }}>Admin Login</Text>
            
            <TextInput
              style={{
                width: '100%',
                height: 50,
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 5,
                marginBottom: 15,
                paddingHorizontal: 10
              }}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={{
                width: '100%',
                height: 50,
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 5,
                marginBottom: 20,
                paddingHorizontal: 10
              }}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%'
            }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#ccc',
                  padding: 10,
                  borderRadius: 5,
                  width: '45%',
                  alignItems: 'center'
                }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{fontFamily: 'outfit-medium'}}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.PRIMARY,
                  padding: 10,
                  borderRadius: 5,
                  width: '45%',
                  alignItems: 'center'
                }}
                onPress={handleAdminLogin}
              >
                <Text style={{color: 'white', fontFamily: 'outfit-medium'}}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}


