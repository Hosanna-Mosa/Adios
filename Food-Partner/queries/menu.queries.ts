import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/contexts/authStore";
import {
  addFoodItem,
  deleteFoodItem,
  getFoodMenu,
  getMeatInventory,
  setFoodItemAvailability,
  setMeatItemAvailability,
  setMeatItemPrice,
  updateFoodItem,
} from "@/services/menu.service";
import type { FoodItem, FoodItemInput, MeatItem } from "@/types/models";
import { queryKeys } from "./keys";

// Restaurant menu and meat inventory. Shared by the menu tab, the dish form
// and the dashboard's stock stat.

// Documents written before the flag existed have no `isAvailable` at all, so
// only an explicit false means sold out — the same guard the customer app uses.
export const isInStock = (item: { isAvailable?: boolean }) => item.isAvailable !== false;

const useSession = () => {
  const partner = useAuthStore((s) => s.partner);
  return { vendorId: partner?._id ?? "", isMeat: partner?.role === "meat_vendor" };
};

export function useFoodMenu() {
  const { vendorId, isMeat } = useSession();
  return useQuery({
    queryKey: queryKeys.foodMenu(vendorId),
    queryFn: () => getFoodMenu(vendorId),
    enabled: !!vendorId && !isMeat,
  });
}

export function useSaveFoodItem() {
  const { vendorId } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: FoodItemInput }) =>
      id ? updateFoodItem(id, input) : addFoodItem(vendorId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.foodMenu(vendorId) }),
  });
}

export function useDeleteFoodItem() {
  const { vendorId } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFoodItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.foodMenu(vendorId) }),
  });
}

/** Optimistic, so the switch answers instantly; rolled back if the server refuses. */
export function useToggleFoodAvailability() {
  const { vendorId } = useSession();
  const queryClient = useQueryClient();
  const key = queryKeys.foodMenu(vendorId);
  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) => setFoodItemAvailability(id, isAvailable),
    onMutate: async ({ id, isAvailable }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<FoodItem[]>(key);
      queryClient.setQueryData<FoodItem[]>(key, (items) => items?.map((item) => (item._id === id ? { ...item, isAvailable } : item)));
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useMeatInventory() {
  const { vendorId, isMeat } = useSession();
  return useQuery({
    queryKey: queryKeys.meatInventory(vendorId),
    queryFn: () => getMeatInventory(vendorId),
    enabled: !!vendorId && isMeat,
  });
}

export function useToggleMeatAvailability() {
  const { vendorId } = useSession();
  const queryClient = useQueryClient();
  const key = queryKeys.meatInventory(vendorId);
  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) => setMeatItemAvailability(id, isAvailable),
    onMutate: async ({ id, isAvailable }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MeatItem[]>(key);
      queryClient.setQueryData<MeatItem[]>(key, (items) => items?.map((item) => (item._id === id ? { ...item, isAvailable } : item)));
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useSetMeatPrice() {
  const { vendorId } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, price }: { id: string; price: number }) => setMeatItemPrice(id, price),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.meatInventory(vendorId) }),
  });
}
