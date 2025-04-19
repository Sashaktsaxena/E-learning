import { request, gql } from 'graphql-request';

// Your Hygraph API endpoint and token
const MASTER_URL = "https://api-ap-south-1.hygraph.com/v2/cm85thfvs00kp07wfuncjvdjy/master";
const UPLOAD_URL = "https://api-ap-south-1.hygraph.com/v2/cm85thfvs00kp07wfuncjvdjy/master/upload";
const HYGRAPH_AUTH_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE3NDQxMTUzMzEsImF1ZCI6WyJodHRwczovL2FwaS1hcC1zb3V0aC0xLmh5Z3JhcGguY29tL3YyL2NtODV0aGZ2czAwa3AwN3dmdW5janZkankvbWFzdGVyIiwibWFuYWdlbWVudC1uZXh0LmdyYXBoY21zLmNvbSJdLCJpc3MiOiJodHRwczovL21hbmFnZW1lbnQtYXAtc291dGgtMS5oeWdyYXBoLmNvbS8iLCJzdWIiOiJlOWVkNzQwOC1hZTE2LTQ1M2ItOWQxMS02MWZlZGRiZjYxMTIiLCJqdGkiOiJjbTk4aDhqMXIwMmluMDdvOGdpdGZnZHgzIn0.ojRdIGJy4lTxZC863BXABQfqfyZpYJGPPan6zCZp0E6RbEqPqtqiflqOMM5U4tCjp9Mq0zXgrdljrAfcAbIpP0V-qPwzK-yYsYddSDKWtjb78w2hHHXRyj9V27ZniCLQE6Ttb4gpS49c9t3WlvT2dP1zICeRrYly_odp07MfZp3oU0zFogDuGRc7FN2rH4akbutbKHr5MK744IeBPJ5d7IomKRFG4DUy03vdNy7ypC1YSUTbmmD61MUd-GGDU-ewpxFd2UjnNp5NPaaOKxbIOwup3S_dN9MeQ5Sla-TrJfLu9rUdiRc4j4JljkLuM75j1-Vc_L3No15_db27YyA9yt7GMapRGRmtw-fQ2h1VWvu96fsPHp_mqHXMpGlgUBiwMsiyT9wjbrWHA2h4kdYVDGVeq3hu8qeVbz0koXAu7dkOoW5HaaVYYoTSdtCMBgVnSRRRkMV_Z7Ws21aUkeVn1hob1l7kHvroUqKAfCLrfPqRZ8_77pShPBk8f4bp01TlLb2AQCnPrk1n_HaLr3DEiSiU6q_RC2d5LS-2zFQUrCNb-jXe90LhuFDmmHVSLymAdf5_Cqf5cgeE5Zyu3fpXX5oXNWKVgxJLJJnYF7BknLFScJ-O1Vwx5CpT0-XksriYcT8Ne6ZfoSYcKWfYOmlh9hAIEoQsCBfkjh7YfSlVYac"; // Replace with your token if necessary

// ==================== READ OPERATION TESTS ====================

// Function to test the API token with basic schema query
const testBasicAccess = async () => {
  try {
    // Simple introspection query to check if we can access the API
    const query = gql`
      {
        __schema {
          types {
            name
          }
        }
      }
    `;
    
    console.log("Testing basic Hygraph API connection...");
    
    const result = await request(
      MASTER_URL,
      query,
      {},
      {
        Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`
      }
    );
    
    console.log("✅ Basic API connection successful!");
    return true;
  } catch (error) {
    console.error("❌ Basic API connection failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response details:", error.response.errors);
    }
    return false;
  }
};

// Function to test if we can query course data
const testCourseQuery = async () => {
  try {
    const query = gql`
      {
        courses(first: 1) {
          id
          name
        }
      }
    `;
    
    console.log("Testing course data query...");
    
    const result = await request(
      MASTER_URL,
      query,
      {},
      {
        Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`
      }
    );
    
    console.log("✅ Course query successful:", result);
    return true;
  } catch (error) {
    console.error("❌ Course query failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response details:", error.response.errors);
    }
    return false;
  }
};

