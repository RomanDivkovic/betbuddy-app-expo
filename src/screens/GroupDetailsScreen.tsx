import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
} from "../services/firebaseService";
import { Group, Post, Event, RootStackParamList } from "../types";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";

type GroupDetailsRouteProp = RouteProp<RootStackParamList, "GroupDetails">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function GroupDetailsScreen() {
  const route = useRoute<GroupDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { groupId } = route.params;

  const { currentUser } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "events" | "members">(
    "posts"
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, any[]>>(
    {}
  );
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );
  const [editingComment, setEditingComment] = useState<{
    postId: string;
    commentId: string;
    content: string;
  } | null>(null);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
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
  };

  const loadCommentsForPost = async (postId: string) => {
    const comments = await fetchPostComments(groupId, postId);
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: comments.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    }));
  };

  const onRefresh = async () => {
    setLoading(true);
    await loadGroupData();
  };

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

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    await createComment(groupId, postId, content);
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    await loadCommentsForPost(postId);
  };

  const handleEditComment = async () => {
    if (!editingComment) return;
    await editComment(
      groupId,
      editingComment.postId,
      editingComment.commentId,
      editingComment.content.trim()
    );
    setEditingComment(null);
    await loadCommentsForPost(editingComment.postId);
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    await deleteComment(groupId, postId, commentId);
    await loadCommentsForPost(postId);
  };

  const renderGroupHeader = () => (
    <View style={styles.groupHeader}>
      <Text style={styles.groupName}>{group?.name}</Text>
      {group?.description && (
        <Text style={styles.groupDescription}>{group.description}</Text>
      )}
      <Text style={styles.memberCount}>
        {Object.keys(group?.members || {}).length} members
      </Text>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {["posts", "events", "members"].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab as any)}
        >
          <Text
            style={[styles.tabText, activeTab === tab && styles.activeTabText]}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderComments = (postId: string) => {
    const comments = commentsByPost[postId] || [];
    return (
      <View style={styles.commentsContainer}>
        {comments.map((comment) => (
          <View key={comment.id} style={styles.commentRow}>
            <Text style={styles.commentAuthor}>{comment.userName}:</Text>
            {editingComment && editingComment.commentId === comment.id ? (
              <TextInput
                style={styles.commentInput}
                value={editingComment.content}
                onChangeText={(text) =>
                  setEditingComment((ec) =>
                    ec ? { ...ec, content: text } : null
                  )
                }
                onSubmitEditing={handleEditComment}
                blurOnSubmit={true}
              />
            ) : (
              <Text style={styles.commentContent}>{comment.content}</Text>
            )}
            {currentUser &&
              comment.userId === currentUser.uid &&
              !editingComment && (
                <View style={styles.commentActions}>
                  <TouchableOpacity
                    onPress={() =>
                      setEditingComment({
                        postId,
                        commentId: comment.id,
                        content: comment.content,
                      })
                    }
                  >
                    <Ionicons name="pencil" size={16} color="#2563eb" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteComment(postId, comment.id)}
                  >
                    <Ionicons name="trash" size={16} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              )}
            {editingComment && editingComment.commentId === comment.id && (
              <TouchableOpacity
                onPress={handleEditComment}
                style={styles.saveCommentButton}
              >
                <Text style={styles.saveCommentText}>Save</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <View style={styles.addCommentRow}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={commentInputs[postId] || ""}
            onChangeText={(text) =>
              setCommentInputs((prev) => ({ ...prev, [postId]: text }))
            }
            onSubmitEditing={() => handleAddComment(postId)}
            blurOnSubmit={true}
          />
          <TouchableOpacity onPress={() => handleAddComment(postId)}>
            <Ionicons name="send" size={18} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPost = (post: Post) => (
    <View key={post.id} style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postAuthor}>{post.userName}</Text>
        <Text style={styles.postDate}>
          {format(new Date(post.createdAt), "MMM dd, h:mm a")}
        </Text>
      </View>
      <Text style={styles.postContent}>{post.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.postAction}>
          <Ionicons name="heart-outline" size={20} color="#6b7280" />
          <Text style={styles.actionText}>{post.likes?.length || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.postAction}
          onPress={() => loadCommentsForPost(post.id)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>
      </View>
      {renderComments(post.id)}
    </View>
  );

  const renderEvent = (event: Event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventCard}
      onPress={() =>
        navigation.navigate("EventDetails", {
          eventId: event.id,
          groupId: groupId,
        })
      }
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={styles.eventStatus}>
          <Text
            style={[
              styles.statusText,
              {
                color:
                  event.status === "upcoming"
                    ? "#2563eb"
                    : event.status === "live"
                    ? "#dc2626"
                    : "#16a34a",
              },
            ]}
          >
            {event.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.eventDate}>
        {format(new Date(event.date), "MMM dd, yyyy • h:mm a")}
      </Text>
      {event.location && (
        <Text style={styles.eventLocation}>{event.location}</Text>
      )}
      <Text style={styles.matchCount}>{event.matches?.length || 0} fights</Text>
    </TouchableOpacity>
  );

  const renderMember = (member: any, userId: string) => (
    <View key={userId} style={styles.memberCard}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>
          {member.userName?.charAt(0).toUpperCase() || "U"}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.userName || "Unknown"}</Text>
        <Text style={styles.memberRole}>
          {member.member === "isAdmin" ? "Admin" : "Member"}
        </Text>
      </View>
      {member.member === "isAdmin" && (
        <Ionicons name="star" size={16} color="#f59e0b" />
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return (
          <View style={styles.tabContent}>
            <TouchableOpacity
              style={styles.createPostButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={20} color="#2563eb" />
              <Text style={styles.createPostText}>
                Share something with the group
              </Text>
            </TouchableOpacity>

            {posts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={48}
                  color="#9ca3af"
                />
                <Text style={styles.emptyText}>No posts yet</Text>
                <Text style={styles.emptySubtext}>
                  Be the first to share something with the group!
                </Text>
              </View>
            ) : (
              posts.map(renderPost)
            )}
          </View>
        );

      case "events":
        return (
          <View style={styles.tabContent}>
            {events.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No events yet</Text>
                <Text style={styles.emptySubtext}>
                  Events will appear here when they're added to the group
                </Text>
              </View>
            ) : (
              events.map(renderEvent)
            )}
          </View>
        );

      case "members":
        return (
          <View style={styles.tabContent}>
            {Object.entries(group?.members || {}).map(([userId, member]) =>
              renderMember(member, userId)
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (!group) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        {renderGroupHeader()}
        {renderTabs()}
        {renderTabContent()}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.postInput}
              placeholder="What's on your mind?"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={4}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.postButton, posting && styles.buttonDisabled]}
                onPress={handleCreatePost}
                disabled={posting}
              >
                <Text style={styles.postButtonText}>
                  {posting ? "Posting..." : "Post"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  groupHeader: {
    backgroundColor: "white",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  groupName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  groupDescription: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 22,
    marginBottom: 8,
  },
  memberCount: {
    fontSize: 14,
    color: "#9ca3af",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#2563eb",
  },
  tabContent: {
    padding: 20,
  },
  createPostButton: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  createPostText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  postCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  postDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  postContent: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  postAction: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#6b7280",
  },
  eventCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  eventStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  eventDate: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  matchCount: {
    fontSize: 12,
    color: "#9ca3af",
  },
  memberCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  memberRole: {
    fontSize: 14,
    color: "#6b7280",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#9ca3af",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  postInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#f9fafb",
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6b7280",
  },
  postButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
  },
  postButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  commentsContainer: {
    marginTop: 8,
    marginLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
    paddingLeft: 8,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  commentAuthor: {
    fontWeight: "bold",
    marginRight: 4,
    fontSize: 13,
  },
  commentContent: {
    fontSize: 13,
    color: "#374151",
    marginRight: 8,
  },
  commentActions: {
    flexDirection: "row",
    marginLeft: 4,
  },
  saveCommentButton: {
    marginLeft: 8,
    backgroundColor: "#2563eb",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  saveCommentText: {
    color: "white",
    fontSize: 12,
  },
  addCommentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    marginRight: 4,
  },
});
