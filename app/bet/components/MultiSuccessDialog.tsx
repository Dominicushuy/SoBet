// app/bet/components/MultiSuccessDialog.tsx
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
import { formatCurrency } from '@/lib/lottery/calculators';

interface MultiSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  onViewBet: () => void;
  betCodes: string[];
  provinceCount: number;
  totalStake: number;
}

const MultiSuccessDialog: React.FC<MultiSuccessDialogProps> = ({
  open,
  onClose,
  onViewBet,
  betCodes,
  provinceCount,
  totalStake,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-lottery-win">
            Đặt cược thành công!
          </DialogTitle>
          <DialogDescription className="text-center">
            {provinceCount > 1
              ? `Đã tạo thành công ${provinceCount} vé cược cho ${provinceCount} tỉnh/thành phố`
              : 'Vé cược của bạn đã được tạo thành công'}
          </DialogDescription>
        </DialogHeader>

        <Confetti />

        <div className="my-6 text-center">
          <div className="text-lg font-semibold mb-3">
            {provinceCount > 1 ? 'Các mã vé của bạn:' : 'Mã vé của bạn:'}
          </div>

          {provinceCount <= 3 ? (
            // Hiển thị riêng lẻ từng mã vé khi số lượng ít
            <div className="space-y-2">
              {betCodes.map((code) => (
                <div key={code} className="text-lg font-bold bg-gray-100 p-2 rounded-md">
                  {code}
                </div>
              ))}
            </div>
          ) : (
            // Hiển thị trong khung cuộn khi có nhiều mã
            <div className="max-h-40 overflow-y-auto text-left bg-gray-100 p-3 rounded-md">
              {betCodes.map((code, index) => (
                <div key={code} className="font-medium border-b border-gray-200 py-1">
                  {index + 1}. {code}
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 p-2 bg-blue-50 rounded-md text-blue-800">
            <span className="font-semibold">Tổng tiền cược:</span> {formatCurrency(totalStake)}
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Hãy lưu lại các mã vé này để kiểm tra kết quả sau khi xổ số.
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

export default MultiSuccessDialog;
