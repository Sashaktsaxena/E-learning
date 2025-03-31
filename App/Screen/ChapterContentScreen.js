import { View, Text, ToastAndroid } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import Content from '../Components/ChapterContent/Content'
import { useNavigation, useRoute } from '@react-navigation/native'
import { MarkChapterCompleted } from '../Services';
import { CompleteChapterContext } from '../Context/CompleteChapterContext';
import { useUser } from '@clerk/clerk-expo';
import { UserPointsContext } from '../Context/UserPointsContext';
import { ScrollView } from 'react-native-gesture-handler';

export default function ChapterContentScreen() {
  const param = useRoute().params;
  const navigation = useNavigation();
  const { user } = useUser();
  const { userPoints, setUserPoints } = useContext(UserPointsContext);
  const { isChapterComplete, setIsChapterComplete } = useContext(CompleteChapterContext);
  const [completedChapterIds, setCompletedChapterIds] = useState([]);
  
  useEffect(() => {
    console.log("ChapterId", param.content.length)
    console.log("courseid", param.userCourseRecordId)
    console.log("this is chapter length ", param.chap)
    console.log("recordid", param.recordid)
    console.log("this is the current chapter id ", param.chapterId)
    
    // Extract just the chapter IDs from the completedChapters array of objects
    if (param.completedChapters && Array.isArray(param.completedChapters)) {
      const chapterIds = param.completedChapters.map(chapter => chapter.chapterid);
      console.log("Completed chapter IDs:", chapterIds);
      setCompletedChapterIds(chapterIds);
    }
  }, [param]);
  
  const onChapterFinish = () => {
    // Check if this chapter is already completed by checking if its ID exists in our extracted IDs array
    if (completedChapterIds.includes(param.chapterId)) {
      console.log("Chapter already completed, just navigating back");
      ToastAndroid.show('Chapter already completed!', ToastAndroid.SHORT);
      navigation.goBack();
      return;
    }
    
    console.log("Marking chapter as completed", userPoints);
    const totalPoints = Number(userPoints)+param.content?.length*10;
    
    MarkChapterCompleted(
      param.chapterId,
      param.recordid,
      user.primaryEmailAddress.emailAddress,
      totalPoints
    )
    .then(resp => {
      if (resp) {
        // Update local completed chapters array with the new chapter ID
        setCompletedChapterIds(prev => [...prev, param.chapterId]);
        
        ToastAndroid.show('Chapter Completed!', ToastAndroid.LONG);
        setIsChapterComplete(true);
        navigation.goBack();
      }
    })
    .catch(error => {
      console.log("Error in chapter completion", error);
      ToastAndroid.show('Failed to mark chapter as completed', ToastAndroid.LONG);
    });
  }
  
  return param.content && (
    <ScrollView>
      <Content 
        content={param.content}
        courseId={param.userCourseRecordId}
        chap={param.chap}
        currentchap={param.chapterId}
        completedChapterIds={completedChapterIds} // Pass just the IDs
        onChapterFinish={onChapterFinish}
      />
    </ScrollView>
  )
}