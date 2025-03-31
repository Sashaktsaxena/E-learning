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
  const param=useRoute().params;
  const navigation=useNavigation();
  const {user}=useUser();
  const {userPoints,setUserPoints}=useContext(UserPointsContext);
  const {isChapterComplete,setIsChapterComplete}=useContext(CompleteChapterContext)
  //Chapter Id
  //RecordId

  useEffect(()=>{
    console.log("ChapterId",param.content.length)
    console.log("RecordId",param.userCourseRecordId)
    console.log ("this is chapter length ",param.chap)
    console.log("this is the current chapter id ",param.chapterId)

  },[param])
  const onChapterFinish=()=>{
    const totalPoints=Number(userPoints)+param.content?.length*10;
    MarkChapterCompleted(param.chapterId,param.userCourseRecordId,
      user.primaryEmailAddress.emailAddress,totalPoints).then(resp=>{
      if(resp)
      {

        ToastAndroid.show('Chapter Completed!',ToastAndroid.LONG)
        setIsChapterComplete(true)
       navigation.goBack();
      }
    })
  }
  return param.content&&(
    <ScrollView>
      <Content content={param.content}
            courseId={param.userCourseRecordId}
            chap={param.chap}
            currentchap={param.chapterId}
      onChapterFinish={()=>onChapterFinish()

      } />
    </ScrollView>
  )
}