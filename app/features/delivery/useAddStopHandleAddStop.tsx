import { Alert } from "react-native";
import { router } from "expo-router";
import { DeliveryItem } from "@/contexts/deliveryStore";

// Part 3 of useAddStop, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useAddStopHandleAddStop(address: any, storeName: any, items: any, setItems: any, newItemName: any, setNewItemName: any, newItemPrice: any, setNewItemPrice: any, coords: any, addStop: any) {
  const handleAddStop = () => {
    if (!address.trim()) {
      Alert.alert("Required", "Please provide an address for the pickup.");
      return;
    }
    if (items.length === 0) {
      Alert.alert("Items needed", "Please add at least one item to pick up at this location.");
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