// Function to test if we can query available enums (like authors, levels, tags)
const testEnumQuery = async () => {
  try {
    const query = gql`
      {
        __type(name: "CourseLevel") {
          enumValues {
            name
          }
        }
      }
    `;
    
    console.log("Testing enum query...");
    
    const result = await request(
      MASTER_URL,
      query,
      {},
      {
        Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`
      }
    );
    
    console.log("✅ Enum query successful:", result);
    return true;
  } catch (error) {
    console.error("❌ Enum query failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response details:", error.response.errors);
    }
    return false;
  }
};

// Function to test asset query permissions
const testAssetQuery = async () => {
  try {
    const query = gql`
      {
        assets(first: 1) {
          id
          url
          fileName
        }
      }
    `;
    
    console.log("Testing asset query permissions...");
    
    const result = await request(
      MASTER_URL,
      query,
      {},
      {
        Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`
      }
    );
    
    console.log("✅ Asset query successful:", result);
    return true;
  } catch (error) {
    console.error("❌ Asset query failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response details:", error.response.errors);
    }
    return false;
  }
};

// ==================== WRITE OPERATION TESTS ====================

// Function to test creating a temporary course (write permission)
const testCreateCourse = async () => {
  try {
    const mutation = gql`
      mutation CreateTemporaryCourse($name: String!, $description: String!) {
        createCourse(
          data: {
            name: $name,
            description: { markdown: $description },
            price: "TEST",
            time: "TEST",
            author: sashy, 
            level: basic
          }
        ) {
          id
          name
        }
      }
    `;
    
    console.log("Testing course creation (write permission)...");
    
    const variables = {
      name: `Test Course ${new Date().toISOString()}`,
      description: "This is a test course created by the API test script."
    };
    
    const result = await request(
      MASTER_URL,
      mutation,
      variables,
      {
        Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`
      }
    );
    
    console.log("✅ Course creation successful:", result);
    
    // Store the course ID for later deletion
    const courseId = result.createCourse.id;
    await testDeleteCourse(courseId);
    
    return true;
  } catch (error) {
    console.error("❌ Course creation failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response details:", error.response.errors);
    }
    return false;
  }
};

// Function to test deleting the temporary course (delete permission)
const testDeleteCourse = async (courseId) => {
  if (!courseId) {
    console.log("⚠️ Skipping course deletion test (no course ID provided)");
    return false;
  }
  
  try {
    const mutation = gql`
      mutation DeleteTemporaryCourse($id: ID!) {
        deleteCourse(where: { id: $id }) {
          id
        }
      }
    `;
    
    console.log("Testing course deletion (delete permission)...");
    
    const result = await request(
      MASTER_URL,
      mutation,
      { id: courseId },
      {
        Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`
      }
    );
    
    console.log("✅ Course deletion successful:", result);
    return true;
  } catch (error) {
    console.error("❌ Course deletion failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response details:", error.response.errors);
    }
    return false;
  }
};

// Function to test publish permission
const testPublishPermission = async () => {
  try {
    // First create a test course
    const createMutation = gql`
      mutation CreatePublishTestCourse {
        createCourse(
          data: {
            name: "Publish Test Course",
            description: { markdown: "Testing publish permissions" },
            price: "TEST",
            time: "TEST",
            author: sashy,
            level: basic
          }
        ) {
          id
          name
        }
      }
    `;
    
    console.log("Creating test course for publish test...");
    
    const createResult = await request(
      MASTER_URL,
      createMutation,
      {},
      {
        Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`
      }
    );
    
    const courseId = createResult.createCourse.id;
    console.log("Test course created with ID:", courseId);
    
    // Now try to publish it
    const publishMutation = gql`
      mutation PublishTestCourse($id: ID!) {
        publishCourse(where: { id: $id }, to: PUBLISHED) {
          id
          name
        }
      }
    `;
    
    console.log("Testing course publish permission...");
    
    const publishResult = await request(
      MASTER_URL,
      publishMutation,
      { id: courseId },
      {
        Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`
      }
    );
    
    console.log("✅ Course publish successful:", publishResult);
    
    // Clean up by deleting the test course
    await testDeleteCourse(courseId);
    
    return true;
  } catch (error) {
    console.error("❌ Publish permission test failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response details:", error.response.errors);
    }
    return false;
  }
};

