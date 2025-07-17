/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as actions_chatWithAudio from "../actions/chatWithAudio.js";
import type * as actions_evaluateTeaching from "../actions/evaluateTeaching.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as documents from "../documents.js";
import type * as generatedContent from "../generatedContent.js";
import type * as teachMeSessions from "../teachMeSessions.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "actions/chatWithAudio": typeof actions_chatWithAudio;
  "actions/evaluateTeaching": typeof actions_evaluateTeaching;
  auth: typeof auth;
  chat: typeof chat;
  documents: typeof documents;
  generatedContent: typeof generatedContent;
  teachMeSessions: typeof teachMeSessions;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
