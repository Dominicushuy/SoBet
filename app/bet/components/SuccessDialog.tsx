import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  onViewBet: () => void;
  betCode: string;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({ open, onClose, onViewBet, betCode }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-lottery-win">
            Đặt cược thành công!
          </DialogTitle>
          <DialogDescription className="text-center">
            Vé cược của bạn đã được tạo thành công
          </DialogDescription>
        </DialogHeader>

        <Confetti />

        <div className="my-6 text-center">
          <div className="text-lg font-semibold mb-2">Mã vé của bạn:</div>
          <div className="text-2xl font-bold bg-gray-100 p-3 rounded-md">{betCode}</div>
          <p className="mt-3 text-sm text-gray-500">
            Hãy lưu lại mã vé này để kiểm tra kết quả sau khi xổ số.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:flex-1">
            Đặt cược tiếp
          </Button>
          <Button variant="lottery" onClick={onViewBet} className="sm:flex-1">
            Xem chi tiết vé
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;
