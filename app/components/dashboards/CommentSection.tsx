"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Comment {
  id: string;
  text: string;
  authorName: string;
  createdAt: Timestamp;
}

interface CommentSectionProps {
  ticketId: string;
}

export default function CommentSection({ ticketId }: CommentSectionProps) {
  const { userProfile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const commentsRef = collection(firestore, "tickets", ticketId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments: Comment[] = [];
      snapshot.forEach((doc) => {
        fetchedComments.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setComments(fetchedComments);
    });

    return () => unsubscribe();
  }, [ticketId]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !userProfile) return;

    setIsSubmitting(true);
    const commentsRef = collection(firestore, "tickets", ticketId, "comments");

    try {
      await addDoc(commentsRef, {
        text: newComment,
        authorId: userProfile.uid,
        authorName: userProfile.fullName,
        createdAt: serverTimestamp(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        {/* Changed title from "Conversation" to "Comments" */}
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="bg-zinc-800 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-white text-sm">{comment.authorName}</p>
                  <p className="text-xs text-gray-500">
                    {comment.createdAt ? new Date(comment.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                  </p>
                </div>
                <p className="text-gray-300 text-sm">{comment.text}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No comments yet.</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 text-sm focus:ring-sky-500 focus:border-sky-500"
            placeholder="Add a comment..."
          />
          <Button onClick={handlePostComment} disabled={isSubmitting || !newComment.trim()} className="self-end bg-sky-700 hover:bg-sky-800">
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}