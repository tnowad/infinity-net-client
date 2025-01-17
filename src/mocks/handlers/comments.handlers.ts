import { http, HttpResponse } from "msw";
import { generateComment, generateUser } from "../generators";
import _ from "lodash";
import { paginate } from "../utils/pagination";
import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  TOTAL_COMMENTS_COUNT,
  TOTAL_REPLIES_COUNT,
} from "../constants";

export const commentsHandlers = [
  http.get("/posts/:postId/comments", ({ request, params }) => {
    const { postId } = params as { postId: string };
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get("offset") || DEFAULT_OFFSET);
    const limit = Number(url.searchParams.get("limit") || DEFAULT_LIMIT);

    const { items: comments, pagination } = paginate(
      TOTAL_COMMENTS_COUNT,
      offset,
      limit,
      () =>
        generateComment({ postId, parentId: undefined, user: generateUser() }),
    );

    return HttpResponse.json({
      comments,
      metadata: {
        pagination,
      },
    });
  }),

  http.get("/comments/:parentId/replies", ({ request, params }) => {
    const { parentId } = params as { parentId: string };
    const url = new URL(request.url);
    const offset = Number(url.searchParams.get("offset") || DEFAULT_OFFSET);
    const limit = Number(url.searchParams.get("limit") || DEFAULT_LIMIT);

    const { items: comments, pagination } = paginate(
      TOTAL_REPLIES_COUNT,
      offset,
      limit,
      () =>
        generateComment({ postId: undefined, parentId, user: generateUser() }),
    );

    return HttpResponse.json({
      comments,
      metadata: {
        pagination,
      },
    });
  }),
];
