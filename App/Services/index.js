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