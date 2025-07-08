import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Post } from '../../types';
import { styles } from '../../screens/GroupDetailsScreen.styles';

interface PostCardProps {
  post: Post;
  isLiked: boolean;
  onLikePost: () => void;
  onShowComments: () => void;
  children?: React.ReactNode; // To render comments section
}

const PostCard: React.FC<PostCardProps> = ({ post, isLiked, onLikePost, onShowComments, children }) => {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postAuthor}>{post.userName}</Text>
        <Text style={styles.postDate}>
          {format(new Date(post.createdAt), 'MMM dd, h:mm a')}
        </Text>
      </View>
      <Text style={styles.postContent}>{post.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.postAction} onPress={onLikePost}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={isLiked ? '#dc2626' : '#6b7280'}
          />
          <Text style={styles.actionText}>{post.likes?.length || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postAction} onPress={onShowComments}>
          <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
};

export default PostCard;
