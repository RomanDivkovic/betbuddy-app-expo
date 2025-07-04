import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import InviteMemberModal from "../components/InviteMemberModal";
import { useGroupDetails } from "./useGroupDetails";
import { styles } from "./GroupDetailsScreen.styles";
import { Post, Event, Comment, GroupMember } from "../types";

export default function GroupDetailsScreen() {
  const {
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
  } = useGroupDetails();

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
      <TouchableOpacity
        style={[styles.tab, activeTab === "posts" && styles.activeTab]}
        onPress={() => setActiveTab("posts")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "posts" && styles.activeTabText,
          ]}
        >
          Posts
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "events" && styles.activeTab]}
        onPress={() => setActiveTab("events")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "events" && styles.activeTabText,
          ]}
        >
          Events
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "members" && styles.activeTab]}
        onPress={() => setActiveTab("members")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "members" && styles.activeTabText,
          ]}
        >
          Members
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderComments = (postId: string) => {
    const comments = commentsByPost[postId] || [];
    return (
      <View style={styles.commentsContainer}>
        {comments.map((comment) => (
          <View key={comment.id} style={{ marginBottom: 8 }}>
            <Text style={styles.commentAuthor}>{comment.userName}</Text>
            {editingComment && editingComment.id === comment.id ? (
              <TextInput
                style={styles.commentInput}
                value={editingComment.content}
                onChangeText={(text) =>
                  setEditingComment((ec) =>
                    ec ? { ...ec, content: text } : null
                  )
                }
                onSubmitEditing={handleSaveEditComment}
                blurOnSubmit={true}
              />
            ) : (
              <Text style={styles.commentContent}>{comment.content}</Text>
            )}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {currentUser &&
                comment.userId === currentUser.uid &&
                !editingComment && (
                  <View style={styles.commentActions}>
                    <TouchableOpacity
                      onPress={() => handleStartEditComment(comment)}
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
              {editingComment && editingComment.id === comment.id && (
                <TouchableOpacity
                  onPress={handleSaveEditComment}
                  style={styles.saveCommentButton}
                >
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

  const renderPost = ({ item }: { item: Post }) => {
    const isLiked = currentUser && item.likes?.includes(currentUser.uid);
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Text style={styles.postAuthor}>{item.userName}</Text>
          <Text style={styles.postDate}>
            {format(new Date(item.createdAt), "MMM dd, h:mm a")}
          </Text>
        </View>
        <Text style={styles.postContent}>{item.content}</Text>
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.postAction}
            onPress={() => handleLikePost(item.id)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? "#dc2626" : "#6b7280"}
            />
            <Text style={styles.actionText}>{item.likes?.length || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.postAction}
            onPress={() => loadCommentsForPost(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>
        </View>
        {commentsByPost[item.id] && renderComments(item.id)}
      </View>
    );
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.eventCard}
      onPress={() => navigateToEventDetails(item.id)}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{item.title || "Untitled Event"}</Text>
        <View style={styles.eventStatus}>
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.status === "upcoming"
                    ? "#2563eb"
                    : item.status === "live"
                    ? "#dc2626"
                    : item.status === "completed"
                    ? "#16a34a"
                    : "#6b7280",
              },
            ]}
          >
            {(item.status || "upcoming").toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.eventDate}>
        {item.date
          ? format(new Date(item.date), "MMM dd, yyyy • h:mm a")
          : "No date"}
      </Text>
      {item.location && (
        <Text style={styles.eventLocation}>{item.location}</Text>
      )}
      <Text style={styles.matchCount}>
        {Array.isArray(item.matches) ? item.matches.length : 0} fights
      </Text>
    </TouchableOpacity>
  );

  const renderMember = ({ item }: { item: [string, GroupMember] }) => {
    const [userId, member] = item;
    return (
      <View key={userId} style={styles.memberCard}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>
            {member.userName?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.userName || "Unknown"}</Text>
          <Text style={styles.memberRole}>
            {member.role === "admin" ? "Admin" : "Member"}
          </Text>
        </View>
        {group?.adminIds?.includes(userId) && (
          <Ionicons name="star" size={16} color="#f59e0b" />
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContent}>
      <Text>No content available.</Text>
    </View>
  );

  const ListHeader = (
    <>
      {renderGroupHeader()}
      {renderTabs()}
      {activeTab === "posts" && (
        <TouchableOpacity
          style={styles.createPostButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#6b7280" />
          <Text style={styles.createPostText}>Create a new post...</Text>
        </TouchableOpacity>
      )}
      {activeTab === "members" &&
        group?.adminIds?.includes(currentUser?.uid ?? "") && (
          <TouchableOpacity
            style={styles.createPostButton}
            onPress={() => setInviteModalVisible(true)}
          >
            <Ionicons name="person-add-outline" size={24} color="#6b7280" />
            <Text style={styles.createPostText}>Invite New Member</Text>
          </TouchableOpacity>
        )}
    </>
  );

  const renderContent = () => {
    if (activeTab === "posts") {
      return (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContentContainer}
        />
      );
    } else if (activeTab === "events") {
      return (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContentContainer}
        />
      );
    } else if (activeTab === "members") {
      return (
        <FlatList
          data={Object.entries(group?.members || {}) as [string, GroupMember][]}
          renderItem={renderMember}
          keyExtractor={(item) => item[0]}
          ListHeaderComponent={ListHeader}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContentContainer}
        />
      );
    }
    return null;
  };

  if (loading && !group) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderContent()}

      <InviteMemberModal
        visible={isInviteModalVisible}
        onClose={() => setInviteModalVisible(false)}
        onInvite={handleInviteMember}
        groupName={group?.name}
      />

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
    </SafeAreaView>
  );
}
