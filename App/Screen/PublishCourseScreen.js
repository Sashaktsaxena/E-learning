import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { request, gql } from 'graphql-request';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';

// Replace with your Hygraph Master URL
const MASTER_URL = "https://api-ap-south-1.hygraph.com/v2/cm85thfvs00kp07wfuncjvdjy/master";
const UPLOAD_URL = "https://api-ap-south-1.hygraph.com/v2/cm85thfvs00kp07wfuncjvdjy/master/upload";
// Leave this empty - you'll fill in your token
// Old:
// const UPLOAD_URL = "https://api-ap-south-1.hygraph.com/v2/cm85thfvs00kp07wfuncjvdjy/master/upload";
// New:
// const UPLOAD_URL = "https://api-ap-south-1.hygraph.com/v2/cm85thfvs00kp07wfuncjvdjy/master/upload/asset";
const HYGRAPH_AUTH_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE3NDQ0ODExODAsImF1ZCI6WyJodHRwczovL2FwaS1hcC1zb3V0aC0xLmh5Z3JhcGguY29tL3YyL2NtODV0aGZ2czAwa3AwN3dmdW5janZkankvbWFzdGVyIiwibWFuYWdlbWVudC1uZXh0LmdyYXBoY21zLmNvbSJdLCJpc3MiOiJodHRwczovL21hbmFnZW1lbnQtYXAtc291dGgtMS5oeWdyYXBoLmNvbS8iLCJzdWIiOiJjNjdjOWZkOS0zMWIxLTRhMTItYTIwOS0xY2NmN2ZiYTdhYzIiLCJqdGkiOiJjbTllajF4bjMwcHpjMDdvNzVkOWk3bnBnIn0.v4vvRQjbrlGSDMMVxUISMdLvUIAFnRP_31kU3uCYNJnN68lDXJbKAuhIfDNpECQt99zBMk5dz9bkYNrvWeBaXA08q_rzuWiuwlpFT_JsgdNLM88nEy__OPffBXgh90vbWSHQgycj9ME9OMnqB3aECbxERSLvTEjZidVuo1p4wagRouaw2rh1t7Md1VE69VUc_IPCSNskHXVQJ7AO3h5fMph723szvYYgiZwzggXY6StSDNCBJLKOlUtaPOHiiIN4Si5uudI5w6xrsRkZPUzCQIMbzx03LNGRCq_xQ7WWkek7rGY1pvd5GXb5nAaD95AtK1a8dU0pnU14xNs5mfc3gmJOiBlXQ_ELcLt5J63ZgFTHPgDUqX5KhxliT4UTWho1akHyukXw4GLSLsOynhcGnPefxp_mwXM1gqBBoOsk6xPZ381TazC5MywBCjtcvEs6pIXQRoDx6ZD3F7A2Th5ydyFV3cW4x6_ylkD9P2GGJpKxaUtNu1YV93N-a39OU0yhvCTEwW0HUprgiqwQraKJ7nkbmqwCtXvv9x738uELY-NJ6fJ78lYCokEBOhlnrSpI5IIWdrw67YaWEmFAZTfO3Sj0zeJP4G1paby-em7GDzFfEJuxMPwFAaZ-ECyPWzFaPXxPfACTFl4zoQ6PHneZKCrJUmxdp1PE6xaD2SAn0rE"; // You will fill this in

const PublishCourseScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Course basic details
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseBanner, setCourseBanner] = useState(null);
  const [courseTime, setCourseTime] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  
  // Enumerations
  const [author, setAuthor] = useState('');
  const authors = ['sashy']; // Replace with your actual enum values
  
  const [level, setLevel] = useState('');
  const levels = ['basic', 'advance','moderate']; // From your GraphQL query
  
  const [selectedTags, setSelectedTags] = useState([]);
  const availableTags = ['CSS', 'HTML', 'webdev', 'DSA']; // Replace with your actual enum values
  
  // Chapters
  const [chapters, setChapters] = useState([]);
  
  // For editing chapter details
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(null);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContents, setChapterContents] = useState([]);
  
  // For editing chapter content details
  const [showContentForm, setShowContentForm] = useState(false);
  const [currentContentIndex, setCurrentContentIndex] = useState(null);
  const [contentHeading, setContentHeading] = useState('');
  const [contentDescription, setContentDescription] = useState('');
  const [contentOutput, setContentOutput] = useState('');

  // Handle banner image selection
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your media library');
        return;
      }
      
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8, // Reduced quality to decrease file size
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCourseBanner(result.assets[0].uri);
        console.log("Selected image URI:", result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  // Tag selection handling
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Chapter management
  const addNewChapter = () => {
    setCurrentChapterIndex(null);
    setChapterTitle('');
    setChapterContents([]);
    setShowChapterForm(true);
  };

  const editChapter = (index) => {
    setCurrentChapterIndex(index);
    setChapterTitle(chapters[index].title);
    setChapterContents([...chapters[index].content]);
    setShowChapterForm(true);
  };

  const deleteChapter = (index) => {
    Alert.alert(
      "Delete Chapter",
      "Are you sure you want to delete this chapter?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: () => {
            const updatedChapters = [...chapters];
            updatedChapters.splice(index, 1);
            setChapters(updatedChapters);
          },
          style: "destructive"
        }
      ]
    );
  };

  const saveChapter = () => {
    if (!chapterTitle.trim()) {
      Alert.alert("Error", "Chapter title is required");
      return;
    }

    const chapterData = {
      title: chapterTitle,
      content: chapterContents
    };

    let updatedChapters = [...chapters];
    
    if (currentChapterIndex !== null) {
      // Update existing chapter
      updatedChapters[currentChapterIndex] = chapterData;
    } else {
      // Add new chapter
      updatedChapters.push(chapterData);
    }
    
    setChapters(updatedChapters);
    setShowChapterForm(false);
  };

  // Chapter content management
  const addNewContent = () => {
    setCurrentContentIndex(null);
    setContentHeading('');
    setContentDescription('');
    setContentOutput('');
    setShowContentForm(true);
  };

  const editContent = (index) => {
    setCurrentContentIndex(index);
    setContentHeading(chapterContents[index].heading);
    setContentDescription(chapterContents[index].description || '');
    setContentOutput(chapterContents[index].output || '');
    setShowContentForm(true);
  };

  const deleteContent = (index) => {
    Alert.alert(
      "Delete Content",
      "Are you sure you want to delete this content section?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: () => {
            const updatedContents = [...chapterContents];
            updatedContents.splice(index, 1);
            setChapterContents(updatedContents);
          },
          style: "destructive"
        }
      ]
    );
  };

  const saveContent = () => {
    if (!contentHeading.trim()) {
      Alert.alert("Error", "Content heading is required");
      return;
    }

    const contentData = {
      heading: contentHeading,
      description: contentDescription,
      output: contentOutput
    };

    let updatedContents = [...chapterContents];
    
    if (currentContentIndex !== null) {
      // Update existing content
      updatedContents[currentContentIndex] = contentData;
    } else {
      // Add new content
      updatedContents.push(contentData);
    }
    
    setChapterContents(updatedContents);
    setShowContentForm(false);
  };

  // Form validation
  const validateForm = () => {
    if (!courseName.trim()) {
      Alert.alert("Error", "Course name is required");
      return false;
    }
    
    if (!courseDescription.trim()) {
      Alert.alert("Error", "Course description is required");
      return false;
    }
    
    if (!courseBanner) {
      Alert.alert("Error", "Course banner image is required");
      return false;
    }
    
    if (!courseTime.trim()) {
      Alert.alert("Error", "Course time is required");
      return false;
    }
    
    if (!coursePrice.trim()) {
      Alert.alert("Error", "Course price is required");
      return false;
    }
    
    if (!author) {
      Alert.alert("Error", "Please select an author");
      return false;
    }
    
    if (!level) {
      Alert.alert("Error", "Please select a course level");
      return false;
    }
    
    if (selectedTags.length === 0) {
      Alert.alert("Error", "Please select at least one tag");
      return false;
    }
    
    if (chapters.length === 0) {
      Alert.alert("Error", "Please add at least one chapter");
      return false;
    }

    return true;
  };

  // Upload banner image to Hygraph using FileSystem.uploadAsync
  const uploadBannerImage = async () => {
    try {
      console.log("Starting image upload process...");
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(courseBanner);
      console.log("File info:", fileInfo);
      
      if (!fileInfo.exists) {
        throw new Error("File does not exist at specified path");
      }
      
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(courseBanner, { encoding: 'base64' });
      
      // Create file object
      const fileName = courseBanner.split('/').pop();
      const fileType = fileName.split('.').pop().toLowerCase();
      const mimeType = fileType === 'jpg' || fileType === 'jpeg' ? 'image/jpeg' : 'image/png';
      
      // Correct way to construct the upload URL
      // Format: https://api-{region}.hygraph.com/v2/{projectId}/master/upload
      const ASSET_UPLOAD_URL = "https://api-ap-south-1.hygraph.com/v2/cm85thfvs00kp07wfuncjvdjy/master/upload";
      
      console.log("Using upload URL:", ASSET_UPLOAD_URL);
      console.log("Preparing upload with:", {
        fileName,
        contentType: mimeType
      });
      
      // Use fetch API for the upload
      const response = await fetch(ASSET_UPLOAD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HYGRAPH_AUTH_TOKEN}`
        },
        body: JSON.stringify({
          fileName: fileName,
          contentType: mimeType,
          base64: base64
        })
      });
      
      console.log("Upload response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload response error:", errorText);
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log("Upload successful:", responseData);
      
      // Return asset details
      return {
        id: responseData.id,
        url: responseData.url
      };
    } catch (error) {
      console.error("Error uploading banner image:", error);
      console.error("Error details:", error.message);
      Alert.alert("Upload Error", `Failed to upload image: ${error.message}`);
      throw error;
    }
  };
  // Submit the course to Hygraph
  const publishCourse = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Step 1: Upload banner image
      console.log("Starting image upload...");
      const bannerAsset = await uploadBannerImage();
      console.log("Banner uploaded successfully:", bannerAsset);
      
      // Step 2: Format chapter data for GraphQL
      const formattedChapters = chapters.map(chapter => {
        return {
          title: chapter.title,
          content: {
            create: chapter.content.map(content => {
              return {
                heading: content.heading,
                description: { markdown: content.description || '' },
                output: { markdown: content.output || '' }
              };
            })
          }
        };
      });
      
      // Step 3: Create the course using GraphQL mutation
      const mutationQuery = gql`
        mutation CreateCourse(
          $name: String!, 
          $description: String!, 
          $bannerId: ID!, 
          $time: String!, 
          $price: String!, 
          $author: Author!, 
          $level: CourseLevel!, 
          $tags: [Tags!]!, 
          $chapters: [ChapterCreateInput!]!
        ) {
          createCourse(
            data: {
              name: $name,
              description: { markdown: $description },
              banner: { connect: { id: $bannerId } },
              time: $time,
              price: $price,
              author: $author,
              level: $level,
              tags: $tags,
              chapters: { create: $chapters }
            }
          ) {
            id
            name
          }
          
          publishCourse(where: { name: $name }, to: PUBLISHED) {
            id
          }
        }
      `;
      
      // Prepare variables for the mutation
      const variables = {
        name: courseName,
        description: courseDescription,
        bannerId: bannerAsset.id,
        time: courseTime,
        price: coursePrice,
        author: author,
        level: level,
        tags: selectedTags,
        chapters: formattedChapters
      };
      
      // Send the request with authentication
      const result = await request(
        MASTER_URL, 
        mutationQuery, 
        variables, 
        {
          Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`  // Fixed: Using backticks
        }
      );
      
      console.log("Course published successfully:", result);
      setIsLoading(false);
      
      // Show success message
      Alert.alert(
        "Success",
        "Course published successfully!",
        [{ text: "OK", onPress: () => navigation.navigate('Home') }]
      );
      
    } catch (error) {
      setIsLoading(false);
      console.error("Error publishing course:", error);
      Alert.alert("Error", `Failed to publish course: ${error.message}`);
    }
  };

  // Render different sections based on state
  if (showContentForm) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setShowContentForm(false)}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {currentContentIndex !== null ? 'Edit Content' : 'Add Content'}
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.label}>Heading *</Text>
          <TextInput
            style={styles.input}
            value={contentHeading}
            onChangeText={setContentHeading}
            placeholder="Enter content heading"
          />
          
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={contentDescription}
            onChangeText={setContentDescription}
            placeholder="Enter detailed description with markdown support"
            multiline
            numberOfLines={8}
          />
          
          <Text style={styles.label}>Output/Result</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={contentOutput}
            onChangeText={setContentOutput}
            placeholder="Enter expected output or result with markdown support"
            multiline
            numberOfLines={8}
          />
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={saveContent}
          >
            <Text style={styles.buttonText}>Save Content</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (showChapterForm) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setShowChapterForm(false)}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {currentChapterIndex !== null ? 'Edit Chapter' : 'Add Chapter'}
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.label}>Chapter Title *</Text>
          <TextInput
            style={styles.input}
            value={chapterTitle}
            onChangeText={setChapterTitle}
            placeholder="Enter chapter title"
          />
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Chapter Contents</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addNewContent}
            >
              <Ionicons name="add-circle" size={24} color="#2196F3" />
              <Text style={styles.addButtonText}>Add Content</Text>
            </TouchableOpacity>
          </View>
          
          {chapterContents.length > 0 ? (
            chapterContents.map((content, index) => (
              <View key={index} style={styles.contentItem}>
                <Text style={styles.contentTitle}>{content.heading}</Text>
                <View style={styles.contentActions}>
                  <TouchableOpacity onPress={() => editContent(index)}>
                    <Ionicons name="create-outline" size={22} color="#2196F3" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteContent(index)}>
                    <Ionicons name="trash-outline" size={22} color="#FF6347" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyMessage}>No content sections added yet</Text>
          )}
          
          <TouchableOpacity 
            style={[
              styles.primaryButton, 
              chapterContents.length === 0 && styles.disabledButton
            ]}
            onPress={saveChapter}
            disabled={chapterContents.length === 0}
          >
            <Text style={styles.buttonText}>Save Chapter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Main form view
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Publish New Course</Text>
      </View>
      
      <View style={styles.formContainer}>
        {/* Basic Course Details */}
        <Text style={styles.sectionTitle}>Basic Details</Text>
        
        <Text style={styles.label}>Course Name *</Text>
        <TextInput
          style={styles.input}
          value={courseName}
          onChangeText={setCourseName}
          placeholder="Enter course name"
        />
        
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={courseDescription}
          onChangeText={setCourseDescription}
          placeholder="Enter course description with markdown support"
          multiline
          numberOfLines={5}
        />
        
        <Text style={styles.label}>Banner Image *</Text>
        <TouchableOpacity 
          style={styles.imagePickerButton}
          onPress={pickImage}
        >
          {courseBanner ? (
            <Image source={{ uri: courseBanner }} style={styles.bannerPreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={40} color="#999" />
              <Text style={styles.imagePlaceholderText}>Tap to select banner image</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <Text style={styles.label}>Course Duration *</Text>
        <TextInput
          style={styles.input}
          value={courseTime}
          onChangeText={setCourseTime}
          placeholder="e.g. 2h 30m"
        />
        
        <Text style={styles.label}>Price *</Text>
        <TextInput
          style={styles.input}
          value={coursePrice}
          onChangeText={setCoursePrice}
          placeholder="e.g. Free or $29.99"
          keyboardType="numeric"
        />
        
        {/* Enumerations */}
        <Text style={styles.sectionTitle}>Course Classification</Text>
        
        <Text style={styles.label}>Author *</Text>
        <View style={styles.optionsContainer}>
          {authors.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.optionItem,
                author === item && styles.selectedOption
              ]}
              onPress={() => setAuthor(item)}
            >
              <Text style={[
                styles.optionText,
                author === item && styles.selectedOptionText
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Level *</Text>
        <View style={styles.optionsContainer}>
          {levels.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.optionItem,
                level === item && styles.selectedOption
              ]}
              onPress={() => setLevel(item)}
            >
              <Text style={[
                styles.optionText,
                level === item && styles.selectedOptionText
              ]}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Tags *</Text>
        <View style={styles.tagsContainer}>
          {availableTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagItem,
                selectedTags.includes(tag) && styles.selectedTag
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[
                styles.tagText,
                selectedTags.includes(tag) && styles.selectedTagText
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Chapters */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chapters</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={addNewChapter}
          >
            <Ionicons name="add-circle" size={24} color="#2196F3" />
            <Text style={styles.addButtonText}>Add Chapter</Text>
          </TouchableOpacity>
        </View>
        
        {chapters.length > 0 ? (
          chapters.map((chapter, index) => (
            <View key={index} style={styles.chapterItem}>
              <View style={styles.chapterHeader}>
                <Text style={styles.chapterTitle}>{chapter.title}</Text>
                <Text style={styles.chapterMeta}>
                  {chapter.content.length} {chapter.content.length === 1 ? 'section' : 'sections'}
                </Text>
              </View>
              <View style={styles.chapterActions}>
                <TouchableOpacity onPress={() => editChapter(index)}>
                  <Ionicons name="create-outline" size={22} color="#2196F3" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteChapter(index)}>
                  <Ionicons name="trash-outline" size={22} color="#FF6347" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyMessage}>No chapters added yet</Text>
        )}
        
        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.publishButton, isLoading && styles.disabledButton]}
          onPress={publishCourse}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={[styles.buttonText, {marginLeft: 10}]}>Publishing...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Publish Course</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    width: '100%',
    height: 180,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#999',
  },
  bannerPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  optionItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#2196F3',
  },
  optionText: {
    color: '#555',
  },
  selectedOptionText: {
    color: '#fff',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tagItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedTag: {
    backgroundColor: '#2196F3',
  },
  tagText: {
    color: '#555',
  },
  selectedTagText: {
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#2196F3',
    marginLeft: 5,
    fontWeight: '500',
  },
  chapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chapterHeader: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  chapterMeta: {
    color: '#777',
    marginTop: 3,
    fontSize: 12,
  },
  chapterActions: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'space-between',
  },
  contentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contentTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  contentActions: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'space-between',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
    fontStyle: 'italic',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  publishButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default PublishCourseScreen;