import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button"; // adjust path if needed

export const confirmToast = (message, onConfirm) => {
  toast((t) => (
    <div className="flex flex-col space-y-2">
      <span>{message}</span>
      <div className="flex space-x-2 my-2">
        <Button
          color="destructive"
          size="sm"
          onClick={() => {
            onConfirm();
            toast.dismiss(t.id);
          }}
        >
          Confirmer
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.dismiss(t.id)}
        >
          Annuler
        </Button>
      </div>
    </div>
  ));
};
