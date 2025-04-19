import { request, gql } from 'graphql-request'
//Replace This Complete Master Key
const MASTER_URL="https://ap-south-1.cdn.hygraph.com/content/cm85thfvs00kp07wfuncjvdjy/master";

export const getCourseList=async(level)=>{
  const query=gql`
  query CourseList {
      courses(where: {level: `+level+`}) {
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
  `

  const result=await request(MASTER_URL,query);
  return result;
}
export const getAllCourses = async () => {
  const query = gql`
    query AllCourses {
      courses {
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
          title
          id
        }
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
}
export const enrollCourse=async(courseId,userEmail)=>{
  const mutationQuery=gql`
  mutation MyMutation {
    createUserEnrolledCourses(
      data: {courseid: "`+courseId+`", 
      userEmail: "`+userEmail+`", course: {connect: {id: "`+courseId+`"}}}
    ) {
      id
    }
    publishManyUSerEnrolledCoursesConnection(to: PUBLISHED){
      edges {
        node {
          id
        }
      }
    }
  }
  `
  const result=await request(MASTER_URL,mutationQuery);
    return result;
}

export const getUserEnrolledCourse=async(courseId,userEmail)=>{
  const query=gql`
  query GetUserEnrolledCourse {
    uSerEnrolledCourses(
      where: {courseid: "`+courseId+`", 
        userEmail: "`+userEmail+`"}
    ) {
      id
      courseid
      completedChapter {
        chapterid
      }
    }
  }
  `
  const result=await request(MASTER_URL,query);
  return result;
}


export const MarkChapterCompleted=async(chapterId,recordId,userEmail,points)=>{
  const mutationQuery=gql`
  mutation markChapterCompleted {
    updateUserEnrolledCourses(
      data: {completedChapter: {create: {data: {chapterid: "`+chapterId+`"}}}}
      where: {id: "`+recordId+`"}
    ) {
      id
    }
    publishManyUSerEnrolledCoursesConnection {
      edges {
        node {
          id
        }
      }
    }
    
      updateUserDetail(where: {email: "`+userEmail+`"}, 
      data: {point: `+points+`}) {
        point
      }
      publishUserDetail(where: {email: "`+userEmail+`"}) {
        id
      }
    
    
  }
  `

  const result=await request(MASTER_URL,mutationQuery);
  return result; 
}


export const createNewUser=async(userName,email,profileImageUrl)=>{
  const mutationQuery=gql`
  mutation CreateNewUser {
    upsertUserDetail(
      upsert: {create: 
        {email: "`+email+`", 
        point: 10, 
        profileImage: "`+profileImageUrl+`", 
        userName: "`+userName+`"}, 
        update: {email: "`+email+`", 
         profileImage: 
         "`+profileImageUrl+`", userName: "`+userName+`"}}
      where: {email: "`+email+`"}
    ) {
      id
    }
    publishUserDetail(where: {email: "`+email+`"}) {
      id
    }
  }
  
  `
  const result=await request(MASTER_URL,mutationQuery);
  return result; 
}

export const getUserDetail=async(email)=>{
  const query=gql`
  query getUserDetails {
    userDetail(where: 
      {email: "`+email+`"}) {
      point
    }
  }
  `
  const result=await request(MASTER_URL,query);
  return result;
}

export const GetAllUsers=async()=>{
  const query=gql`
  query GetAllUsers {
    userDetails(orderBy: point_DESC) {
      id
      profileImage
      userName
      point
    }
  }
  `
  const result=await request(MASTER_URL,query);
  return result;
}

export const GetAllProgressCourse=async(userEmail)=>{
  const query=gql`
  query GetAllUserEnrolledProgressCourse {
    uSerEnrolledCourses(where: {userEmail: "`+userEmail+`"}) {
      completedChapter {
        chapterid
      }
      course {
        banner {
          url
        }
        chapters {
          id
          title
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
        }
        description {
          markdown
        }
        id
        level
        name
        price
        time
      }
    }
  }
  `

  const result=await request(MASTER_URL,query);
  return result;
}



export const getQuizByCourse = async (courseId) => {
  const query = gql`
  query GetCourseQuiz {
    quizzes(where: { course: { id: "${courseId}" } }) {
      id
      title
      description
      questions {
        id
        questionText
        options {
          id
          optionText
        }
        correctOptionId
      }
    }
  }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

// export const submitQuizAttempt = async (userEmail, quizId, score, totalQuestions) => {
//   // Get current date in ISO format for DateTime field
//   const currentDate = new Date().toISOString();

//   const mutationQuery = gql`
//   mutation SubmitQuizAttempt {
//     createUserQuizAttempt(
//       data: {
//         user: { connect: { email: "${userEmail}" } },
//         quiz: { connect: { id: "${quizId}" } },
//         score: ${score},
//         totalQuestions: ${totalQuestions},
//         completedAt: "${currentDate}"
//       }
//     ) {
//       id
//       score
//     }
//     publishManyUserQuizAttempts(to: PUBLISHED) {
//       count
//     }
//     updateUserDetail(
//       where: { email: "${userEmail}" },
//       data: { point: ${score * 10} }
//     ) {
//       point
//     }
//     publishUserDetail(where: { email: "${userEmail}" }) {
//       id
//     }
//   }
//   `;

//   const result = await request(MASTER_URL, mutationQuery);
//   return result;
// };
export const getUserQuizAttempts = async (userEmail, courseId) => {
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

  const result = await request(MASTER_URL, query);
  return result;
};


export const GetTopQuizPerformers = async (limit = 10) => {
  const query = gql`
  query GetTopQuizPerformers {
    userDetails(
      orderBy: point_DESC
      first: ${limit}
    ) {
      id
      profileImage
      userName
      point
      userQuizAttempt {
        score
        totalQuestions
        quiz {
          title
        }
      }
    }
  }
  `;
  
  const result = await request(MASTER_URL, query);
  return result;
};

export const GetUserQuizPerformance = async (userEmail) => {
  const query = gql`
  query GetUserQuizPerformance {
    userDetail(where: {email: "${userEmail}"}) {
      id
      userName
      point
      userQuizAttempt {
        id
        score
        totalQuestions
        completedAt
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
  }
  `;
  
  const result = await request(MASTER_URL, query);
  return result;
};

// Updated the submitQuizAttempt function to better handle points
export const submitQuizAttempt = async (userEmail, quizId, score, totalQuestions) => {
  // Get current date in ISO format for DateTime field
  const currentDate = new Date().toISOString();
  
  // Calculate points - base points plus bonus for higher scores
  const basePoints = 10;
  const scorePercentage = (score / totalQuestions) * 100;
  let bonusPoints = 0;
  
  if (scorePercentage >= 90) bonusPoints = 15;
  else if (scorePercentage >= 80) bonusPoints = 10;
  else if (scorePercentage >= 70) bonusPoints = 5;
  
  const totalPointsToAdd = (score * basePoints) + bonusPoints;

  // Get current user points first
  const userDetailQuery = gql`
  query GetUserCurrentPoints {
    userDetail(where: {email: "${userEmail}"}) {
      point
    }
  }
  `;
  
  const userDetail = await request(MASTER_URL, userDetailQuery);
  const currentPoints = userDetail.userDetail ? userDetail.userDetail.point || 0 : 0;
  const newTotalPoints = currentPoints + totalPointsToAdd;

  const mutationQuery = gql`
  mutation SubmitQuizAttempt {
    createUserQuizAttempt(
      data: {
        user: { connect: { email: "${userEmail}" } },
        quiz: { connect: { id: "${quizId}" } },
        score: ${score},
        totalQuestions: ${totalQuestions},
        completedAt: "${currentDate}"
      }
    ) {
      id
      score
    }
    publishManyUserQuizAttempts(to: PUBLISHED) {
      count
    }
    updateUserDetail(
      where: { email: "${userEmail}" },
      data: { point: ${newTotalPoints} }
    ) {
      point
    }
    publishUserDetail(where: { email: "${userEmail}" }) {
      id
    }
  }
  `;

  const result = await request(MASTER_URL, mutationQuery);
  return result;
};
export const getRecommendedCourses = async (courseTags, courseLevel, courseId) => {
  // Normalize level to match the exact enum format
  const normalizedLevel = courseLevel.toLowerCase();
  
  // Build the query using courseTags directly
  const query = gql`
    query GetRecommendedCourses {
      courses(
        where: {
          level: ${normalizedLevel},
          tags:${courseTags},
          id_not: "${courseId}"
        },
        first: 3
      ) {
        id
        name
        price
        level
        tags
        time
        author
        banner {
          url
        }
        description {
          markdown
        }
      }
    }
  `;
  
  const result = await request(MASTER_URL, query);
  return result;
};

// export const getRecommendedCourses = async (courseTags, courseLevel, courseId) => {
//   // Normalize level to match the exact enum format
//   const normalizedLevel = courseLevel.toLowerCase();
  
//   // Build the query using courseTags directly
//   const query = gql`
//     query GetRecommendedCourses {
//       courses(
//         where: {
//           level: ${normalizedLevel},
//           ${courseTags ? `tags_contains_all: ["${courseTags}"],` : ''}
//           id_not: "${courseId}"
//         },
//         first: 3
//       ) {
//         id
//         name
//         price
//         level
//         tags
//         time
//         author
//         banner {
//           url
//         }
//         description {
//           markdown
//         }
//       }
//     }
//   `;
  
//   const result = await request(MASTER_URL, query);
//   return result;
// };

// export const getRecommendedCourses = async (courseTags, courseLevel, courseId) => {
//   // Determine the recommended level (opposite of current level)

  
//   // Build the query using the same structure that was working before
//   const query = gql`
//     query GetRecommendedCourses {
//       courses(
//         where: {
//           level: ${courseLevel},
//           ${courseTags ? `tags_contains_all: ["${courseTags}"],` : ''}
//           id_not: "${courseId}"
//         },
//         first: 3
//       ) {
//         id
//         name
//         price
//         level
//         tags
//         time
//         author
//         banner {
//           url
//         }
//         description {
//           markdown
//         }
//       }
//     }
//   `;
  
//   try {
//     const result = await request(MASTER_URL, query);
    
//     // If no courses found with the first query, try a fallback query
//     // without the tag requirement
//     if (!result.courses || result.courses.length === 0) {
//       const fallbackQuery = gql`
//         query GetRecommendedCoursesFallback {
//           courses(
//             where: {
//               level: ${courseLevel},
//               id_not: "${courseId}"
//             },
//             first: 3
//           ) {
//             id
//             name
//             price
//             level
//             tags
//             time
//             author
//             banner {
//               url
//             }
//             description {
//               markdown
//             }
//           }
//         }
//       `;
      
//       const fallbackResult = await request(MASTER_URL, fallbackQuery);
      
//       // If we still don't have courses, return an empty array with a message
//       if (!fallbackResult.courses || fallbackResult.courses.length === 0) {
//         return { 
//           courses: [],
//           message: "No suitable courses available at the moment."
//         };
//       }
      
//       return fallbackResult;
//     }
    
//     return result;
//   } catch (error) {
//     console.error("Error fetching recommended courses:", error);
//     return { 
//       courses: [],
//       message: "Error fetching course recommendations."
//     };
//   }
// };