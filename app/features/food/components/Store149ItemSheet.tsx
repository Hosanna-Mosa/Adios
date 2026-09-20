import { Modal } from "react-native";
import { Store149ModalOverlay } from "./Store149ModalOverlay";
import { StatusBarFill } from "@/components/StatusBarFill";

// Moved out of app/149-store.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  buildFoodItem: any;
  accent: any;
  addCartItem: any;
  cartItems: any;
  insets: any;
  isSheetVisible: any;
  selectedItem: any;
  setIsSheetVisible: any;
  styles: any;
  tokens: any;
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
    <Modal statusBarTranslucent visible={isSheetVisible} transparent animationType="slide" onRequestClose={() => setIsSheetVisible(false)}>
      <StatusBarFill />
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
