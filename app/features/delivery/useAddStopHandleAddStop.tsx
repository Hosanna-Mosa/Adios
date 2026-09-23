import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { DeliveryItem } from "@/contexts/deliveryStore";

// Split out of useAddStop so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useAddStopHandleAddStop(address: any, storeName: any, items: any, setItems: any, newItemName: any, setNewItemName: any, newItemPrice: any, setNewItemPrice: any, coords: any, addStop: any) {
  const { t } = useTranslation();
  const handleAddStop = () => {
    if (!address.trim()) {
      Alert.alert(t("app.delivery.required"), t("app.delivery.pleaseProvideAnAddressForThe"));
      return;
    }
    if (items.length === 0) {
      Alert.alert(t("app.delivery.itemsNeeded"), t("app.delivery.pleaseAddAtLeastOneItem"));
      return;
    }
    addStop(address, storeName || undefined, items, coords?.lat, coords?.lng);
    router.back();
  };

  const addItemToLocal = () => {
    if (!newItemName.trim()) return;
    const item: DeliveryItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: 1,
      estimatedPrice: newItemPrice.trim() ? Number(newItemPrice) : undefined,
    };
    setItems([...items, item]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const removeItemFromLocal = (id: string) => setItems(items.filter((i: any) => i.id !== id));

  return { handleAddStop, addItemToLocal, removeItemFromLocal };
}
