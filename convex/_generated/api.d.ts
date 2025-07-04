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
import type * as events from "../events.js";
import type * as files from "../files.js";
import type * as guestTokens from "../guestTokens.js";
import type * as mediaFiles from "../mediaFiles.js";
import type * as messages from "../messages.js";
import type * as migrations from "../migrations.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  events: typeof events;
  files: typeof files;
  guestTokens: typeof guestTokens;
  mediaFiles: typeof mediaFiles;
  messages: typeof messages;
  migrations: typeof migrations;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
