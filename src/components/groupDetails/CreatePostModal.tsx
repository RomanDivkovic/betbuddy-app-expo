import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../screens/GroupDetailsScreen.styles';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  postContent: string;
  onPostContentChange: (text: string) => void;
  onCreatePost: () => void;
  isPosting: boolean;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  postContent,
  onPostContentChange,
  onCreatePost,
  isPosting,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.postInput}
            placeholder="What's on your mind?"
            value={postContent}
            onChangeText={onPostContentChange}
            multiline
            numberOfLines={4}
            autoFocus
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.postButton, isPosting && styles.buttonDisabled]}
              onPress={onCreatePost}
              disabled={isPosting}
            >
              <Text style={styles.postButtonText}>
                {isPosting ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CreatePostModal;
