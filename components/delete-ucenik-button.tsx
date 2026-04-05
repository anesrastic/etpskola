"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteUcenikButton({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete() {
    await fetch(`/api/ucenici/${id}`, { method: "DELETE" });
    router.push("/ucenici");
    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50">
          🗑 Obriši učenika
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sigurno brišete učenika?</AlertDialogTitle>
          <AlertDialogDescription>
            Ova akcija se ne može poništiti. Svi podaci o učeniku biće trajno obrisani.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Otkaži</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
            Obriši
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
