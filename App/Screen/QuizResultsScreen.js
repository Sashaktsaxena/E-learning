import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import Colors from '../Utils/Colors';
import { getUserQuizAttempts, GetUserQuizPerformance } from '../Services';
import { useUser } from '@clerk/clerk-expo';

const QuizResultsScreen = ({ route, navigation }) => {
  const { score, totalQuestions, quizTitle, courseId } = route.params;
  const [userRank, setUserRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPerformance, setUserPerformance] = useState(null);
  const { user } = useUser();
  
  const percentScore = Math.round((score / totalQuestions) * 100);
  
  useEffect(() => {
    if (user && user.primaryEmailAddress) {
      fetchUserPerformance();
    }
  }, [user]);
  
  const fetchUserPerformance = async () => {
    try {
      setIsLoading(true);
      const userEmail = user.primaryEmailAddress.emailAddress;
      const performanceData = await GetUserQuizPerformance(userEmail);
      
      if (performanceData && performanceData.userDetail) {
        setUserPerformance(performanceData.userDetail);
        
        // Calculate an estimated rank for display purposes
        // In a real app, you'd want a proper rank query from the backend
        const pointsEarned = calculatePointsEarned(score, totalQuestions);
        setUserRank({
          position: estimateRankPosition(performanceData.userDetail.point),
          pointsEarned: pointsEarned
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user performance:', error);
      setIsLoading(false);
    }
  };
  
  // Simple function to calculate points earned from this quiz
  const calculatePointsEarned = (score, total) => {
    const basePoints = 10;
    const scorePercentage = (score / total) * 100;
    let bonusPoints = 0;
    
    if (scorePercentage >= 90) bonusPoints = 15;
    else if (scorePercentage >= 80) bonusPoints = 10;
    else if (scorePercentage >= 70) bonusPoints = 5;
    
    return (score * basePoints) + bonusPoints;
  };
  
  // Simplified rank estimator
  const estimateRankPosition = (totalPoints) => {
    // This is just a placeholder - in a real app,
    // you would get actual rank from the backend
    if (totalPoints > 500) return "Top 10%";
    if (totalPoints > 300) return "Top 25%";
    if (totalPoints > 200) return "Top 50%";
    return "Keep going!";
  };

  // Determine result message based on score percentage
  const getResultMessage = () => {
    if (percentScore >= 80) return "Excellent!";
    if (percentScore >= 60) return "Good job!";
    if (percentScore >= 40) return "Not bad!";
    return "Keep practicing!";
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.quizTitle}>{quizTitle}</Text>
      <Text style={styles.resultMessage}>{getResultMessage()}</Text>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Your Score</Text>
        <Text style={styles.scoreValue}>{score}/{totalQuestions}</Text>
        <Text style={styles.percentageText}>{percentScore}%</Text>
        
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${percentScore}%` },
              percentScore >= 70 ? styles.highScore : 
              percentScore >= 40 ? styles.mediumScore : styles.lowScore
            ]} 
          />
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Updating leaderboard...</Text>
        </View>
      ) : userRank ? (
        <View style={styles.leaderboardPreview}>
          <Text style={styles.leaderboardTitle}>Leaderboard Update</Text>
          
          <View style={styles.pointsEarnedContainer}>
            <Text style={styles.pointsEarnedLabel}>Points Earned</Text>
            <Text style={styles.pointsEarnedValue}>+{userRank.pointsEarned}</Text>
          </View>
          
          <View style={styles.rankContainer}>
            <Text style={styles.rankLabel}>Your Standing</Text>
            <Text style={styles.rankValue}>{userRank.position}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.viewLeaderboardButton}
            onPress={() => navigation.navigate('LeaderBoard')}
          >
            <Text style={styles.viewLeaderboardText}>View Full Leaderboard</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      
      <View style={styles.buttonContainer}>
        {/* <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => navigation.navigate('couse-detail', {
            courseId: courseId,
          })}
        >
          <Text style={styles.buttonText}>Return to Course</Text>
        </TouchableOpacity> */}
        
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonSecondaryText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizTitle: {
    fontSize: 24,
    fontFamily: 'outfit-bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultMessage: {
    fontSize: 32,
    fontFamily: 'outfit-bold',
    marginBottom: 30,
    textAlign: 'center',
    color: Colors.PRIMARY,
  },
  scoreContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: Colors.LIGHT_PRIMARY,
    borderRadius: 16,
  },
  scoreLabel: {
    fontSize: 18,
    fontFamily: 'outfit-medium',
    color: Colors.GRAY,
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 48,
    fontFamily: 'outfit-bold',
    color: Colors.BLACK,
  },
  percentageText: {
    fontSize: 24,
    fontFamily: 'outfit-medium',
    marginBottom: 20,
    color: Colors.PRIMARY,
  },
  progressBarContainer: {
    width: '100%',
    height: 16,
    backgroundColor: Colors.LIGHT_GRAY,
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  highScore: {
    backgroundColor: '#4CAF50',
  },
  mediumScore: {
    backgroundColor: '#FFC107',
  },
  lowScore: {
    backgroundColor: '#F44336',
  },
  leaderboardPreview: {
    width: '100%',
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontFamily: 'outfit-bold',
    marginBottom: 15,
    color: Colors.PRIMARY,
    textAlign: 'center',
  },
  pointsEarnedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pointsEarnedLabel: {
    fontSize: 16,
    fontFamily: 'outfit-medium',
    color: Colors.GRAY,
  },
  pointsEarnedValue: {
    fontSize: 18,
    fontFamily: 'outfit-bold',
    color: '#4CAF50',
  },
  rankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rankLabel: {
    fontSize: 16,
    fontFamily: 'outfit-medium',
    color: Colors.GRAY,
  },
  rankValue: {
    fontSize: 18,
    fontFamily: 'outfit-bold',
    color: Colors.PRIMARY,
  },
  viewLeaderboardButton: {
    backgroundColor: Colors.LIGHT_PRIMARY,
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  viewLeaderboardText: {
    color: Colors.PRIMARY,
    textAlign: 'center',
    fontFamily: 'outfit-medium',
    fontSize: 14,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
  buttonPrimary: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
  },
  buttonSecondary: {
    padding: 15,
    borderRadius: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.GRAY,
  },
  buttonText: {
    color: Colors.WHITE,
    textAlign: 'center',
    fontFamily: 'outfit-medium',
    fontSize: 16,
  },
  buttonSecondaryText: {
    color: Colors.GRAY,
    textAlign: 'center',
    fontFamily: 'outfit-medium',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'outfit',
    color: Colors.GRAY,
  },
});

export default QuizResultsScreen;