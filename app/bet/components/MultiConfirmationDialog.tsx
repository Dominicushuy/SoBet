// app/bet/components/MultiConfirmationDialog.tsx
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { formatCurrency } from '@/lib/lottery/calculators';
import { formatDate } from '@/lib/utils';

interface MultiConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: {
    region: string;
    provinces: string[];
    betType: string;
    subtype?: string;
    numbers: string[];
    amount: number;
    totalStake: number;
    potentialWin: number;
    drawDate: Date;
    breakdowns?: {
      province: string;
      region: string;
      stake: number;
      potentialWin: number;
    }[];
  };
  isSubmitting: boolean;
}

const MultiConfirmationDialog: React.FC<MultiConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  data,
  isSubmitting,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận đặt cược</DialogTitle>
          <DialogDescription>Vui lòng kiểm tra thông tin cược trước khi xác nhận</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-gray-500">Khu vực:</div>
            <div>{data.region}</div>

            <div className="text-gray-500">Tỉnh/Thành phố:</div>
            <div className="max-h-16 overflow-y-auto">
              {data.provinces.length <= 3 ? (
                data.provinces.join(', ')
              ) : (
                <div className="flex flex-col space-y-1">
                  {data.provinces.map((province) => (
                    <span key={province} className="text-xs">
                      {province}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="text-gray-500">Ngày xổ:</div>
            <div>{formatDate(data.drawDate)}</div>

            <div className="text-gray-500">Loại cược:</div>
            <div>{data.betType}</div>

            {data.subtype && (
              <>
                <div className="text-gray-500">Kiểu phụ:</div>
                <div>{data.subtype}</div>
              </>
            )}

            <div className="text-gray-500">Mệnh giá mỗi số:</div>
            <div>{formatCurrency(data.amount)}</div>

            <div className="text-gray-500">Tổng tiền đóng:</div>
            <div className="font-semibold">{formatCurrency(data.totalStake)}</div>

            <div className="text-gray-500">Tiềm năng thắng:</div>
            <div className="font-semibold text-lottery-win">
              {formatCurrency(data.potentialWin)}
            </div>
          </div>

          {data.breakdowns && data.breakdowns.length > 1 && (
            <div className="mt-2 border-t pt-2">
              <p className="text-sm font-medium mb-1">Chi tiết tiền cược:</p>
              <div className="max-h-32 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">Tỉnh/TP</th>
                      <th className="text-right py-1">Tiền cược</th>
                      <th className="text-right py-1">T.Năng thắng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.breakdowns.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-1">{item.province}</td>
                        <td className="text-right py-1">{formatCurrency(item.stake)}</td>
                        <td className="text-right py-1 text-lottery-win">
                          {formatCurrency(item.potentialWin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500 mb-1">Số đã chọn ({data.numbers.length}):</p>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto border p-2 rounded">
              {data.numbers.map((number) => (
                <span
                  key={number}
                  className="inline-flex items-center justify-center rounded-md bg-muted px-2 py-1 text-xs"
                >
                  {number}
                </span>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
            <p>
              Lưu ý: Vé cược sau khi xác nhận không thể thay đổi số. Bạn chỉ có thể hủy cược trước
              khi có kết quả xổ số.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button variant="lottery" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Đang xác nhận...' : 'Xác nhận đặt cược'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MultiConfirmationDialog;
