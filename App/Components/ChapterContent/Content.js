import { View, Text, FlatList, Dimensions, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import ProgressBar from './ProgressBar'
import ContentItem from './ContentItem'
import Colors from '../../Utils/Colors'
import { useNavigation } from '@react-navigation/native'
import { getQuizByCourse, getUserQuizAttempts, getAllCourses } from '../../Services'
import { useUser } from '@clerk/clerk-expo'

export default function Content({ content, courseId, chap, currentchap, onChapterFinish}) {
    let contentRef;
    
    const navigation = useNavigation();
    const [activeIndex, setActiveIndex] = useState(0);
    const [quiz, setQuiz] = useState(null);
    const [quizAttempted, setQuizAttempted] = useState(false);
    const [isLastChapter, setIsLastChapter] = useState(false);
    const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
    const [courseDetails, setCourseDetails] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        // Determine if the current chapter is the last one in the course
        if (chap && Array.isArray(chap) && chap.length > 0 && currentchap) {
            // Find the current chapter's index in the chap array
            const chapIndex = chap.findIndex(chapter => chapter.id === currentchap);
            
            // If it's the last item in the array, it's the last chapter
            if (chapIndex !== -1) {
                setCurrentChapterIndex(chapIndex);
                setIsLastChapter(chapIndex === chap.length - 1);
                console.log("Is last chapter:", chapIndex === chap.length - 1);
            }
        }

        // Fetch course details (for tags and level)
        const fetchCourseDetails = async () => {
            if (!courseId) return;
            try {
                // Use the new getAllCourses function
                const response = await getAllCourses();
                
                if (response && response.courses) {
                    const course = response.courses.find(course => course.id === courseId);
                    if (course) {
                        setCourseDetails(course);
                        console.log("Course details fetched:", course.tags, course.level);
                    }
                }
            } catch (error) {
                console.error('Error fetching course details:', error);
            }
        };

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
                    
                    if (attempts && attempts.userQuizAttempts && attempts.userQuizAttempts.length > 0) {
                        setQuizAttempted(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching quiz data:', error);
            }
        };
    
        fetchCourseDetails();
        fetchQuizAndAttempts();
    }, [courseId, chap, currentchap]);

    // Rest of your component remains the same...
    
    const onNextBtnPress = () => {
        // Since the FlatList only has one item (content.length = 1),
        // we don't actually scroll through content items, but complete the chapter

        // Complete the current chapter
        if (isLastChapter) {
            if (quiz && quiz.questions && quiz.questions.length > 0 && !quizAttempted) {
                // Navigate to quiz if it exists and hasn't been attempted
                navigation.navigate('QuizScreen', {
                    quiz: quiz,
                    courseId: courseId,
                    courseTags: courseDetails?.tags || [],
                    courseLevel: courseDetails?.level || '',
                    onQuizComplete: (score) => {
                        console.log("Quiz completed with score:", score);
                        setQuizAttempted(true); // Mark quiz as attempted
                        
                        // Show score alert before going back
                        alert(`Quiz completed! Your score: ${score}/${quiz.questions.length}`);
                        
                        onChapterFinish();
                    }
                });
            } else {
                // If no quiz available or already attempted, just finish the chapter
                console.log("No quiz available or already attempted, finishing chapter");
                navigation.goBack();
                onChapterFinish();
            }
        } else {
            // Not the last chapter, just finish this chapter and go back
            navigation.goBack();
            onChapterFinish();
        }
    }

    // Determine if it's the final chapter and we should show quiz button
    const shouldShowQuizButton = () => {
        return isLastChapter && quiz && quiz.questions && quiz.questions.length > 0 && !quizAttempted;
    }

    return (
        <View style={{ padding: 0, height:'100%' }}>
            <ProgressBar
                contentLength={chap?.length}
                contentIndex={currentChapterIndex}
            />

            <FlatList
                data={content}
                horizontal={true}
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                ref={(ref) => {
                    contentRef = ref
                }}
                renderItem={({ item }) => {
                    // Determine button text based on chapter position
                    const showQuizButton = shouldShowQuizButton();
                    const buttonText = isLastChapter 
                        ? (showQuizButton ? 'Take Quiz' : 'Finish') 
                        : 'Next';
                    
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
                                onPress={onNextBtnPress}
                            >
                                <Text style={{
                                    padding: 15,
                                    backgroundColor: Colors.PRIMARY,
                                    color: Colors.WHITE,
                                    textAlign: 'center',
                                    fontFamily: 'outfit',
                                    fontSize: 17,
                                    borderRadius: 10
                                }}>
                                    {buttonText}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
            />
        </View>
    )
}