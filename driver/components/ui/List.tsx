/** Transparent `FlatList`, re-exported under a named-component name.
 *
 * A re-export rather than a wrapper: wrapping erases the generic and breaks
 * `renderItem` type inference at every call site, and hides the imperative
 * handle (`scrollToIndex`) that list screens rely on.
 */
export { FlatList as List } from "react-native";
