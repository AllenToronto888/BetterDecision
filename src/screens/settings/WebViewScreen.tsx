import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { CustomHeader, useTheme } from '../../components';
import { useI18n } from '../../i18n';

const WebViewScreen = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { url, title } = route.params;

  const handleLoadStart = () => {
    // Could add loading state here if needed
  };

  const handleLoadEnd = () => {
    // Could add completion state here if needed
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    Alert.alert(
      t('error'),
      t('webViewError') || 'Failed to load the webpage. Please check your internet connection.',
      [{ text: t('ok'), onPress: () => navigation.goBack() }]
    );
  };

  const renderLoading = () => (
    <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <CustomHeader 
        title={title} 
        leftAction={{
          icon: 'arrow-back',
          onPress: () => navigation.goBack()
        }}
      />
      
      <WebView
        source={{ uri: url }}
        style={styles.webView}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        renderLoading={renderLoading}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsBackForwardNavigationGestures={true}
        scalesPageToFit={true}
        bounces={false}
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={true}
        pullToRefreshEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        userAgent="Mozilla/5.0 (Mobile; rv:117.0) Gecko/117.0 Firefox/117.0"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WebViewScreen;
