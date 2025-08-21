import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Share as RNShare, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Button } from './Button';

interface ShareComponentProps {
  data: any;
  dataType: 'calculation' | 'comparison' | 'decision' | 'custom';
  title?: string;
  customMessage?: string;
  variant?: 'button' | 'icon';
  includeAppPromo?: boolean;
  onShareSuccess?: () => void;
  onShareError?: (error: string) => void;
}

interface ShareData {
  title: string;
  message: string;
  url?: string;
}

export const Share: React.FC<ShareComponentProps> = ({
  data,
  dataType,
  title,
  customMessage,
  variant = 'button',
  includeAppPromo = true,
  onShareSuccess,
  onShareError,
}) => {
  const { theme } = useTheme();
  const [isSharing, setIsSharing] = useState(false);

  const formatCalculationData = (calcData: any): string => {
    if (calcData.products && Array.isArray(calcData.products)) {
      // Unit Calculator
      let message = '🧮 Unit Price Comparison:\n\n';
      calcData.products.forEach((product: any, index: number) => {
        const isBest = index === calcData.bestProductIndex;
        message += `${isBest ? '⭐ ' : ''}${product.name || `Product ${index + 1}`}\n`;
        message += `   Price: $${product.price} for ${product.quantity}${product.unit}\n`;
        message += `   Unit Price: $${product.unitPrice?.toFixed(4)} per unit\n\n`;
      });
      return message;
    } else if (calcData.totalCost !== undefined) {
      // Total Cost Calculator
      let message = '💰 Total Cost Calculation:\n\n';
      message += `Base Price: $${calcData.basePrice}\n`;
      if (calcData.additionalCosts?.length) {
        message += '\nAdditional Costs:\n';
        calcData.additionalCosts.forEach((cost: any) => {
          message += `• ${cost.label}: ${cost.isPercentage ? cost.value + '%' : '$' + cost.value}\n`;
        });
      }
      message += `\nTotal Cost: $${calcData.totalCost.toFixed(2)}`;
      return message;
    } else if (calcData.startDate && calcData.endDate) {
      // Day Counter
      return `📅 Day Counter Result:\n\nFrom: ${new Date(calcData.startDate).toLocaleDateString()}\nTo: ${new Date(calcData.endDate).toLocaleDateString()}\nDays: ${calcData.daysDifference} days`;
    }
    return JSON.stringify(calcData, null, 2);
  };

  const formatComparisonData = (compData: any): string => {
    if (compData.pros && compData.cons) {
      // Pros & Cons
      let message = `⚖️ ${compData.title || 'Decision Analysis'}:\n\n`;
      message += `📈 PROS (Score: ${compData.totalProsWeight || 0}):\n`;
      compData.pros.forEach((pro: any) => {
        message += `• ${pro.text} (Weight: ${pro.weight})\n`;
      });
      message += `\n📉 CONS (Score: ${compData.totalConsWeight || 0}):\n`;
      compData.cons.forEach((con: any) => {
        message += `• ${con.text} (Weight: ${con.weight})\n`;
      });
      
      const winner = compData.totalProsWeight > compData.totalConsWeight ? 'PROS WIN!' : 
                    compData.totalConsWeight > compData.totalProsWeight ? 'CONS WIN!' : 'TIE!';
      message += `\n🏆 Result: ${winner}`;
      return message;
    } else if (compData.criteria && compData.options) {
      // Quick/Detail Comparison
      let message = `📊 Comparison: ${compData.title || 'Options Analysis'}\n\n`;
      message += 'Criteria vs Options:\n';
      compData.criteria.forEach((criterion: any) => {
        message += `\n${criterion.text}:\n`;
        compData.options.forEach((option: any) => {
          const cell = compData.cells?.find((c: any) => 
            c.criterionId === criterion.id && c.optionId === option.id
          );
          message += `  ${option.text}: ${cell?.status || cell?.text || 'N/A'}\n`;
        });
      });
      return message;
    }
    return JSON.stringify(compData, null, 2);
  };

  const formatDecisionData = (decData: any): string => {
    if (decData.result) {
      return `🎲 Decision Result: ${decData.result}\n\nMade with Better Decision app`;
    }
    return JSON.stringify(decData, null, 2);
  };

  const generateShareContent = (): ShareData => {
    let formattedMessage = '';
    let shareTitle = title || 'Better Decision Result';

    // Format data based on type
    switch (dataType) {
      case 'calculation':
        formattedMessage = formatCalculationData(data);
        shareTitle = title || 'Calculation Result';
        break;
      case 'comparison':
        formattedMessage = formatComparisonData(data);
        shareTitle = title || 'Comparison Result';
        break;
      case 'decision':
        formattedMessage = formatDecisionData(data);
        shareTitle = title || 'Decision Result';
        break;
      case 'custom':
        formattedMessage = customMessage || JSON.stringify(data, null, 2);
        break;
    }

    // Add app promotion if enabled
    if (includeAppPromo) {
      formattedMessage += '\n\n📱 Shared from Better Decision app - Make better decisions with smart tools!';
    }

    return {
      title: shareTitle,
      message: formattedMessage,
    };
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const shareContent = generateShareContent();

      const shareOptions = {
        title: shareContent.title,
        message: shareContent.message,
      };

      const result = await RNShare.share(shareOptions);

      if (result.action === RNShare.sharedAction) {
        onShareSuccess?.();
        
        // Show success feedback
        if (result.activityType) {
          // Content was shared successfully
          console.log('Shared via:', result.activityType);
        } else {
          // Content was shared successfully (Android)
          console.log('Content shared successfully');
        }
      } else if (result.action === RNShare.dismissedAction) {
        // Share was dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share';
      onShareError?.(errorMessage);
      
      Alert.alert(
        'Share Failed',
        'Unable to share at this time. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Share error:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyToClipboard = () => {
    try {
      const shareContent = generateShareContent();
      // Note: React Native doesn't have built-in clipboard API
      // You would need to install @react-native-clipboard/clipboard
      Alert.alert(
        'Copy to Clipboard',
        'Content formatted for sharing:\n\n' + shareContent.message,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Share Instead', onPress: handleShare },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to prepare content for copying');
    }
  };

  if (variant === 'icon') {
    return (
      <View style={styles.iconContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleShare}
          disabled={isSharing}
        >
          <MaterialIcons 
            name="share" 
            size={24} 
            color={isSharing ? theme.colors.tabBarInactive : theme.colors.primary} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleCopyToClipboard}
          disabled={isSharing}
        >
          <MaterialIcons 
            name="content-copy" 
            size={22} 
            color={isSharing ? theme.colors.tabBarInactive : theme.colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.buttonContainer}>
      <Button
        title="Share"
        icon="share"
        variant="outline"
        onPress={handleShare}
        loading={isSharing}
        style={styles.shareButton}
      />
      
      <Button
        title="Copy"
        icon="content-copy"
        variant="ghost"
        size="small"
        onPress={handleCopyToClipboard}
        disabled={isSharing}
        style={styles.copyButton}
      />
    </View>
  );
};

// Utility function for quick sharing
export const quickShare = async (
  title: string,
  message: string,
  options?: {
    includeAppPromo?: boolean;
    onSuccess?: () => void;
    onError?: (error: string) => void;
  }
) => {
  try {
    let shareMessage = message;
    
    if (options?.includeAppPromo !== false) {
      shareMessage += '\n\n📱 Shared from Better Decision app';
    }

    const result = await RNShare.share({
      title,
      message: shareMessage,
    });

    if (result.action === RNShare.sharedAction) {
      options?.onSuccess?.();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to share';
    options?.onError?.(errorMessage);
  }
};

// Share with image (for future enhancement)
export const shareWithImage = async (
  title: string,
  message: string,
  imageUri: string
) => {
  try {
    const result = await RNShare.share({
      title,
      message,
      url: imageUri, // On iOS this will share the image
    });
    
    return result.action === RNShare.sharedAction;
  } catch (error) {
    console.error('Share with image failed:', error);
    return false;
  }
};

const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareButton: {
    flex: 1,
  },
  copyButton: {
    minWidth: 80,
  },
});
