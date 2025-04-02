import { View, Text, FlatList, Image, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { GetAllUsers, getUserQuizAttempts } from '../Services'
import Colors from '../Utils/Colors';
import Gold from './../../assets/images/gold-medal.png'
import Silver from './../../assets/images/silver-medal.png'
import Bronze from './../../assets/images/bronze-medal.png'

export default function LeaderBoard() {
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall'); // 'overall' or 'quizzes'

  useEffect(() => {
    fetchLeaderboardData();
  }, [activeTab]);

  const fetchLeaderboardData = async () => {
    setIsLoading(true);
    try {
      const resp = await GetAllUsers();
      if (resp && resp.userDetails) {
        // Sort users by points (already done by the query with orderBy: point_DESC)
        setUserList(resp.userDetails);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      setIsLoading(false);
    }
  };

  const renderMedal = (index) => {
    if (index < 3) {
      return (
        <Image 
          source={index === 0 ? Gold : index === 1 ? Silver : Bronze}
          style={{width: 40, height: 40}}
        />
      );
    }
    return null;
  };

  // Default profile image to use when none is available
  const defaultProfileImage = 'https://via.placeholder.com/60';

  return (
    <View style={{flex: 1}}>
      <View style={{
        height: 160,
        backgroundColor: Colors.PRIMARY,
        padding: 30,
      }}>
        <Text style={{
          fontFamily: 'outfit-bold',
          color: Colors.WHITE,
          fontSize: 30
        }}>LeaderBoard</Text>
        
        {/* Tab selector */}
        <View style={{
          flexDirection: 'row',
          marginTop: 15,
          backgroundColor: Colors.LIGHT_PRIMARY,
          borderRadius: 10,
          padding: 5,
        }}>
          <TouchableOpacity 
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 8,
              backgroundColor: activeTab === 'overall' ? Colors.WHITE : 'transparent',
              alignItems: 'center'
            }}
            onPress={() => setActiveTab('overall')}
          >
            <Text style={{
              fontFamily: 'outfit-medium',
              color: activeTab === 'overall' ? Colors.PRIMARY : Colors.WHITE
            }}>Overall Points</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 8,
              backgroundColor: activeTab === 'quizzes' ? Colors.WHITE : 'transparent',
              alignItems: 'center'
            }}
            onPress={() => setActiveTab('quizzes')}
          >
            <Text style={{
              fontFamily: 'outfit-medium',
              color: activeTab === 'quizzes' ? Colors.PRIMARY : Colors.WHITE
            }}>Quiz Champions</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{marginTop: -40, flex: 1}}>
        {isLoading ? (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontFamily: 'outfit-medium'}}>Loading leaderboard...</Text>
          </View>
        ) : (
          <FlatList
            data={userList}
            keyExtractor={(item) => item.id}
            renderItem={({item, index}) => (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 20,
                backgroundColor: Colors.WHITE,
                margin: 8,
                marginRight: 15,
                marginLeft: 15,
                borderRadius: 15,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              }}>
                <View style={{
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'center'
                }}>
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: Colors.LIGHT_PRIMARY,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Text style={{
                      fontFamily: 'outfit-bold',
                      fontSize: 18,
                      color: Colors.PRIMARY
                    }}>{index + 1}</Text>
                  </View>
                  
                  {/* Fixed Image component with proper check for profileImage */}
                  {item.profileImage && item.profileImage.trim() !== '' ? (
                    <Image 
                      source={{uri: item.profileImage}}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        borderWidth: 2,
                        borderColor: index < 3 ? Colors.PRIMARY : Colors.LIGHT_GRAY
                      }}
                    />
                  ) : (
                    <Image 
                      source={{uri: defaultProfileImage}}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        borderWidth: 2,
                        borderColor: index < 3 ? Colors.PRIMARY : Colors.LIGHT_GRAY
                      }}
                    />
                  )}
                  
                  <View>
                    <Text style={{
                      fontFamily: 'outfit-medium',
                      fontSize: 20
                    }}>{item.userName}</Text>
                    
                    <Text style={{
                      fontFamily: 'outfit',
                      fontSize: 16,
                      color: Colors.GRAY
                    }}>{item.point} Points</Text>
                  </View>
                </View>
                
                {renderMedal(index)}
              </View>
            )}
            ListEmptyComponent={
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 50
              }}>
                <Text style={{
                  fontFamily: 'outfit-medium',
                  fontSize: 18,
                  color: Colors.GRAY
                }}>No users found</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}