import { Modal } from "react-native";
import { Store149ModalOverlay } from "./Store149ModalOverlay";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type Store149Styles } from "@/features/food/149-store.styles";

// Moved out of app/149-store.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  buildFoodItem: any;
  accent: ServiceTokens;
  addCartItem: any;
  cartItems: any;
  insets: EdgeInsets;
  isSheetVisible: boolean;
  selectedItem: any;
  setIsSheetVisible: any;
  styles: Store149Styles;
  tokens: ThemeTokens;
  updateCartQuantity: any;
}

export function Store149ItemSheet({
  buildFoodItem,
  accent,
  addCartItem,
  cartItems,
  insets,
  isSheetVisible,
  selectedItem,
  setIsSheetVisible,
  styles,
  tokens,
  updateCartQuantity,
}: Props) {
  return (
    <Modal visible={isSheetVisible} transparent animationType="slide" onRequestClose={() => setIsSheetVisible(false)}>
      <Store149ModalOverlay
        buildFoodItem={buildFoodItem}
        accent={accent}
        addCartItem={addCartItem}
        cartItems={cartItems}
        insets={insets}
        selectedItem={selectedItem}
        setIsSheetVisible={setIsSheetVisible}
        styles={styles}
        tokens={tokens}
        updateCartQuantity={updateCartQuantity}
      />
    </Modal>
  );
}
