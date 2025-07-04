import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  fetchGroupById,
  fetchGroupPosts,
  fetchGroupEvents,
  createPost,
  fetchPostComments,
  createComment,
  editComment,
  deleteComment,
  reactToPost,
  inviteUserToGroup,
} from "../services/firebaseService";
import { Group, Post, Event, RootStackParamList, Comment } from "../types";
import { useAuth } from "../context/AuthContext";

type GroupDetailsRouteProp = RouteProp<RootStackParamList, "GroupDetails">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useGroupDetails = () => {
  const route = useRoute<GroupDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { groupId } = route.params || {};

  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "events" | "members">(
    "posts"
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, Comment[]>
  >({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );
  const [isInviteModalVisible, setInviteModalVisible] = useState(false);

  const { currentUser } = useAuth();

  const loadGroupData = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const [groupData, groupPosts, groupEvents] = await Promise.all([
        fetchGroupById(groupId),
        fetchGroupPosts(groupId),
        fetchGroupEvents(groupId),
      ]);

      setGroup(groupData);
      setPosts(
        groupPosts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      setEvents(
        groupEvents.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );
    } catch (error) {
      console.error("Error loading group data:", error);
      Alert.alert("Error", "Failed to load group data");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadGroupData();
  }, [loadGroupData]);

  const loadCommentsForPost = async (postId: string) => {
    try {
      const comments = await fetchPostComments(groupId, postId);
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: comments.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      }));
    } catch (error) {
      console.error("Failed to load comments:", error);
      Alert.alert("Error", "Could not load comments for this post.");
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGroupData();
    setRefreshing(false);
  }, [loadGroupData]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert("Error", "Please enter some content");
      return;
    }

    setPosting(true);
    try {
      await createPost(groupId, newPostContent.trim());
      setModalVisible(false);
      setNewPostContent("");
      await loadGroupData();
      Alert.alert("Success", "Post created successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  const handleInviteMember = async (email: string) => {
    if (!group || !groupId) return "Group not found";
    try {
      const result = await inviteUserToGroup(groupId, email);
      Alert.alert("Success", result);
      setInviteModalVisible(false);
      return result;
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to invite user.");
      return error.message;
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content || !groupId) return;
    try {
      await createComment(groupId, postId, content);
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      await loadCommentsForPost(postId);
    } catch (error) {
      Alert.alert("Error", "Failed to add comment.");
    }
  };

  const handleStartEditComment = (comment: Comment) => {
    setEditingComment(comment);
  };

  const handleCancelEditComment = () => {
    setEditingComment(null);
  };

  const handleSaveEditComment = async () => {
    if (!editingComment || !groupId) return;
    try {
      await editComment(
        groupId,
        editingComment.postId,
        editingComment.id,
        editingComment.content.trim()
      );
      setEditingComment(null);
      await loadCommentsForPost(editingComment.postId);
    } catch (error) {
      Alert.alert("Error", "Failed to save comment.");
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!groupId) return;
    try {
      await deleteComment(groupId, postId, commentId);
      await loadCommentsForPost(postId);
    } catch (error) {
      Alert.alert("Error", "Failed to delete comment.");
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUser || !groupId) return;
    try {
      const updatedPost = await reactToPost(groupId, postId, "like");
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, ...updatedPost } : p))
      );
    } catch (err) {
      Alert.alert("Error", "Failed to like post");
    }
  };

  const navigateToEventDetails = (eventId: string) => {
    if (!groupId) return;
    navigation.navigate("EventDetails", { eventId, groupId });
  };

  return {
    group,
    posts,
    events,
    loading,
    refreshing,
    activeTab,
    setActiveTab,
    modalVisible,
    setModalVisible,
    newPostContent,
    setNewPostContent,
    posting,
    editingComment,
    setEditingComment,
    commentsByPost,
    commentInputs,
    setCommentInputs,
    isInviteModalVisible,
    setInviteModalVisible,
    currentUser,
    onRefresh,
    handleCreatePost,
    handleInviteMember,
    handleAddComment,
    handleStartEditComment,
    handleCancelEditComment,
    handleSaveEditComment,
    handleDeleteComment,
    handleLikePost,
    navigateToEventDetails,
    loadCommentsForPost,
  };
};
