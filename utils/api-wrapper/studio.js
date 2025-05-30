import consts from "./consts";

const APIStudio = {
    getStudio: async (id) => {
        const res = await fetch(`https://api.scratch.mit.edu/studios/${id}`);
        const data = await res.json();
        return data;
    },
    getProjects: async (id) => {
        const res = await fetch(`https://api.scratch.mit.edu/studios/${id}/projects`);
        const data = await res.json();
        return data;
    },
    getComments: async (id, offset = 0, limit = 20, includeReplies = true) => {
        const res = await fetch(`https://api.scratch.mit.edu/studios/${id}/comments?offset=${offset}&limit=${limit}`, {
            headers: {
                Referer: "https://scratch.mit.edu"
            }
        });
        let data = await res.json();
        if (includeReplies) {
            let commentPromises = data.map(async (comment) => {
                const replies = await APIStudio.getCommentReplies(id, comment.id);
                comment.replies = replies || [];
                comment.includesReplies = true;
                return comment;
            });

            const settledComments = await Promise.allSettled(commentPromises);
            return settledComments.map(result => result.status === "fulfilled" ? result.value : null).filter(Boolean);
        } else {
            return data;
        }
    },
    getCommentReplies: async (id, parentCommentID) => {
        const res = await fetch(`https://api.scratch.mit.edu/studios/${id}/comments/${parentCommentID}/replies`);
        const data = await res.json();
        return data;
    },
    postComment: async (studioID, content = "", csrf, token, parentID = "", commentee = "") => {
        const opts = {
            headers: {
                "X-CSRFToken": csrf,
                "X-Token": token,
                "x-requested-with": "XMLHttpRequest",
                Referer: `https://scratch.mit.edu/`,
                "User-Agent": consts.UserAgent,
                Accept: "*/*",
                "Content-Type": "application/json",
                Origin: "https://scratch.mit.edu",
                TE: "trailers",
                "Cache-Control": "max-age=0, no-cache",
                Pragma: "no-cache",
                Connection: "keep-alive",
                "Accept-Encoding": "gzip, deflate, br"
            },
            referrer: `https://scratch.mit.edu/`,
            method: "POST",
            body: JSON.stringify({
                content: content,
                parent_id: parentID,
                commentee_id: commentee
            })
        };

        const res = await fetch(`https://api.scratch.mit.edu/proxy/comments/studio/${studioID}`, opts);
        const data = await res.json();
        return data.id;
    },
    deleteComment: async (studioID, commentID, csrf, token) => {
        const opts = {
            headers: {
                "X-CSRFToken": csrf,
                "X-Token": token,
                "x-requested-with": "XMLHttpRequest",
                Referer: `https://scratch.mit.edu/studios/${studioID}/comments`,
                "User-Agent": consts.UserAgent,
                Accept: "*/*",
                Origin: "https://scratch.mit.edu",
                TE: "trailers",
                "Cache-Control": "max-age=0, no-cache",
                Pragma: "no-cache",
                Connection: "keep-alive",
                "Accept-Encoding": "gzip, deflate, br"
            },
            referrer: `https://scratch.mit.edu/`,
            method: "DELETE"
        };

        const res = await fetch(`https://api.scratch.mit.edu/proxy/comments/studio/${studioID}/comment/${commentID}`, opts);
        return res.status === 200;
    }
}

export default APIStudio;