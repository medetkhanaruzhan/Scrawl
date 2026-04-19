import { Comment } from '../services/comment.service';

/** Deep-clone comment node preserving nested `replies`. */
function cloneNode(c: Comment): Comment {
  return {
    ...c,
    replies: (c.replies ?? []).map(cloneNode),
  };
}

/**
 * Build a forest of roots from a flat list (each row has optional `parent`).
 */
export function buildCommentTreeFromFlat(flat: Comment[]): Comment[] {
  const map = new Map<number, Comment>();
  flat.forEach((c) => {
    map.set(c.id, { ...c, replies: [] });
  });
  const roots: Comment[] = [];
  flat.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parent != null && map.has(c.parent)) {
      map.get(c.parent)!.replies.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

/**
 * API usually returns root comments with nested `replies` already.
 * If the array is flat (some rows have `parent` set), build a tree.
 */
export function normalizeCommentTree(comments: Comment[]): Comment[] {
  if (!comments?.length) return [];
  const mixedTopLevel = comments.some((c) => c.parent != null);
  if (mixedTopLevel) {
    return buildCommentTreeFromFlat(comments);
  }
  return comments.map(cloneNode);
}