// Function to test asset upload permission
const testAssetUpload = async () => {
  try {
    console.log("Testing asset upload permission...");
    console.log("⚠️ Note: This test requires a file to upload. In a Node.js environment, you would need to use a library like 'form-data' and 'node-fetch'.");
    console.log("⚠️ In React Native, you would use the FileSystem.uploadAsync method as in your original code.");
    console.log("⚠️ This test is only displaying the expected format for the upload request.");
    
    console.log(`
      Expected upload request format:
      - POST to ${UPLOAD_URL}
      - Headers:
        - Authorization: Bearer ${HYGRAPH_AUTH_TOKEN.substring(0, 10)}...
        - Content-Type: multipart/form-data
      - Body: FormData with file
    `);
    
    console.log("⚠️ To properly test file uploads, implement platform-specific file upload code or test directly in your app.");
    
    return null; // Return null as we can't actually perform this test here
  } catch (error) {
    console.error("❌ Asset upload test setup failed:", error.message);
    return false;
  }
};

// ==================== TEST EXECUTION ====================

// Run all tests
const runAllTests = async () => {
  console.log("=== STARTING HYGRAPH API TESTS ===");
  console.log("Time:", new Date().toISOString());
  console.log("\n=== READ OPERATIONS ===");
  
  const basicAccessResult = await testBasicAccess();
  const courseQueryResult = await testCourseQuery();
  const enumQueryResult = await testEnumQuery();
  const assetQueryResult = await testAssetQuery();
  
  console.log("\n=== WRITE OPERATIONS ===");
  
  const createCourseResult = await testCreateCourse();
  // Note: testDeleteCourse is called from within testCreateCourse
  const publishPermissionResult = await testPublishPermission();
  const assetUploadInfo = await testAssetUpload();
  
  console.log("\n=== TEST SUMMARY ===");
  console.log("== Read Operations ==");
  console.log(`Basic API Access: ${basicAccessResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Course Query: ${courseQueryResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Enum Query: ${enumQueryResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Asset Query: ${assetQueryResult ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log("\n== Write Operations ==");
  console.log(`Create Course: ${createCourseResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Publish Permission: ${publishPermissionResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Asset Upload: ⚠️ MANUAL TEST REQUIRED`);
  
  const readOpsSuccess = basicAccessResult && courseQueryResult && enumQueryResult && assetQueryResult;
  const writeOpsSuccess = createCourseResult && publishPermissionResult;
  
  if (readOpsSuccess && writeOpsSuccess) {
    console.log("\n✅ ALL TESTABLE OPERATIONS PASSED!");
    console.log("Your token appears to have the necessary read and write permissions.");
    console.log("Note: Asset upload needs to be tested in your actual application environment.");
  } else if (readOpsSuccess && !writeOpsSuccess) {
    console.log("\n⚠️ READ OPERATIONS PASSED BUT WRITE OPERATIONS FAILED");
    console.log("Your token may have read-only permissions or insufficient write permissions.");
  } else if (!readOpsSuccess && writeOpsSuccess) {
    console.log("\n⚠️ WRITE OPERATIONS PASSED BUT READ OPERATIONS FAILED");
    console.log("This is unusual and suggests selective permission configuration.");
  } else {
    console.log("\n❌ BOTH READ AND WRITE TESTS FAILED");
    console.log("Your token may be invalid, expired, or have insufficient permissions.");
  }
  
  console.log("\nFor asset upload testing, you will need to test directly in your application environment.");
  console.log("=== TEST COMPLETE ===");
};

// Execute all tests
runAllTests();