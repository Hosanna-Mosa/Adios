import QRCode from "react-qr-code";
import { Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "../restaurantMenuTypes";

interface RestaurantQrDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant | null;
  onDownload: () => void;
}

/** The digital-menu QR code dialog for a restaurant. */
export function RestaurantQrDialog({ isOpen, onOpenChange, restaurant, onDownload }: RestaurantQrDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl p-6 text-center flex flex-col items-center">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-[#00665c] text-center w-full">Digital Menu QR Code</DialogTitle>
          <p className="text-muted-foreground text-sm text-center">{restaurant?.name}</p>
        </DialogHeader>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center relative mb-6">
          {restaurant && (
            <QRCode
              id="restaurant-qr-code"
              value={`${import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173"}/restaurant-menu/${restaurant._id}`}
              size={200}
              level="H"
              className="bg-white"
            />
          )}
        </div>

        <p className="text-xs text-slate-500 mb-6 px-4">Customers can scan this QR code to view your digital menu instantly. Print this to place on your tables!</p>

        <DialogFooter className="w-full flex justify-center">
          <Button onClick={onDownload} className="bg-[#00665c] hover:bg-[#005249] rounded-xl px-8 w-full flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
