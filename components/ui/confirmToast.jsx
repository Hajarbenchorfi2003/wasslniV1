// utils/confirmToast.js
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';

export const confirmToast = ({ 
  message = "Confirmez-vous cette action ?", 
  onConfirm,
  confirmText = "Confirmer",
  cancelText = "Annuler"
}) => {
  toast((t) => (
    <div className="space-x-4">
      <span className="block mb-4 text-gray-800">{message}</span>
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.dismiss(t.id)}
          color="secondary"
        >
          {cancelText}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
          color="destructive"
        >
          {confirmText}
        </Button>
      </div>
    </div>
  ), {
    id: 'action-confirm',
    duration: Infinity,
    position: 'top-center'
  });
};