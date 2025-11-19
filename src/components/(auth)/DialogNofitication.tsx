"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface DialogNotificationProps {
  openDialogNotification: boolean;
  setOpenDialogNotification: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  description: string;
}

export default function DialogNotification({
  openDialogNotification,
  setOpenDialogNotification,
  title,
  description,
}: DialogNotificationProps) {

  return (
    <Dialog open={openDialogNotification} onOpenChange={setOpenDialogNotification}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
