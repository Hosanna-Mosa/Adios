import React from "react";
import { Platform } from "react-native";
import { Colors } from "@/constants/colors";
import { styles } from "../support-chat.styles";
import { CreateTicketForm } from "./CreateTicketForm";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { Box } from "@/components/ui/Box";
import { KeyboardView } from "@/components/ui/KeyboardView";
import { List } from "@/components/ui/List";

/** The new-ticket screen. The form sits in a FlatList so it scrolls clear of
 * the keyboard on both platforms. */
export function CreateTicketView({
  paddingTop,
  onBack,
  category,
  onCategoryChange,
  title,
  onTitleChange,
  message,
  onMessageChange,
  submitting,
  onSubmit,
}: {
  paddingTop: number;
  onBack: () => void;
  category: string;
  onCategoryChange: (v: string) => void;
  title: string;
  onTitleChange: (v: string) => void;
  message: string;
  onMessageChange: (v: string) => void;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <Box style={[styles.root, { backgroundColor: Colors.background }]}>
      <ScreenHeader title="Create Support Ticket" paddingTop={paddingTop} onBack={onBack} />

      <KeyboardView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <List
          data={[{ key: "form" }]}
          renderItem={() => (
            <CreateTicketForm
              category={category}
              onCategoryChange={onCategoryChange}
              title={title}
              onTitleChange={onTitleChange}
              message={message}
              onMessageChange={onMessageChange}
              submitting={submitting}
              onSubmit={onSubmit}
            />
          )}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      </KeyboardView>
    </Box>
  );
}
