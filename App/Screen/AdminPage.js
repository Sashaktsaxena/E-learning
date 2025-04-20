import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import Colors from '../Utils/Colors'
import { gql, request } from 'graphql-request'
import axios from 'axios';
import { Linking } from 'react-native';

export default function AdminPage({ onLogout }) {
  const [courseData, setCourseData] = useState([]);
  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [quizAttemptData, setQuizAttemptData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  const MASTER_URL="https://ap-south-1.cdn.hygraph.com/content/cm85thfvs00kp07wfuncjvdjy/master";
  const API_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE3NDQ0ODExODAsImF1ZCI6WyJodHRwczovL2FwaS1hcC1zb3V0aC0xLmh5Z3JhcGguY29tL3YyL2NtODV0aGZ2czAwa3AwN3dmdW5janZkankvbWFzdGVyIiwibWFuYWdlbWVudC1uZXh0LmdyYXBoY21zLmNvbSJdLCJpc3MiOiJodHRwczovL21hbmFnZW1lbnQtYXAtc291dGgtMS5oeWdyYXBoLmNvbS8iLCJzdWIiOiJjNjdjOWZkOS0zMWIxLTRhMTItYTIwOS0xY2NmN2ZiYTdhYzIiLCJqdGkiOiJjbTllajF4bjMwcHpjMDdvNzVkOWk3bnBnIn0.v4vvRQjbrlGSDMMVxUISMdLvUIAFnRP_31kU3uCYNJnN68lDXJbKAuhIfDNpECQt99zBMk5dz9bkYNrvWeBaXA08q_rzuWiuwlpFT_JsgdNLM88nEy__OPffBXgh90vbWSHQgycj9ME9OMnqB3aECbxERSLvTEjZidVuo1p4wagRouaw2rh1t7Md1VE69VUc_IPCSNskHXVQJ7AO3h5fMph723szvYYgiZwzggXY6StSDNCBJLKOlUtaPOHiiIN4Si5uudI5w6xrsRkZPUzCQIMbzx03LNGRCq_xQ7WWkek7rGY1pvd5GXb5nAaD95AtK1a8dU0pnU14xNs5mfc3gmJOiBlXQ_ELcLt5J63ZgFTHPgDUqX5KhxliT4UTWho1akHyukXw4GLSLsOynhcGnPefxp_mwXM1gqBBoOsk6xPZ381TazC5MywBCjtcvEs6pIXQRoDx6ZD3F7A2Th5ydyFV3cW4x6_ylkD9P2GGJpKxaUtNu1YV93N-a39OU0yhvCTEwW0HUprgiqwQraKJ7nkbmqwCtXvv9x738uELY-NJ6fJ78lYCokEBOhlnrSpI5IIWdrw67YaWEmFAZTfO3Sj0zeJP4G1paby-em7GDzFfEJuxMPwFAaZ-ECyPWzFaPXxPfACTFl4zoQ6PHneZKCrJUmxdp1PE6xaD2SAn0rE";

  // Clerk API Configuration
  const CLERK_API_KEY = "sk_test_b2MrhHg7HjYIx4yyhXwP2cR7bROgsyVzwlbqtVMe34";
  const CLERK_API_BASE = "https://api.clerk.com/v1";

  useEffect(() => {
    getAllCourses();
    fetchClerkUsers();
    getAllEnrollments();
    getAllQuizAttempts();
  }, []);

  // Helper function for making authenticated requests to GraphQL
  const authenticatedRequest = async (query, variables = {}) => {
    const headers = {
      Authorization: `Bearer ${API_TOKEN}`
    };
    
    return request(MASTER_URL, query, variables, headers);
  };

  // Function to get all quiz attempts
  const getAllQuizAttempts = async () => {
    try {
      setQuizLoading(true);
      
      // Query all quiz attempts
      const query = gql`
        query GetAllQuizAttempts {
          userQuizAttempts {
            id
            score
            totalQuestions
            completedAt
            user {
              email
            }
            quiz {
              id
              title
              course {
                id
                name
              }
            }
          }
        }
      `;
      
      const result = await authenticatedRequest(query);
      
      if (result?.userQuizAttempts) {
        setQuizAttemptData(result.userQuizAttempts);
        console.log("Quiz attempts fetched:", result.userQuizAttempts.length);
      } else {
        console.log("No quiz attempts found in response");
        setQuizAttemptData([]);
      }
      
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      Alert.alert("Error", "Failed to load quiz attempt data.");
    } finally {
      setQuizLoading(false);
    }
  };

  // Function to get specific user quiz attempts
  const getUserQuizAttempts = async (userEmail, courseId) => {
    const query = gql`
    query GetUserQuizAttempts {
      userQuizAttempts(
        where: { 
          user: { email: "${userEmail}" },
          quiz: { course: { id: "${courseId}" } }
        }
      ) {
        id
        score
        totalQuestions
        completedAt
        quiz {
          id
          title
        }
      }
    }
    `;

    const result = await authenticatedRequest(query);
    return result;
  };

  // Updated function to get all enrollments at once
  const getAllEnrollments = async () => {
    try {
      setEnrollmentLoading(true);
      
      // Use a GraphQL query to fetch all enrollments in one go
      const query = gql`
        query GetAllEnrollments {
          uSerEnrolledCourses {
            id
            courseid
            userEmail
            completedChapter {
              chapterid
              id
            }
            course {
              id
              name
              level
              author
              banner {
                url
              }
            }
          }
        }
      `;
      
      const result = await authenticatedRequest(query);
      
      if (result?.uSerEnrolledCourses) {
        setEnrollmentData(result.uSerEnrolledCourses);
        setEnrollmentCount(result.uSerEnrolledCourses.length);
        console.log("Enrollments fetched:", result.uSerEnrolledCourses.length);
      } else {
        console.log("No enrollments found in response");
        setEnrollmentData([]);
        setEnrollmentCount(0);
      }
      
    } catch (error) {
      console.error("Error fetching all enrollments:", error);
      Alert.alert("Error", "Failed to load enrollment data.");
    } finally {
      setEnrollmentLoading(false);
    }
  };

  // Fetch users from Clerk API
  const fetchClerkUsers = async () => {
    try {
      setUserLoading(true);
      
      // Make an API request to Clerk's backend API
      const response = await axios.get(`${CLERK_API_BASE}/users`, {
        headers: {
          'Authorization': `Bearer ${CLERK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Check if response data exists and has the expected format
      console.log("Clerk API response received");
      
      // The response appears to directly contain the user array
      if (Array.isArray(response.data)) {
        setUsers(response.data);
        setUserCount(response.data.length);
      } else if (response.data && Array.isArray(response.data.data)) {
        // Alternative structure where users are in response.data.data
        setUsers(response.data.data);
        setUserCount(response.data.data.length);
      } else {
        console.error("Unexpected response format:", response.data);
        setUsers([]);
        setUserCount(0);
      }
      
    } catch (error) {
      console.error("Error fetching Clerk users:", error);
      Alert.alert("Error", "Failed to load user data. Please check your Clerk API configuration.");
    } finally {
      setUserLoading(false);
    }
  };

  const getAllCourses = async () => {
    try {
      setLoading(true);
      const beginnerCourses = await getCourseList("basic");
      
      const advancedCourses = await getCourseList("advance");
      
      const allCourses = [
        ...(beginnerCourses?.courses || []),
        ...(advancedCourses?.courses || [])
      ];
      
      setCourseData(allCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      Alert.alert("Error", "Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getCourseList = async (level) => {
    const query = gql`
      query CourseList {
        courses(where: {level: ${level}}) {
          id
          name
          price
          level
          tags
          time
          author
          description {
            markdown
          }
          banner {
            url
          }
          chapters {
            content {
              heading
              description {
                markdown
                html
              }
              output {
                markdown
                html
              }
            }
            title
            id
          }
        }
      }
    `;

    const result = await authenticatedRequest(query);
    return result;
  };

  const handleDeleteCourse = async (courseId) => {
    Alert.alert(
      "Delete Course",
      "Are you sure you want to delete this course? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Unpublish & Delete",
          style: "destructive",
          onPress: () => unpublishAndDeleteCourse(courseId)
        }
      ]
    );
  };

  const unpublishAndDeleteCourse = async (courseId) => {
    try {
      setDeleting(true);
      
      // Step 1: Unpublish the course first
      const unpublishMutation = gql`
        mutation UnpublishCourse {
          unpublishCourse(where: { id: "${courseId}" }) {
            id
          }
        }
      `;
      
      await authenticatedRequest(unpublishMutation);
      
      // Step 2: Now delete the unpublished course
      const deleteMutation = gql`
        mutation DeleteCourse {
          deleteCourse(where: { id: "${courseId}" }) {
            id
          }
        }
      `;
      
      await authenticatedRequest(deleteMutation);
      
      // Update UI after successful deletion
      setCourseData(currentCourses => currentCourses.filter(course => course.id !== courseId));
      Alert.alert("Success", "Course successfully deleted");
      
    } catch (error) {
      console.error("Error deleting course:", error);
      Alert.alert(
        "Error",
        "Failed to delete course. This could be due to insufficient permissions or the course is still published.",
        [
          {
            text: "OK",
            onPress: () => console.log("OK Pressed")
          },
          {
            text: "View Error Details",
            onPress: () => Alert.alert("Error Details", JSON.stringify(error))
          }
        ]
      );
    } finally {
      setDeleting(false);
    }
  };

  // Function to handle deleting enrollment
  const handleDeleteEnrollment = (enrollmentId) => {
    Alert.alert(
      "Delete Enrollment",
      "Are you sure you want to delete this enrollment?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteEnrollment(enrollmentId)
        }
      ]
    );
  };

  const deleteEnrollment = async (enrollmentId) => {
    try {
      // First unpublish
      const unpublishMutation = gql`
        mutation UnpublishEnrollment {
          unpublishUserEnrolledCourses(where: { id: "${enrollmentId}" }) {
            id
          }
        }
      `;
      
      await authenticatedRequest(unpublishMutation);
      
      // Then delete
      const deleteMutation = gql`
        mutation DeleteEnrollment {
          deleteUserEnrolledCourses(where: { id: "${enrollmentId}" }) {
            id
          }
        }
      `;
      
      await authenticatedRequest(deleteMutation);
      
      // Update UI
      setEnrollmentData(current => current.filter(item => item.id !== enrollmentId));
      setEnrollmentCount(prev => prev - 1);
      Alert.alert("Success", "Enrollment successfully deleted");
      
    } catch (error) {
      console.error("Error deleting enrollment:", error);
      Alert.alert("Error", "Failed to delete enrollment. Please try again.");
    }
  };

  // Function to handle deleting quiz attempt
  const handleDeleteQuizAttempt = (attemptId) => {
    Alert.alert(
      "Delete Quiz Attempt",
      "Are you sure you want to delete this quiz attempt?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteQuizAttempt(attemptId)
        }
      ]
    );
  };

  const deleteQuizAttempt = async (attemptId) => {
    try {
      // First unpublish
      const unpublishMutation = gql`
        mutation UnpublishQuizAttempt {
          unpublishUserQuizAttempt(where: { id: "${attemptId}" }) {
            id
          }
        }
      `;
      
      await authenticatedRequest(unpublishMutation);
      
      // Then delete
      const deleteMutation = gql`
        mutation DeleteQuizAttempt {
          deleteUserQuizAttempt(where: { id: "${attemptId}" }) {
            id
          }
        }
      `;
      
      await authenticatedRequest(deleteMutation);
      
      // Update UI
      setQuizAttemptData(current => current.filter(item => item.id !== attemptId));
      Alert.alert("Success", "Quiz attempt successfully deleted");
      
    } catch (error) {
      console.error("Error deleting quiz attempt:", error);
      Alert.alert("Error", "Failed to delete quiz attempt. Please try again.");
    }
  };

  // Optional: Navigate to view user details
  const handleViewUserDetails = (userId) => {
    Alert.alert("View User", `Viewing details for user ID: ${userId}`);
  };

  // Simple helper to safely get user email
  const getUserEmail = (user) => {
    if (user.email_addresses && user.email_addresses.length > 0) {
      return user.email_addresses[0].email_address;
    }
    return "No email";
  };

  // Function to view specific user quiz attempts
  const viewUserCourseQuizzes = async (userEmail, courseId) => {
    try {
      const result = await getUserQuizAttempts(userEmail, courseId);
      
      if (result?.userQuizAttempts?.length > 0) {
        // Format the quiz attempts data for display
        const quizInfo = result.userQuizAttempts.map(attempt => {
          const completedDate = attempt.completedAt 
            ? new Date(attempt.completedAt).toLocaleDateString() 
            : "Not completed";
          
          return `${attempt.quiz.title}: ${attempt.score}/${attempt.totalQuestions} (${completedDate})`;
        }).join('\n');
        
        Alert.alert(
          "Quiz Attempts",
          `User: ${userEmail}\n\n${quizInfo}`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("No Quizzes", `No quiz attempts found for ${userEmail} in this course.`);
      }
    } catch (error) {
      console.error("Error fetching specific user quiz attempts:", error);
      Alert.alert("Error", "Failed to load quiz data for this user and course.");
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.welcomeText}>Welcome to the Admin Page</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            {userLoading ? (
              <ActivityIndicator color={Colors.PRIMARY} />
            ) : (
              <Text style={styles.statNumber}>{userCount}</Text>
            )}
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{courseData.length}</Text>
            <Text style={styles.statLabel}>Active Courses</Text>
          </View>
          
          <View style={styles.statCard}>
            {enrollmentLoading ? (
              <ActivityIndicator color={Colors.PRIMARY} />
            ) : (
              <Text style={styles.statNumber}>{enrollmentCount}</Text>
            )}
            <Text style={styles.statLabel}>Enrollments</Text>
          </View>
          
          <View style={styles.statCard}>
            {quizLoading ? (
              <ActivityIndicator color={Colors.PRIMARY} />
            ) : (
              <Text style={styles.statNumber}>{quizAttemptData.length}</Text>
            )}
            <Text style={styles.statLabel}>Quiz Attempts</Text>
          </View>
        </View>

        {/* Quiz Attempts Section */}
        <Text style={styles.sectionTitle}>Quiz Attempt Data</Text>
        
        {quizLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.PRIMARY} />
            <Text style={styles.loadingText}>Loading quiz attempts...</Text>
          </View>
        ) : (
          <View style={styles.quizList}>
            {quizAttemptData.length > 0 ? (
              quizAttemptData.map(attempt => (
                <View key={attempt.id} style={styles.quizCard}>
                  <View style={styles.quizHeader}>
                    <Text style={styles.quizUserEmail}>{attempt.user?.email || "Unknown user"}</Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteQuizAttempt(attempt.id)}
                    >
                      <Text style={styles.deleteButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.quizInfo}>
                    <Text style={styles.quizTitle}>{attempt.quiz?.title || "Unnamed quiz"}</Text>
                    <Text style={styles.quizCourseName}>
                      Course: {attempt.quiz?.course?.name || "Unknown course"}
                    </Text>
                    <View style={styles.quizResults}>
                      <Text style={styles.quizScore}>
                        Score: {attempt.score}/{attempt.totalQuestions}
                      </Text>
                      <Text style={styles.quizPercentage}>
                        ({Math.round((attempt.score / attempt.totalQuestions) * 100)}%)
                      </Text>
                    </View>
                    {attempt.completedAt && (
                      <Text style={styles.quizCompleted}>
                        Completed: {new Date(attempt.completedAt).toLocaleString()}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noQuizzes}>No quiz attempts available</Text>
            )}
          </View>
        )}

        {/* Enrollments Section */}
        <Text style={styles.sectionTitle}>Enrollment Data</Text>
        
        {enrollmentLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.PRIMARY} />
            <Text style={styles.loadingText}>Loading enrollments...</Text>
          </View>
        ) : (
          <View style={styles.enrollmentList}>
            {enrollmentData.length > 0 ? (
              enrollmentData.map(enrollment => (
                <View key={enrollment.id} style={styles.enrollmentCard}>
                  <View style={styles.enrollmentHeader}>
                    <Text style={styles.enrollmentEmail}>{enrollment.userEmail}</Text>
                    <View style={styles.enrollmentActions}>
                      <TouchableOpacity
                        style={styles.viewQuizzesButton}
                        onPress={() => viewUserCourseQuizzes(enrollment.userEmail, enrollment.courseid)}
                      >
                        <Text style={styles.viewQuizzesButtonText}>View Quizzes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteEnrollment(enrollment.id)}
                      >
                        <Text style={styles.deleteButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.enrollmentCourseInfo}>
                    {enrollment.course?.banner?.url && (
                      <Image 
                        source={{ uri: enrollment.course.banner.url }} 
                        style={styles.enrollmentCourseBanner}
                      />
                    )}
                    <View style={styles.enrollmentCourseDetails}>
                      <Text style={styles.enrollmentCourseName}>
                        {enrollment.course?.name || "Unnamed Course"}
                      </Text>
                      <Text style={styles.enrollmentCourseAuthor}>
                        By {enrollment.course?.author || "Unknown Author"}
                      </Text>
                      {enrollment.course?.level && (
                        <Text style={styles.enrollmentCourseLevel}>
                          {enrollment.course.level}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.enrollmentProgress}>
                    <Text style={styles.enrollmentProgressTitle}>Completed Chapters:</Text>
                    {enrollment.completedChapter && enrollment.completedChapter.length > 0 ? (
                      <View style={styles.completedChaptersList}>
                        {enrollment.completedChapter.map(chapter => (
                          <Text key={chapter.id} style={styles.completedChapter}>
                            • Chapter ID: {chapter.chapterid}
                          </Text>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.noCompletedChapters}>No chapters completed yet</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noEnrollments}>No enrollments available</Text>
            )}
          </View>
        )}

        {/* User Section */}
        <Text style={styles.sectionTitle}>User List</Text>
        
        {userLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.PRIMARY} />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : (
          <View style={styles.userList}>
            {users.length > 0 ? (
              users.map(user => (
                <View key={user.id} style={styles.userCard}>
                  {user.profile_image_url ? (
                    <Image 
                      source={{ uri: user.profile_image_url }} 
                      style={styles.userAvatar}
                    />
                  ) : (
                    <View style={styles.userAvatarPlaceholder}>
                      <Text style={styles.userAvatarText}>
                        {user.first_name?.[0] || (user.email_addresses?.[0]?.email_address?.[0] || "?")}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : getUserEmail(user) || "Unnamed User"}
                    </Text>
                    <Text style={styles.userEmail}>{getUserEmail(user)}</Text>
                    <Text style={styles.userJoined}>
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => handleViewUserDetails(user.id)}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noUsers}>No users available</Text>
            )}
          </View>
        )}

        {/* Course Section */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Course List</Text>
          <TouchableOpacity 
            style={styles.addCourseButton}
            onPress={() => {
              Linking.openURL('https://studio-ap-south-1.hygraph.com/34845c55-b830-4086-89ad-1161391d75aa/9656e18623e44d9fb6651680a12c45ad');
            }}
          >
            <Text style={styles.addCourseButtonText}>+ Add New Course</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.PRIMARY} />
            <Text style={styles.loadingText}>Loading courses...</Text>
          </View>
        ) : deleting ? (
          <Text style={styles.loadingText}>Deleting course...</Text>
        ) : (
          <View style={styles.courseList}>
            {courseData.length > 0 ? (
              courseData.map(course => (
                <View key={course.id} style={styles.courseCard}>
                  {course.banner?.url && (
                    <Image 
                      source={{ uri: course.banner.url }} 
                      style={styles.courseBanner}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <View style={styles.courseDetails}>
                      <Text style={styles.courseAuthor}>By {course.author}</Text>
                      <Text style={styles.courseLevel}>{course.level}</Text>
                    </View>
                    <View style={styles.courseStats}>
                      <Text style={styles.coursePrice}>${course.price}</Text>
                      <Text style={styles.courseTime}>{course.time} hrs</Text>
                      <Text style={styles.chapterCount}>
                        {course.chapters?.length || 0} chapters
                      </Text>
                    </View>
                    <View style={styles.actionsContainer}>
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteCourse(course.id)}
                      >
                        <Text style={styles.deleteButtonText}>Delete Course</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noCourses}>No courses available</Text>
            )}
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={onLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.WHITE,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.PRIMARY,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '23%',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
    color: Colors.PRIMARY,
  },
  addCourseButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addCourseButtonText: {
    color: Colors.WHITE,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.PRIMARY,
  },
  courseList: {
    marginBottom: 30,
  },
  courseCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseBanner: {
    width: '100%',
    height: 120,
  },
  courseInfo: {
    padding: 16,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  courseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  courseAuthor: {
    color: '#666',
    fontSize: 14,
  },
  courseLevel: {
    backgroundColor: Colors.LIGHT_PRIMARY,
    color: Colors.PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  courseStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  coursePrice: {
    color: Colors.PRIMARY,
    fontWeight: 'bold',
    marginRight: 16,
    fontSize: 16,
  },
  courseTime: {
    color: '#666',
    marginRight: 16,
  },
  chapterCount: {
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    backgroundColor: '#ff4d4f',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: Colors.WHITE,
    fontWeight: '500',
    fontSize: 12,
  },
  userList: {
    marginBottom: 30,
  },
  userCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  userAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.LIGHT_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    color: '#666',
    marginBottom: 4,
    fontSize: 14,
  },
  userJoined: {
    color: '#999',
    fontSize: 12,
  },
  viewButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  viewButtonText: {
    color: Colors.WHITE,
    fontWeight: '500',
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: '#ff4d4f',
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: Colors.WHITE,
    fontWeight: 'bold',
    fontSize: 16,
  },
  noUsers: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  noCourses: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  enrollmentList: {
    marginBottom: 30,
  },
  enrollmentCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enrollmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  enrollmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enrollmentEmail: {
    fontSize: 16,
    fontWeight: '600',
  },
  enrollmentCourseInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  enrollmentCourseBanner: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  enrollmentCourseDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  enrollmentCourseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  enrollmentCourseAuthor: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  enrollmentCourseLevel: {
    backgroundColor: Colors.LIGHT_PRIMARY,
    color: Colors.PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '500',
    alignSelf: 'flex-start',
  },
  enrollmentProgress: {
    marginTop: 8,
  },
  enrollmentProgressTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  completedChaptersList: {
    marginLeft: 8,
  },
  completedChapter: {
    color: '#666',
    marginBottom: 4,
  },
  noCompletedChapters: {
    color: '#999',
    fontStyle: 'italic',
  },
  noEnrollments: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  // Quiz attempts styles
  quizList: {
    marginBottom: 30,
  },
  quizCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quizUserEmail: {
    fontSize: 16,
    fontWeight: '600',
  },
  quizInfo: {
    paddingLeft: 8,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  quizCourseName: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  quizResults: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  quizScore: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  quizPercentage: {
    color: '#666',
    fontSize: 14,
  },
  quizCompleted: {
    color: '#999',
    fontSize: 12,
  },
  noQuizzes: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  viewQuizzesButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  viewQuizzesButtonText: {
    color: Colors.WHITE,
    fontWeight: '500',
    fontSize: 12,
  }
});