import { View, Text, FlatList, Dimensions, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import ProgressBar from './ProgressBar'
import ContentItem from './ContentItem'
import Colors from '../../Utils/Colors'
import { useNavigation } from '@react-navigation/native'
import { useEffect } from 'react'
import { getQuizByCourse } from '../../Services'
import { useUser } from '@clerk/clerk-expo'

import { getUserQuizAttempts } from '../../Services'
export default function Content({ content, courseId, chap, currentchap, onChapterFinish}) {

    let contentRef;
    
    const navigation = useNavigation();
    const [activeIndex, setActiveIndex] = useState(0);
    const [quiz, setQuiz] = useState(null);
    const [quizAttempted, setQuizAttempted] = useState(false);
    const [isLastChapter, setIsLastChapter] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        // Determine if the current chapter is the last one in the course
        if (chap && Array.isArray(chap) && chap.length > 0 && currentchap) {
            // Find the current chapter's index in the chap array
            const currentChapterIndex = chap.findIndex(chapter => chapter.id === currentchap);
            
            // If it's the last item in the array, it's the last chapter
            if (currentChapterIndex !== -1) {
                setIsLastChapter(currentChapterIndex === chap.length - 1);
                console.log("Is last chapter:", currentChapterIndex === chap.length - 1);
            }
        }

        // Fetch quiz when component mounts
        const fetchQuizAndAttempts = async () => {
            if (!courseId) return;
            try {
                // Fetch quiz 
                console.log("this is chapter description ", chap);
                const quizData = await getQuizByCourse(courseId);
                if (quizData.quizzes && quizData.quizzes.length > 0) {
                    setQuiz(quizData.quizzes[0]);
                    
                    // Check if user has already attempted this quiz
                    const userEmail = user.primaryEmailAddress.emailAddress;
                    const attempts = await getUserQuizAttempts(userEmail, courseId);
                    
                    // if (attempts && attempts.userQuizAttempts && attempts.userQuizAttempts.length > 0) {
                    //     setQuizAttempted(true);
                    // }
                }
            } catch (error) {
                console.error('Error fetching quiz data:', error);
            }
        };
    
        fetchQuizAndAttempts();
    }, [courseId, chap, currentchap]);

    // Modified for better clarity and control of quiz navigation
    const onNextBtnPress = (index) => {
        
        const isLastContent = index === content?.length - 1;
        
        if (isLastContent) {
            // This is the last content item
            if (isLastChapter && quiz && quiz.questions && quiz.questions.length > 0 && !quizAttempted) {
                // Only navigate to quiz if this is the last chapter, quiz exists, and not already attempted
                navigation.navigate('QuizScreen', {
                    quiz: quiz,
                    courseId: courseId,
                    onQuizComplete: (score) => {
                        console.log("Quiz completed with score:", score);
                        setQuizAttempted(true); // Mark quiz as attempted
                        
                        // Show score alert before going back
                        alert(`Quiz completed! Your score: ${score}/${quiz.questions.length}`);
                        
                        onChapterFinish();
                    }
                });
            } else {
                // If it's not the last chapter or no quiz available, just finish the chapter
                console.log("Not last chapter or no quiz available, finishing chapter");
                navigation.goBack();
                onChapterFinish();
            }
            return;
        }
        
        // Not the last content, move to next content
        setActiveIndex(index + 1);
        contentRef.scrollToIndex({ animated: true, index: index + 1 });
    }

    // Determine if it's the final content item of the final chapter
    const isFinalQuizButton = (index) => {
        return index === content?.length - 1 && isLastChapter && quiz && quiz.questions && quiz.questions.length > 0 && !quizAttempted;
    }

    return (
        <View style={{ padding: 0, height:'100%' }}>
            <ProgressBar
                contentLength={chap?.length}
                contentIndex={activeIndex}
            />

            <FlatList
                data={content}
                horizontal={true}
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                ref={(ref) => {
                    contentRef = ref
                }}
                renderItem={({ item, index }) => {
                    const isLastItem = index === content?.length - 1;
                    const showQuizButton = isFinalQuizButton(index);
                    
                    return (
                        <View>
                            <ScrollView style={{
                                width: Dimensions.get('screen').width,
                                padding: 20,
                                marginBottom: 40
                            }}>
                                <Text style={{
                                    fontFamily: 'outfit-medium',
                                    fontSize: 22,
                                    marginTop: 5
                                }}>{item.heading}</Text>
                                <ContentItem
                                    description={item?.description?.html}
                                    output={item?.output?.html} />
                            </ScrollView>
                            <TouchableOpacity
                                style={{
                                    marginTop: 10,
                                    position: 'absolute',
                                    bottom: 10,
                                    marginLeft: 20,
                                    marginRight: 20,
                                    width: '90%'
                                }}
                                onPress={() => onNextBtnPress(index)}
                            >
                                <Text style={{
                                    padding: 15,
                                    backgroundColor: Colors.PRIMARY,
                                    color: Colors.WHITE,
                                    textAlign: 'center',
                                    fontFamily: 'outift',
                                    fontSize: 17,
                                    borderRadius: 10
                                }}>
                                    {isLastItem 
                                        ? (showQuizButton ? 'Take Quiz' : 'Finish') 
                                        : 'Next'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
            />
        </View>
    )
}