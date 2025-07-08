import React from "react";
import {
  View,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGroupDetails } from "./useGroupDetails";
import { styles } from "./GroupDetailsScreen.styles";
import { Post, Event, GroupMember } from "../types";

import GroupHeader from "../components/groupDetails/GroupHeader";
import Tabs from "../components/groupDetails/Tabs";
import PostCard from "../components/groupDetails/PostCard";
import EventCard from "../components/groupDetails/EventCard";
import MemberCard from "../components/groupDetails/MemberCard";
import CommentsSection from "../components/groupDetails/CommentsSection";
import CreatePostModal from "../components/groupDetails/CreatePostModal";
import InviteMemberModal from "../components/InviteMemberModal";

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

  const renderPost = ({ item }: { item: Post }) => {
    const isLiked = currentUser && item.likes?.includes(currentUser.uid);
    return (
      <PostCard
        post={item}
        isLiked={!!isLiked}
        onLikePost={() => handleLikePost(item.id)}
        onShowComments={() => loadCommentsForPost(item.id)}
      >
        {commentsByPost[item.id] && (
          <CommentsSection
            postId={item.id}
            comments={commentsByPost[item.id]}
            commentInput={commentInputs[item.id] || ""}
            editingComment={editingComment}
            currentUser={currentUser}
            onCommentInputChange={(text) =>
              setCommentInputs((prev) => ({ ...prev, [item.id]: text }))
            }
            onAddComment={() => handleAddComment(item.id)}
            onStartEdit={handleStartEditComment}
            onSaveEdit={handleSaveEditComment}
            onDelete={(commentId) => handleDeleteComment(item.id, commentId)}
            onEditingCommentChange={(text) =>
              setEditingComment((ec) => (ec ? { ...ec, content: text } : null))
            }
          />
        )}
      </PostCard>
    );
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <EventCard event={item} onPress={() => navigateToEventDetails(item.id)} />
  );

  const renderMember = ({ item }: { item: [string, GroupMember] }) => (
    <MemberCard
      member={item}
      isAdmin={group?.adminIds?.includes(item[0]) ?? false}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContent}>
      <Text>No content available.</Text>
    </View>
  );

  const ListHeader = (
    <>
      <GroupHeader group={group} />
      <Tabs activeTab={activeTab} onTabPress={setActiveTab} />
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
    const listProps = {
      ListHeaderComponent: ListHeader,
      refreshControl: (
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      ),
      ListEmptyComponent: renderEmpty,
      contentContainerStyle: styles.listContentContainer,
    };

    if (activeTab === "posts") {
      return (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          {...listProps}
        />
      );
    } else if (activeTab === "events") {
      return (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          {...listProps}
        />
      );
    } else if (activeTab === "members") {
      return (
        <FlatList
          data={Object.entries(group?.members || {}) as [string, GroupMember][]}
          renderItem={renderMember}
          keyExtractor={(item) => item[0]}
          {...listProps}
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
        groupName={group?.name || ""}
      />

      <CreatePostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        postContent={newPostContent}
        onPostContentChange={setNewPostContent}
        onCreatePost={handleCreatePost}
        isPosting={posting}
      />
    </SafeAreaView>
  );
}
