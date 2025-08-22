import { MaterialIcons } from '@expo/vector-icons';
import React, { ReactNode, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography } from './Typography';

interface SectionTitleProps {
  title: string;
  onTitleChange?: (newTitle: string) => void;
  editable?: boolean;
  maxLength?: number;
  actions?: ReactNode;
  containerStyle?: any;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  onTitleChange,
  editable = true,
  maxLength = 50,
  actions,
  containerStyle,
}) => {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);

  const handleTitleSubmit = () => {
    setIsEditing(false);
    if (onTitleChange) {
      onTitleChange(localTitle);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setLocalTitle(newTitle);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.titleSection}>
        {isEditing ? (
          <TextInput
            style={[
              styles.titleInput,
              { 
                color: theme.colors.text, 
                borderColor: theme.colors.primary 
              }
            ]}
            value={localTitle}
            onChangeText={handleTitleChange}
            onBlur={handleTitleSubmit}
            onSubmitEditing={handleTitleSubmit}
            autoFocus
            maxLength={maxLength}
          />
        ) : (
          <TouchableOpacity
            style={styles.titleContainer}
            onPress={() => editable && setIsEditing(true)}
            disabled={!editable}
          >
            <Typography variant="h3" color="text" style={styles.screenTitle}>
              {localTitle}
            </Typography>
            {editable && (
              <MaterialIcons 
                name="edit" 
                size={20} 
                color={theme.colors.textSecondary} 
                style={styles.editIcon} 
              />
            )}
          </TouchableOpacity>
        )}
        
        {actions && (
          <View style={styles.actionsContainer}>
            {actions}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  screenTitle: {
    flex: 1,
  },
  editIcon: {
    marginLeft: 8,
    opacity: 0.6,
  },
  titleInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 70,
  },
});

export default SectionTitle;
