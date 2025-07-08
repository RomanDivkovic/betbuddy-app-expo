import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Comment } from '../../types';
import { styles } from '../../screens/GroupDetailsScreen.styles';

interface CommentsSectionProps {
  postId: string;
  comments: Comment[];
  commentInput: string;
  editingComment: { id: string; content: string } | null;
  currentUser: { uid: string } | null;
  onCommentInputChange: (text: string) => void;
  onAddComment: () => void;
  onStartEdit: (comment: Comment) => void;
  onSaveEdit: () => void;
  onDelete: (commentId: string) => void;
  onEditingCommentChange: (text: string) => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  postId,
  comments,
  commentInput,
  editingComment,
  currentUser,
  onCommentInputChange,
  onAddComment,
  onStartEdit,
  onSaveEdit,
  onDelete,
  onEditingCommentChange,
}) => {
  return (
    <View style={styles.commentsContainer}>
      {comments.map((comment) => (
        <View key={comment.id} style={{ marginBottom: 8 }}>
          <Text style={styles.commentAuthor}>{comment.userName}</Text>
          {editingComment && editingComment.id === comment.id ? (
            <TextInput
              style={styles.commentInput}
              value={editingComment.content}
              onChangeText={onEditingCommentChange}
              onSubmitEditing={onSaveEdit}
              blurOnSubmit={true}
            />
          ) : (
            <Text style={styles.commentContent}>{comment.content}</Text>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {currentUser &&
              comment.userId === currentUser.uid &&
              !editingComment && (
                <View style={styles.commentActions}>
                  <TouchableOpacity onPress={() => onStartEdit(comment)}>
                    <Ionicons name="pencil" size={16} color="#2563eb" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onDelete(comment.id)}>
                    <Ionicons name="trash" size={16} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              )}
            {editingComment && editingComment.id === comment.id && (
              <TouchableOpacity onPress={onSaveEdit} style={styles.saveCommentButton}>
                <Text style={styles.saveCommentText}>Save</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
      <View style={styles.addCommentRow}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={commentInput}
          onChangeText={onCommentInputChange}
          onSubmitEditing={onAddComment}
          blurOnSubmit={true}
        />
        <TouchableOpacity onPress={onAddComment}>
          <Ionicons name="send" size={18} color="#2563eb" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CommentsSection;
