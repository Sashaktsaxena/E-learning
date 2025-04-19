import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import Colors from '../Utils/Colors'
import { gql, request } from 'graphql-request'
import axios from 'axios'; // You'll need to install this package
import { Linking } from 'react-native';

export default function AdminPage({ onLogout }) {
  const [courseData, setCourseData] = useState([]);
  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [enrollmentCount, setEnrollmentCount] = useState(156);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const MASTER_URL="https://ap-south-1.cdn.hygraph.com/content/cm85thfvs00kp07wfuncjvdjy/master";
  const API_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE3NDQ0ODExODAsImF1ZCI6WyJodHRwczovL2FwaS1hcC1zb3V0aC0xLmh5Z3JhcGguY29tL3YyL2NtODV0aGZ2czAwa3AwN3dmdW5janZkankvbWFzdGVyIiwibWFuYWdlbWVudC1uZXh0LmdyYXBoY21zLmNvbSJdLCJpc3MiOiJodHRwczovL21hbmFnZW1lbnQtYXAtc291dGgtMS5oeWdyYXBoLmNvbS8iLCJzdWIiOiJjNjdjOWZkOS0zMWIxLTRhMTItYTIwOS0xY2NmN2ZiYTdhYzIiLCJqdGkiOiJjbTllajF4bjMwcHpjMDdvNzVkOWk3bnBnIn0.v4vvRQjbrlGSDMMVxUISMdLvUIAFnRP_31kU3uCYNJnN68lDXJbKAuhIfDNpECQt99zBMk5dz9bkYNrvWeBaXA08q_rzuWiuwlpFT_JsgdNLM88nEy__OPffBXgh90vbWSHQgycj9ME9OMnqB3aECbxERSLvTEjZidVuo1p4wagRouaw2rh1t7Md1VE69VUc_IPCSNskHXVQJ7AO3h5fMph723szvYYgiZwzggXY6StSDNCBJLKOlUtaPOHiiIN4Si5uudI5w6xrsRkZPUzCQIMbzx03LNGRCq_xQ7WWkek7rGY1pvd5GXb5nAaD95AtK1a8dU0pnU14xNs5mfc3gmJOiBlXQ_ELcLt5J63ZgFTHPgDUqX5KhxliT4UTWho1akHyukXw4GLSLsOynhcGnPefxp_mwXM1gqBBoOsk6xPZ381TazC5MywBCjtcvEs6pIXQRoDx6ZD3F7A2Th5ydyFV3cW4x6_ylkD9P2GGJpKxaUtNu1YV93N-a39OU0yhvCTEwW0HUprgiqwQraKJ7nkbmqwCtXvv9x738uELY-NJ6fJ78lYCokEBOhlnrSpI5IIWdrw67YaWEmFAZTfO3Sj0zeJP4G1paby-em7GDzFfEJuxMPwFAaZ-ECyPWzFaPXxPfACTFl4zoQ6PHneZKCrJUmxdp1PE6xaD2SAn0rE";

  // Clerk API Configuration
  // You'll need to get these values from your Clerk Dashboard
  const CLERK_API_KEY = "sk_test_b2MrhHg7HjYIx4yyhXwP2cR7bROgsyVzwlbqtVMe34"; // Replace with your actual key
  const CLERK_API_BASE = "https://api.clerk.com/v1"; // Base URL for Clerk API

  useEffect(() => {
    getAllCourses();
    fetchClerkUsers();
  }, []);

  // Helper function for making authenticated requests to GraphQL
  const authenticatedRequest = async (query, variables = {}) => {
    const headers = {
      Authorization: `Bearer ${API_TOKEN}`
    };
    
    return request(MASTER_URL, query, variables, headers);
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
      console.log("Clerk API response:", response.data);
      
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

  // Optional: Navigate to view user details
  const handleViewUserDetails = (userId) => {
    // Navigate to a user details screen or show user details in a modal
    Alert.alert("View User", `Viewing details for user ID: ${userId}`);
    // You could implement a navigation to a user details screen here
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
            <Text style={styles.statNumber}>{enrollmentCount}</Text>
            <Text style={styles.statLabel}>Enrollments</Text>
          </View>
        </View>

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
                        {user.first_name?.[0] || user.email?.[0] || "?"}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : user.email || "Unnamed User"}
                    </Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
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
        <Text style={styles.sectionTitle}>Course List</Text>
        
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
const additionalStyles = {
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 30,
    marginBottom: 15,
  },
  addCourseButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addCourseButtonText: {
    color: Colors.WHITE,
    fontFamily: 'outfit-medium',
    fontSize: 16,
  }
}
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: 'outfit-bold',
    marginTop: 40,
    marginBottom: 30
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30
  },
  statCard: {
    backgroundColor: Colors.WHITE,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    height: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'outfit-bold',
    color: Colors.PRIMARY
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: '#555'
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'outfit-bold',
    alignSelf: 'flex-start',
    marginBottom: 15,
    marginTop: 30,
    color: '#333'
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'outfit',
    color: '#666',
    marginTop: 10
  },
  noCourses: {
    fontSize: 16,
    fontFamily: 'outfit',
    color: '#666',
    marginVertical: 20,
    alignSelf: 'center'
  },
  noUsers: {
    fontSize: 16,
    fontFamily: 'outfit',
    color: '#666',
    marginVertical: 20,
    alignSelf: 'center'
  },
  courseList: {
    width: '100%',
  },
  courseCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  courseBanner: {
    width: '100%',
    height: 150,
  },
  courseInfo: {
    padding: 16
  },
  courseName: {
    fontSize: 18,
    fontFamily: 'outfit-bold',
    marginBottom: 8,
    color: '#222'
  },
  courseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  courseAuthor: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: '#555'
  },
  courseLevel: {
    fontSize: 14,
    fontFamily: 'outfit-medium',
    color: Colors.PRIMARY,
    backgroundColor: `${Colors.PRIMARY}22`,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 5
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 4
  },
  coursePrice: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    color: Colors.PRIMARY
  },
  courseTime: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: '#666'
  },
  chapterCount: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: '#666'
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12
  },
  deleteButton: {
    backgroundColor: '#ff4757',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6
  },
  deleteButtonText: {
    color: Colors.WHITE,
    fontFamily: 'outfit-medium',
    fontSize: 14
  },
  logoutButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 40,
    marginBottom: 30
  },
  logoutText: {
    color: Colors.WHITE,
    fontFamily: 'outfit-medium',
    fontSize: 16
  },
  // User list styles
  userList: {
    width: '100%',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2.84,
    elevation: 2,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center'
  },
  userAvatarText: {
    color: Colors.WHITE,
    fontSize: 20,
    fontFamily: 'outfit-bold'
  },
  userInfo: {
    flex: 1,
    marginLeft: 12
  },
  userName: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    color: '#333'
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: '#555',
    marginTop: 2
  },
  userJoined: {
    fontSize: 12,
    fontFamily: 'outfit',
    color: '#888',
    marginTop: 4
  },
  viewButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4
  },
  viewButtonText: {
    color: Colors.WHITE,
    fontFamily: 'outfit',
    fontSize: 12
  },
  sectionHeaderContainer: additionalStyles.sectionHeaderContainer,
  addCourseButton: additionalStyles.addCourseButton,
  addCourseButtonText: additionalStyles.addCourseButtonText,
})