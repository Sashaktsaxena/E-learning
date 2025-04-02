import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import HomeScreen from '../Screen/HomeScreen';
import CourseDetailScreen from '../Screen/CourseDetailScreen';
import ChapterContentScreen from '../Screen/ChapterContentScreen';
import CourseCompletedScreen from '../Screen/CourseCompletedScreen';
import QuizScreen from '../Screen/QuizScreen'; 
import QuizResultsScreen from '../Screen/QuizResultsScreen'; // Import QuizResultsScreen
import LeaderBoard from '../Screen/LeaderBoard';

const Stack = createStackNavigator();
export default function HomeScreenNavigation() {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
        <Stack.Screen name='Home' component={HomeScreen} />
        <Stack.Screen name='couse-detail' 
        component={CourseDetailScreen} />
        <Stack.Screen name="chapter-content" component={ChapterContentScreen} />
        <Stack.Screen 
        name="course-complete" 
        component={CourseCompletedScreen} />
        {/* Quiz Screen */}
        <Stack.Screen 
        name="QuizScreen" 
        component={QuizScreen}
        options={{
          headerShown: true,
          title: "Quiz"
        }} />
        {/* Quiz Results Screen */}
        <Stack.Screen 
        name="QuizResultsScreen" 
        component={QuizResultsScreen}
        options={{
          headerShown: false
        }} />
        <Stack.Screen name='LeaderBoard' component={LeaderBoard} />
    </Stack.Navigator>
  )
}