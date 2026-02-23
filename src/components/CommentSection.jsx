import React, { useEffect, useState } from "react";

const getUserId = () => {
  let userId = localStorage.getItem("anon-user-id");
  if (!userId) {
    userId = "user-" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("anon-user-id", userId);
  }
  return userId;
};

const CommentSection = ({ movieId }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [repliesShown, setRepliesShown] = useState({});
  const [activeReply, setActiveReply] = useState(null);

  const userId = getUserId();
  const voteKey = `votes-${userId}-${movieId}`;
  const [userVotes, setUserVotes] = useState(
    JSON.parse(localStorage.getItem(voteKey)) || {}
  );

  useEffect(() => {
    const saved = localStorage.getItem(`comments-${movieId}`);
    if (saved) {
      setComments(JSON.parse(saved));
    }
  }, [movieId]);

  const saveComments = (updated) => {
    setComments(updated);
    localStorage.setItem(`comments-${movieId}`, JSON.stringify(updated));
  };

  const saveUserVotes = (updatedVotes) => {
    setUserVotes(updatedVotes);
    localStorage.setItem(voteKey, JSON.stringify(updatedVotes));
  };

  const handleAddComment = (parentId = null) => {
    if (!text.trim()) return;
    const newComment = {
      id: Date.now(),
      text,
      createdAt: new Date().toLocaleString(),
      userId,
      parentId,
      likes: 0,
      dislikes: 0,
    };
    const updated = [newComment, ...comments];
    saveComments(updated);
    setText("");
    setActiveReply(null);
  };

  const handleVote = (id, type) => {
    if (userVotes[id] === type) {
      // Cancel vote
      const updatedVotes = { ...userVotes };
      delete updatedVotes[id];
      const updatedComments = comments.map((c) =>
        c.id === id ? { ...c, [type]: c[type] - 1 } : c
      );
      saveUserVotes(updatedVotes);
      saveComments(updatedComments);
    } else {
      const prevType = userVotes[id];
      const updatedVotes = { ...userVotes, [id]: type };
      const updatedComments = comments.map((c) => {
        if (c.id === id) {
          const updated = { ...c };
          if (prevType) updated[prevType] -= 1;
          updated[type] += 1;
          return updated;
        }
        return c;
      });
      saveUserVotes(updatedVotes);
      saveComments(updatedComments);
    }
  };

  const handleDelete = (id) => {
    const updated = comments.filter((c) => c.id !== id && c.parentId !== id);
    saveComments(updated);
  };

  const renderReplies = (parentId) => {
    const replies = comments
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => b.id - a.id);

    const shownCount = repliesShown[parentId] || 5;
    const visibleReplies = replies.slice(0, shownCount);
    const canShowMore = replies.length > shownCount;

    return (
      <div className="ml-6 mt-2">
        {visibleReplies.map((reply) => renderComment(reply))}
        {canShowMore && (
          <button
            onClick={() =>
              setRepliesShown((prev) => ({
                ...prev,
                [parentId]: shownCount + 5,
              }))
            }
            className="text-sm text-blue-400 mt-1 hover:underline"
          >
            Show more replies
          </button>
        )}
      </div>
    );
  };

  const renderComment = (c) => {
    const isOwner = c.userId === userId;
    const maskedUser = `${c.userId.slice(0, 6)}****`;

    return (
      <div key={c.id} className="bg-gray-800 p-4 rounded-xl shadow text-white mb-3">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
            {c.userId.slice(-2).toUpperCase()}
          </div>
          <div className="text-sm text-gray-400">
            {maskedUser} • {c.createdAt}
          </div>
        </div>
        <div className="ml-11 mb-3">{c.text}</div>
        <div className="ml-11 flex flex-wrap gap-2 text-sm">
          <button
            onClick={() => handleVote(c.id, "likes")}
            className={`px-2 py-1 rounded ${
              userVotes[c.id] === "likes" ? "bg-green-600" : "bg-gray-700"
            } hover:bg-green-500 transition`}
          >
            👍 {c.likes}
          </button>
          <button
            onClick={() => handleVote(c.id, "dislikes")}
            className={`px-2 py-1 rounded ${
              userVotes[c.id] === "dislikes" ? "bg-red-600" : "bg-gray-700"
            } hover:bg-red-500 transition`}
          >
            👎 {c.dislikes}
          </button>
          <button
            onClick={() => {
              setActiveReply(c.id);
              setText(``);
            }}
            className="text-blue-400 hover:underline"
          >
            ↩ Reply
          </button>
          {isOwner && (
            <button
              onClick={() => handleDelete(c.id)}
              className="text-yellow-400 hover:underline"
            >
              🗑 Delete
            </button>
          )}
        </div>
        {activeReply === c.id && (
          <div className="ml-11 mt-2">
            <input
              type="text"
              placeholder="Write a reply..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white mb-2"
            />
            <button
              onClick={() => handleAddComment(c.id)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-white text-sm"
            >
              Reply
            </button>
          </div>
        )}
        {renderReplies(c.id)}
      </div>
    );
  };

  const topLevel = comments
    .filter((c) => !c.parentId)
    .sort((a, b) => b.id - a.id);

  return (
    <div className="mt-12 max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-white mb-4">Comments</h2>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-grow p-3 rounded bg-gray-800 text-white border border-gray-600"
        />
        <button
          onClick={() => handleAddComment()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Post
        </button>
      </div>
      <div>
        {topLevel.length > 0 ? (
          topLevel.map((comment) => renderComment(comment))
        ) : (
          <p className="text-gray-400">No comments yet.</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
