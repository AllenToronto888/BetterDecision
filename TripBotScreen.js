import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
  AppState,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, typography, spacing } from "../theme";
import {
  Header,
  CreditButton,
  AIDisclaimer,
  CameraModal,
  Button,
  ContentReportModal,
} from "../components";
import { MediaUtils } from "../utils/mediaUtils";
import { AIServices } from "../utils/aiServices";
import { ErrorHandler } from "../utils/errorHandler";
import { useI18n } from "../hooks/useI18n";
import { useAuth } from "../contexts/AuthContext";
import { creditService } from "../utils/creditService";
import i18n from "../utils/i18n";
import { LanguageUtils } from "../utils/languageUtils";

const TripBotScreen = ({ navigation }) => {
  const { t } = useI18n();
  const { user, profile, isAuthenticated } = useAuth(); // Use proper authentication

  // Helper function to get user's language code (defined early to avoid hoisting issues)
  const getUserLanguageCode = () => {
    return LanguageUtils.getUserLanguageCode();
  };

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const textInputRef = useRef(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState("general");

  const [appState, setAppState] = useState(AppState.currentState);
  const creditButtonRef = useRef(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false); // Edit mode for customizing prompts
  const [quickPrompts, setQuickPrompts] = useState([]);
  const [guestSessionId, setGuestSessionId] = useState(null);

  // Media functionality states
  const [targetLanguage, setTargetLanguage] = useState(() =>
    getUserLanguageCode()
  ); // User's preferred language

  // Update target language when user changes language preference
  useEffect(() => {
    const updateLanguage = () => {
      setTargetLanguage(getUserLanguageCode());
    };

    // Listen for language changes
    i18n.addListener(updateLanguage);

    return () => {
      i18n.removeListener(updateLanguage);
    };
  }, []);

  // Load guest session ID for non-authenticated users
  useEffect(() => {
    const loadGuestSession = async () => {
      if (!isAuthenticated) {
        try {
          const { GuestSessionService } = await import(
            "../services/guestSessionService"
          );
          const sessionId = await GuestSessionService.getCurrentSessionId();
          setGuestSessionId(sessionId);
        } catch (error) {
          console.error("❌ [TripBot] Load guest session error:", error);
        }
      }
    };

    loadGuestSession();
  }, [isAuthenticated]);

  // Load quick prompts with version-based caching (only check version on init)
  useEffect(() => {
    const loadQuickPrompts = async () => {
      try {
        // Use QuickPromptService directly to get prompts from AppConfigService
        const { QuickPromptService } = require("../utils/quickPromptService");
        const prompts = await QuickPromptService.getPrompts("QuickPrompts");

        if (prompts && prompts.length > 0) {
          console.log(
            `[TripBotScreen] Loaded ${prompts.length} quick prompts from database`
          );
          setQuickPrompts(prompts);
        } else {
          console.warn("[TripBotScreen] No prompts found, using fallback");
          const service = new QuickPromptService();
          const fallbackPrompts = service.getHardcodedFallback("QuickPrompts");
          setQuickPrompts(fallbackPrompts);
        }
      } catch (error) {
        console.error("[TripBotScreen] Error loading quick prompts:", error);
        // Set fallback prompts on error
        const { QuickPromptService } = require("../utils/quickPromptService");
        const service = new QuickPromptService();
        const fallbackPrompts = service.getHardcodedFallback("QuickPrompts");
        setQuickPrompts(fallbackPrompts);
      }
    };

    loadQuickPrompts();
  }, []);

  // Get guest display name (same logic as Settings screen)
  const getGuestDisplayName = () => {
    if (guestSessionId && guestSessionId.startsWith("guest_")) {
      // Extract first 4 characters after 'guest_'
      const sessionPart = guestSessionId.substring(6); // Remove 'guest_'
      const first4Digits = sessionPart.substring(0, 4);
      return `Guest ${first4Digits}`;
    }
    return "Guest User";
  };

  // Dynamic greeting based on time of day with translation (without name)
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return t("greetingMorning");
    if (hour < 17) return t("greetingAfternoon");
    return t("greetingEvening");
  };

  // Get user name for separate display
  const getUserName = () => {
    // Get user name with proper guest session handling
    let fullName;
    if (isAuthenticated && profile?.name) {
      fullName = profile.name;
    } else if (isAuthenticated && user?.name) {
      fullName = user.name;
    } else {
      fullName = getGuestDisplayName();
    }

    // Extract first name only to keep greeting concise
    return fullName.startsWith("Guest") ? fullName : fullName.split(" ")[0];
  };

  // Enhanced AI status indicator
  const getAIStatus = () => {
    return "";
  };

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;

    const messagesNeeded = 1; // 1 message for text input
    const messageTypeForCost = "text";

    console.log(`🚀 [TripBotScreen.handleSendMessage] SERVICE TAP DETECTED:`);
    console.log(`   🎯 Service: Blue Send (${messageTypeForCost})`);
    console.log(`   💰 Cost: ${messagesNeeded} messages`);
    console.log(
      `   📊 Current button count: ${
        creditButtonRef.current?.getMessageCount() || "unknown"
      }`
    );

    // Deduct messages immediately when button is tapped, regardless of success or failure
    const deductionSuccess = await creditButtonRef.current?.deductMessages(
      messagesNeeded
    );
    if (!deductionSuccess) {
      console.log(
        `[TripBotScreen.handleSendMessage] Not enough messages for ${messageTypeForCost}.`
      );
      return; // Stop if not enough messages
    }

    // Use setTimeout to ensure state has updated
    setTimeout(() => {
      console.log(
        `✅ [TripBotScreen] DEDUCTION COMPLETE - Final button count: ${
          creditButtonRef.current?.getMessageCount() || "unknown"
        }`
      );
    }, 10);

    const newMessage = {
      id: `msg_${Date.now()}`,
      type: "user",
      content: text,
      timestamp: new Date().toISOString(),
      promptId: null, // Or link to a quick prompt if that flow is adapted
    };

    // Clear input immediately for better UX
    setInputText("");

    // Blur input to hide keyboard before navigation
    if (textInputRef.current) {
      textInputRef.current.blur();
    }

    // Text-only message from chatbox input (NOT a quick prompt)
    setTimeout(() => {
      const currentMessageCount =
        creditButtonRef.current?.getMessageCount() || 0;

      navigation.navigate("Chat", {
        initialMessages: [newMessage],
        messageCount: currentMessageCount,
        fromChatboxInput: true, // Flag to indicate this came from chatbox input (should use ChatGPTAPIService)
      });
    }, 100);
  };

  const handleGetStarted = () => {
    // Handle get started action
  };

  const handleViewBookings = () => {
    // Handle view bookings
  };

  const handleSettings = () => {
    // Handle settings
  };

  const handleHistory = () => {
    try {
      navigation.navigate("ChatHistory");
    } catch (error) {
      ErrorHandler.logError(error, "Navigate to History");
      ErrorHandler.handleNavigationError(error);
    }
  };

  const handleEdit = () => {
    // Toggle edit mode for customizing quick prompts
    setIsEditMode(!isEditMode);
  };

  const handleDeletePrompt = (promptId) => {
    // Remove this function since users shouldn't edit prompts
    // Quick prompts are managed by backend for optimal AI performance
  };

  const handleAddPrompt = () => {
    // Remove this function since users shouldn't add custom prompts
    // This maintains the integrity of the two-part prompt system
  };

  const handleQuickPrompt = async (prompt) => {
    try {
      if (!prompt || !prompt.displayText || !prompt.actionType) {
        throw new Error(
          "Invalid prompt data: Missing displayText or actionType"
        );
      }

      if (prompt.actionType === "text") {
        if (!prompt.aiPrompt) {
          throw new Error(
            "Invalid text prompt data: Missing aiPrompt for text actionType"
          );
        }
        // Deduct 2 messages immediately when quick prompt button is tapped, regardless of success or failure
        const messagesNeeded = 2; // Quick prompts cost 2 messages

        console.log(
          `🚀 [TripBotScreen.handleQuickPrompt] SERVICE TAP DETECTED:`
        );
        console.log(`   🎯 Service: Quick Prompt Button`);
        console.log(`   💰 Cost: ${messagesNeeded} messages`);
        console.log(
          `   📊 Current button count: ${
            creditButtonRef.current?.getMessageCount() || "unknown"
          }`
        );

        const deductionSuccess = await creditButtonRef.current?.deductMessages(
          messagesNeeded
        );
        if (!deductionSuccess) {
          console.log(
            "[TripBotScreen.handleQuickPrompt] Not enough messages for quick prompt (2 messages needed)."
          );
          return; // Stop if not enough messages
        }

        // Use setTimeout to ensure state has updated
        setTimeout(() => {
          console.log(
            `✅ [TripBotScreen] QUICK PROMPT DEDUCTION COMPLETE - Final button count: ${
              creditButtonRef.current?.getMessageCount() || "unknown"
            }`
          );
        }, 10);

        console.log(
          "[TripBotScreen.handleQuickPrompt] Text prompt selected. User sees:",
          prompt.displayText
        );
        console.log(
          "[TripBotScreen.handleQuickPrompt] AI receives:",
          prompt.aiPrompt
        );

        const userMessage = {
          id: `msg_${Date.now()}`,
          type: "user",
          content: prompt.displayText, // User sees the display text
          aiSystemPrompt: prompt.aiPrompt, // Store the detailed AI prompt separately if needed by ChatScreen
          timestamp: new Date().toISOString(),
          promptId: prompt.id,
          isFromQuickPrompt: true, // Flag to identify this message as from quick prompt
        };

        // Blur input to hide keyboard before navigation (if focused)
        if (textInputRef.current) {
          textInputRef.current.blur();
        }

        // Immediate navigation for better performance
        const currentMessageCount =
          creditButtonRef.current?.getMessageCount() || 0;

        navigation.navigate("Chat", {
          initialMessages: [userMessage],
          // Pass the current count for ChatScreen
          messageCount: currentMessageCount,
          fromQuickPrompt: true, // Flag to indicate this came from a quick prompt
        });
      } else if (prompt.actionType === "photo") {
        console.log(
          "[TripBotScreen.handleQuickPrompt] Photo prompt selected:",
          prompt.displayText
        );

        // For P6 quick prompt, automatically set analysis type to 'menu' and skip selection dialog
        if (prompt.id === "P6") {
          console.log(
            "[TripBotScreen.handleQuickPrompt] P6 detected - setting analysis type to menu"
          );
          setSelectedAnalysisType("menu");
          setShowCameraModal(true);
        } else {
          // For other photo prompts, show selection dialog
          Alert.alert(t("photoAnalysis"), t("whatWouldYouLikeToAnalyze"), [
            {
              text: t("menuTranslation"),
              onPress: () => {
                setShowCameraModal(true);
                setSelectedAnalysisType("menu");
              },
            },
            {
              text: t("landmarkIdentification"),
              onPress: () => {
                setShowCameraModal(true);
                setSelectedAnalysisType("landmark");
              },
            },
            {
              text: t("generalPhotoAnalysis"),
              onPress: () => {
                setShowCameraModal(true);
                setSelectedAnalysisType("general");
              },
            },
            {
              text: t("cancel"),
              style: "cancel",
            },
          ]);
        }
        // Credits for photos are handled when the photo is actually processed
      } else {
        console.warn(
          "[TripBotScreen.handleQuickPrompt] Unknown actionType:",
          prompt.actionType
        );
      }
    } catch (error) {
      ErrorHandler.logError(error, "Quick Prompt Action");
      // Consider if a more specific error alert is needed here based on the error type
      Alert.alert(
        "Error",
        "Could not process the selected quick prompt. Please try again."
      );
      // ErrorHandler.handleNavigationError(error); // Only call this if navigation was attempted and failed
    }
  };

  const sendMessageToServer = async (userMessage, aiPrompt) => {
    try {
      // Get user token from storage or auth context
      // For now, we'll mock this - replace with actual auth implementation
      const userToken = null; // TODO: Get from AsyncStorage or Auth Context

      if (!userToken) {
        // For development: Skip server call if no token
        console.log("No user token - skipping server call");

        // Mock AI response for development
        setTimeout(() => {
          const aiMessage = {
            id: `ai_${Date.now()}`,
            type: "ai",
            content:
              "This is a mock AI response. Server integration will be implemented with backend.",
            timestamp: new Date().toISOString(),
            tokensUsed: 150,
          };

          setMessages((prev) => [...prev, aiMessage]);
        }, 1000);

        return;
      }

      // API call to backend (when token is available)
      const response = await fetch("/api/chat/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          aiPrompt: aiPrompt,
          conversationId: currentConversationId || null,
          promptId: userMessage.promptId,
        }),
      });

      const data = await response.json();

      // 3. Add AI response to local state
      const aiMessage = {
        id: data.messageId,
        type: "ai",
        content: data.response,
        timestamp: data.timestamp,
        tokensUsed: data.tokensUsed,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // 4. Update usage count from server - now handled by CreditButton
      // REMOVED: setMessageCount(data.remainingMessages);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Handle offline mode - keep message locally, sync later
      // Show retry option to user
    }
  };

  const handleCameraInput = async () => {
    try {
      // No message deduction when just tapping camera - only deduct when actually sending image

      // Use local translations only - no database fetch needed
      Alert.alert(t("photoAnalysis"), t("whatWouldYouLikeToAnalyze"), [
        {
          text: t("menuTranslation"),
          onPress: () => {
            setShowCameraModal(true);
            setSelectedAnalysisType("menu");
          },
        },
        {
          text: t("landmarkIdentification"),
          onPress: () => {
            setShowCameraModal(true);
            setSelectedAnalysisType("landmark");
          },
        },
        {
          text: t("generalPhotoAnalysis"),
          onPress: () => {
            setShowCameraModal(true);
            setSelectedAnalysisType("general");
          },
        },
        {
          text: t("cancel"),
          style: "cancel",
        },
      ]);
    } catch (error) {
      ErrorHandler.logError(error, "Camera Input");
      Alert.alert(t("cameraError"), t("cameraNotAvailableEnvironment"));
    }
  };

  const handleImageTaken = async (imageResult) => {
    console.log(
      "[TripBotScreen.handleImageTaken] Image received:",
      imageResult
    );
    if (imageResult && imageResult.uri) {
      setShowCameraModal(false);

      // Deduct messages for image analysis
      const messagesNeeded = 3; // 3 messages for image analysis
      console.log(
        `🚀 [TripBotScreen.handleImageTaken] SERVICE PROCESSING DETECTED:`
      );
      console.log(
        `   🎯 Service: Image Analysis (${imageResult.analysisType})`
      );
      console.log(`   💰 Cost: ${messagesNeeded} messages`);

      const deductionSuccess = await creditButtonRef.current?.deductMessages(
        messagesNeeded
      );
      if (!deductionSuccess) {
        console.log(
          "[TripBotScreen.handleImageTaken] Not enough messages for image analysis."
        );
        Alert.alert(t("insufficientMessages"), t("notEnoughMessages"));
        return;
      }

      // Process image analysis immediately and navigate to chat with results
      const analysisType = imageResult.analysisType || "general";
      console.log(
        `[TripBotScreen.handleImageTaken] Processing ${analysisType} analysis immediately`
      );

      // Create user message with image
      const imageMessage = {
        id: `msg_${Date.now()}`,
        type: "user",
        content: "",
        imageUri: imageResult.uri,
        analysisType: analysisType,
        timestamp: new Date().toISOString(),
      };

      // Create thinking message for immediate feedback
      const thinkingMessage = {
        id: `ai_${Date.now()}`,
        type: "ai",
        content: "...", // This will be rendered as a thinking indicator
        isLoading: true,
        timestamp: new Date().toISOString(),
      };

      // Generate localized chat title based on analysis type
      let localizedTitle;
      switch (analysisType) {
        case "menu":
          localizedTitle = t("menuTranslation");
          break;
        case "landmark":
          localizedTitle = t("landmarkIdentification");
          break;
        case "general":
        default:
          localizedTitle = t("generalPhotoAnalysis");
          break;
      }

      // Navigate to chat with the messages and start processing
      navigation.navigate("Chat", {
        initialMessages: [imageMessage, thinkingMessage],
        chatTitle: localizedTitle,
        imageUri: imageResult.uri,
        analysisType: analysisType,
        autoProcessImage: true, // Flag to auto-process the image
      });
    } else {
      console.warn(
        "[TripBotScreen.handleImageTaken] Image result is invalid or has no URI."
      );
      setShowCameraModal(false);
    }
  };

  // Header button configurations with back button and history button
  const leftButtons = (() => {
    const buttons = [];

    // Always include back button - goes to previous screen or AI Planner if no previous screen
    buttons.push({
      iconComponent: (
        <MaterialIcons
          name="chevron-left"
          size={30}
          color={colors.text.primary}
        />
      ),
      onPress: () => {
        console.log("🔙 [TripBot] Back button pressed");

        // Get the current navigation state
        const state = navigation.getState();
        console.log(
          "📊 [TripBot] Navigation state:",
          JSON.stringify(state, null, 2)
        );

        // Check if we're at the root of the TripBot stack
        const isRootOfStack = state.index === 0;
        console.log(`🧭 [TripBot] Is root of stack: ${isRootOfStack}`);

        // List of auth screens to avoid going back to
        const authScreens = [
          "Login",
          "SignUp",
          "Intro",
          "OnboardingStep1",
          "OnboardingStep2",
          "OnboardingStep3",
        ];

        // Get parent navigator state if available
        const parentState = navigation.getParent()?.getState();
        console.log(
          "👆 [TripBot] Parent navigation state:",
          parentState ? JSON.stringify(parentState, null, 2) : "No parent state"
        );

        if (isRootOfStack) {
          // We're at the root of the TripBot stack, check if we can determine the previous tab
          if (parentState && parentState.type === "tab") {
            const currentTabIndex = parentState.index; // Current tab (should be TripBot)
            const currentTabName = parentState.routes[currentTabIndex]?.name;

            console.log(
              `📍 [TripBot] Current tab: ${currentTabName} (index: ${currentTabIndex})`
            );

            // Since tab navigation history doesn't work for bottom tabs,
            // we'll look at other tabs to see which one has active nested navigation
            // This indicates it was recently used
            let previousTab = null;
            const allTabs = parentState.routes;

            console.log(
              `🔍 [TripBot] Checking all tabs for previous activity:`
            );

            // Check each tab (except TripBot) for nested navigation state
            for (const route of allTabs) {
              if (route.name !== "TripBot") {
                // Check if this tab has nested navigation state
                const hasNestedNavigation =
                  route.state &&
                  route.state.routes &&
                  route.state.routes.length > 0;
                const nestedIndex = route.state?.index || 0;
                const activeNestedRoute = hasNestedNavigation
                  ? route.state.routes[nestedIndex]?.name
                  : "none";

                console.log(
                  `  📋 [TripBot] Tab "${route.name}": hasNested=${hasNestedNavigation}, activeRoute="${activeNestedRoute}"`
                );

                // Prioritize tabs that have deeper navigation (more likely to be recently used)
                if (hasNestedNavigation && !previousTab) {
                  previousTab = route.name;
                }
              }
            }

            console.log(
              `🔍 [TripBot] Found previous tab from nested navigation: ${previousTab}`
            );

            if (previousTab) {
              console.log(
                `🎯 [TripBot] Navigating back to previous tab: ${previousTab}`
              );
              navigation.navigate(previousTab);
            } else {
              // No previous tab found, use a smart default based on tab order
              // If no nested navigation found, default to AIPlanner (most commonly used)
              console.log(
                "🏠 [TripBot] No previous tab activity found, defaulting to AIPlanner"
              );
              navigation.navigate("AIPlanner");
            }
          } else {
            // No parent tab state, default to AIPlanner
            console.log(
              "🏠 [TripBot] No parent tab state, navigating to AIPlanner"
            );
            navigation.navigate("AIPlanner");
          }
        } else if (navigation.canGoBack()) {
          // We're not at the root, so we can go back within the TripBot stack
          const routes = state.routes;
          const currentRouteIndex = state.index;
          const previousRoute =
            currentRouteIndex > 0 ? routes[currentRouteIndex - 1] : null;

          console.log(
            `📱 [TripBot] Previous route in stack: ${
              previousRoute ? previousRoute.name : "none"
            }`
          );

          if (
            previousRoute &&
            authScreens.some((screen) => previousRoute.name.includes(screen))
          ) {
            // Don't go back to auth screens, go to AIPlanner instead
            console.log(
              `🚫 [TripBot] Preventing navigation to auth screen: ${previousRoute.name}`
            );
            navigation.navigate("AIPlanner");
          } else {
            // Normal back behavior for all other screens
            console.log("✅ [TripBot] Going back to previous screen in stack");
            navigation.goBack();
          }
        } else {
          // Fallback to AIPlanner if we can't go back
          console.log("🔄 [TripBot] Cannot go back, navigating to AIPlanner");
          navigation.navigate("AIPlanner");
        }
      },
    });

    // Always include history button (8px spacing handled by Header component)
    buttons.push({
      iconComponent: (
        <MaterialIcons name="history" size={30} color={colors.text.primary} />
      ),
      onPress: handleHistory,
    });

    return buttons;
  })();

  const rightButtons = [
    // No buttons needed - TripBotScreen is already for starting new chats
  ];

  // Handle app state changes to prevent keyboard issues when returning from background
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      // If app is coming back to foreground, blur the input to prevent layout issues
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        if (textInputRef.current) {
          textInputRef.current.blur();
        }
      }

      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [appState]);

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 48 : 12} // Match ChatScreen spacing
    >
      {/* Universal Header with Credit Button */}
      <View style={styles.headerContainer}>
        <Header
          title={t("tripBot")}
          leftButtons={leftButtons}
          rightButtons={rightButtons}
          style={styles.headerWithButton}
        />
        <CreditButton
          ref={creditButtonRef}
          onNavigateToPremium={() => navigation.navigate("PriceCard")}
          onMessageCountChanged={(newCount) => {
            /* Silent */
          }}
          style={styles.creditButtonPosition}
        />
      </View>

      {/* Dynamic Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>{getGreeting()}</Text>
        <Text style={styles.nameText}>{getUserName()}</Text>
        <Text style={styles.aiStatusText}>{getAIStatus()}</Text>
      </View>

      {/* Quick Prompts - Vertical Scrollable */}
      <ScrollView
        style={styles.chatContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.messagesContainer}>
          {quickPrompts.map((prompt) => (
            <TouchableOpacity
              key={prompt.id}
              style={styles.promptItem}
              onPress={() => handleQuickPrompt(prompt)}
              activeOpacity={0.7}
            >
              <View style={styles.promptContent}>
                {prompt.icon && (
                  <Image source={prompt.icon} style={styles.promptIcon} />
                )}
                <Text style={styles.promptText}>{prompt.displayText}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Display chat messages if any */}
          {messages.map((message) => (
            <View key={message.id} style={styles.messageItem}>
              <Text style={styles.messageText}>{message.content}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Chat Input - Industry Standard Size with Keyboard Avoidance */}

      <View style={styles.chatInputContainer}>
        <View style={styles.chatInputBox}>
          <TextInput
            ref={textInputRef}
            style={styles.textInputArea}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t("askAnythingAboutTrip")}
            placeholderTextColor="#9e9e9e"
            multiline={true}
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
            blurOnSubmit={false}
            onFocus={() => {}}
            editable={true}
            textAlignVertical="top"
            scrollEnabled={true}
            autoFocus={false}
            autoCorrect={true}
            autoCapitalize="sentences"
          />

          <View style={styles.iconActionRow}>
            <View style={styles.leftIconsContainer}>
              <TouchableOpacity
                style={styles.inputButton}
                onPress={handleCameraInput}
              >
                <Image
                  source={require("../../assets/icons/camera_grey.png")}
                  style={styles.inputButtonImage}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <LinearGradient
                colors={["#40c3ff", "#0074d9"]}
                style={styles.sendButtonGradient}
              >
                <MaterialIcons name="send" size={30} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* AI Disclaimer outside KeyboardAvoidingView to stay fixed */}
      <AIDisclaimer />

      {/* Camera Modal */}
      <CameraModal
        visible={showCameraModal}
        onClose={() => {
          // Use setTimeout to prevent setState during render
          setTimeout(() => setShowCameraModal(false), 0);
        }}
        onImageTaken={handleImageTaken}
        analysisType={selectedAnalysisType}
      />


    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  greetingContainer: {
    paddingHorizontal: 16,
    paddingTop: 24, // Keep 24px top spacing
    paddingBottom: 4, // Reduced to 16px bottom spacing
  },
  greetingText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.fontSize.tagline,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary,
    textAlign: "center",
  },
  nameText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.fontSize.tagline,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary,
    textAlign: "center",
    marginTop: 0, // Small spacing between greeting and name
  },
  aiStatusText: {
    fontFamily: typography.fonts.secondary,
    fontSize: typography.fontSize.caption,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 4, // Reduced from 4px to 2px for minimal spacing
    opacity: 0.8,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4, // Ensure no top padding
  },
  messagesContainer: {
    paddingTop: 0, // Remove top padding to avoid double spacing with greeting container
    paddingBottom: 0, // Remove bottom padding that was causing excessive spacing
  },
  promptContainer: {
    marginBottom: spacing.margin.sm,
  },
  promptItem: {
    backgroundColor: colors.surface,
    padding: spacing.padding.sm,
    borderRadius: 16,
    marginBottom: spacing.margin.sm,
    borderWidth: 0,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  promptContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptIcon: {
    width: 30,
    height: 30,
    marginRight: spacing.margin.sm,
    resizeMode: 'contain',
  },
  promptText: {
    fontFamily: typography.fonts.secondary,
    fontSize: typography.fontSize.body,
    color: colors.text.primary, // #333333 as requested
    lineHeight: typography.lineHeight.body,
    flex: 1, // Allow text to take remaining space
  },
  chatInputContainer: {
    paddingHorizontal: 16,
    paddingBottom: spacing.padding.xs, // Reduced from md to xs for minimal spacing
    backgroundColor: colors.background, // Ensure background matches
  },
  chatInputBox: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16, // 16px horizontal
    paddingVertical: spacing.padding.sm, // 16px vertical (industry standard)
    minHeight: 56, // Industry standard chat input height
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 40, // Ensure proper touch target
  },
  iconActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.margin.sm, // Spacing above the icon row
  },
  leftIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.margin.xs, // Add spacing between icons
  },
  inputButtonImage: {
    width: 30,
    height: 30,
  },
  inputButtonRecording: {
    // No background styling needed
  },

  inputButtonImageActive: {
    tintColor: colors.primary,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    position: "absolute",
    bottom: 4,
    right: 4,
  },
  textInputArea: {
    minHeight: 36, // Match button height
    maxHeight: 120, // Increased from 100 to 120 for more lines
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.padding.xs,
    paddingVertical: spacing.padding.xs,
    fontFamily: typography.fonts.secondary,
    fontSize: typography.fontSize.body,
    color: colors.text.primary,
    textAlignVertical: "top", // Better alignment for multiline
    borderRadius: 8, // Add slight border radius
    width: "100%", // Ensure it takes full width within parent's padding
    marginBottom: spacing.margin.sm, // Spacing below the TextInput
  },
  sendButton: {
    width: 44, // Increased from 36px to 44px
    height: 44, // Increased from 36px to 44px
    borderRadius: 22, // Updated to match new size
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonGradient: {
    width: 44, // Increased from 36px to 44px
    height: 44, // Increased from 36px to 44px
    borderRadius: 22, // Updated to match new size
    justifyContent: "center",
    alignItems: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.padding.lg,
    width: "80%",
    maxHeight: "80%",
  },
  premiumBanner: {
    borderRadius: 10,
    padding: spacing.padding.md,
    marginBottom: spacing.margin.md,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  giftIcon: {
    fontSize: 24,
    fontWeight: "bold",
    marginRight: spacing.margin.sm,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.fontSize.body,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  bannerSubtitle: {
    fontFamily: typography.fonts.secondary,
    fontSize: typography.fontSize.body,
    color: colors.text.primary,
  },
  bannerArrow: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.fontSize.body,
    fontWeight: "bold",
    color: colors.surface,
  },
  usageInfo: {
    marginBottom: spacing.margin.md,
  },
  usageTitle: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.fontSize.body,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: spacing.margin.sm,
  },
  usageDescription: {
    fontFamily: typography.fonts.secondary,
    fontSize: typography.fontSize.body,
    color: colors.text.primary,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.padding.sm,
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.margin.sm,
  },
  cancelButtonText: {
    fontFamily: typography.fonts.primary,
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.secondary,
  },
  laterButton: {
    backgroundColor: colors.surface,
    padding: spacing.padding.md,
    borderRadius: 10,
    flex: 1,
    marginRight: spacing.margin.sm,
    alignItems: "center",
  },
  laterButtonText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.fontSize.body,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  claimButton: {
    backgroundColor: colors.surface,
    padding: spacing.padding.md,
    borderRadius: 10,
  },
  claimButtonGradient: {
    borderRadius: 10,
    padding: spacing.padding.md,
  },
  claimButtonText: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.fontSize.body,
    fontWeight: "bold",
    color: colors.surface,
  },
  usageStats: {
    marginTop: spacing.margin.md,
    alignItems: "center",
  },
  statsText: {
    fontFamily: typography.fonts.secondary,
    fontSize: typography.fontSize.body,
    color: colors.text.primary,
  },
  messageItem: {
    padding: spacing.padding.md,
  },
  messageText: {
    fontFamily: typography.fonts.secondary,
    fontSize: typography.fontSize.body,
    color: colors.text.primary,
  },

  processingSubtext: {
    fontFamily: typography.fonts.secondary,
    fontSize: typography.fontSize.caption,
    color: colors.text.secondary,
    marginTop: spacing.margin.xs,
    textAlign: "center",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.margin.sm,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: spacing.margin.sm,
  },
  removeImageButton: {
    position: "absolute",
    top: -5,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  headerContainer: {
    position: "relative", // Allow absolute positioning of CreditButton
  },
  headerWithButton: {
    // Keep Header's original padding and sizing
  },
  creditButtonPosition: {
    position: "absolute",
    top: 6, // Changed from 12 to 6 for vertical centering (56-44)/2
    right: 16, // 16px spacing as requested
    zIndex: 10,
  },
});

export default TripBotScreen;
