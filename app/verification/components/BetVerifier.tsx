import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import BetStatusBadge from '@/components/ui/lottery/BetStatusBadge';
import NumberGrid from '@/components/ui/lottery/NumberGrid';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Bet, BetStatus } from '@/types/bet';

interface BetVerifierProps {
  result: {
    bet: Bet;
    verificationResult?: any;
    success?: boolean;
    verified?: boolean;
    message?: string;
  };
  className?: string;
}

const BetVerifier: React.FC<BetVerifierProps> = ({ result, className }) => {
  const { bet, verificationResult, verified, message } = result;

  // Determine winning and losing numbers
  const winningNumbers = verificationResult?.winningNumbers || [];
  const chosenNumbers = bet.chosen_numbers || [];
  const losingNumbers = chosenNumbers.filter((num) => !winningNumbers.includes(num));

  // Check if the bet has been verified
  const isVerified = verified || bet.status !== 'PENDING';

  // Get status text and color
  const getStatusStyle = () => {
    switch (bet.status) {
      case 'WON':
        return 'bg-lottery-win text-white';
      case 'LOST':
        return 'bg-lottery-lose text-white';
      case 'CANCELLED':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-yellow-500 text-white';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {message && (
        <Alert className="bg-blue-50 text-blue-800 border-blue-200">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className={cn('pb-2', isVerified ? getStatusStyle() : 'bg-gray-100')}>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Vé #{bet.bet_code}</CardTitle>
            <BetStatusBadge status={bet.status as BetStatus} />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Loại cược:</div>
              <div className="font-medium">{bet.rule_name || bet.rule_id}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Khu vực:</div>
              <div className="font-medium">
                {bet.region === 'M1' ? 'Miền Nam/Trung' : 'Miền Bắc'} - {bet.province}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Ngày xổ:</div>
              <div className="font-medium">{formatDate(new Date(bet.draw_date))}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Tổng tiền cược:</div>
              <div className="font-medium">{formatCurrency(bet.total_amount)}</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-1">Số đã chọn:</div>
            <div className="flex flex-wrap gap-1">
              {chosenNumbers.map((number) => {
                const isWinning = winningNumbers.includes(number);
                return (
                  <span
                    key={number}
                    className={cn(
                      'px-2 py-1 rounded-md text-sm font-medium',
                      isVerified && isWinning
                        ? 'bg-lottery-win text-white'
                        : isVerified
                          ? 'bg-lottery-lose text-white'
                          : 'bg-gray-100'
                    )}
                  >
                    {number}
                  </span>
                );
              })}
            </div>
          </div>

          {isVerified && winningNumbers.length > 0 && (
            <div className="bg-green-50 p-3 rounded-md text-green-800 space-y-2">
              <div className="font-medium">Số trúng thưởng:</div>
              <div className="flex flex-wrap gap-1">
                {winningNumbers.map((number: number) => (
                  <span
                    key={number}
                    className="bg-lottery-win text-white px-2 py-1 rounded-md text-sm font-medium"
                  >
                    {number}
                  </span>
                ))}
              </div>
              <div className="font-bold text-lg">
                Tổng tiền thắng:{' '}
                {formatCurrency(bet.won_amount || verificationResult?.totalWinAmount || 0)}
              </div>
            </div>
          )}

          {isVerified && winningNumbers.length === 0 && (
            <div className="bg-red-50 p-3 rounded-md text-red-800">
              <div className="font-medium">Không có số nào trúng thưởng.</div>
            </div>
          )}

          {!isVerified && (
            <div className="bg-yellow-50 p-3 rounded-md text-yellow-800">
              <div className="font-medium">Vé chưa được kiểm tra kết quả.</div>
              <div className="text-sm">Vui lòng đợi kết quả xổ số được cập nhật.</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BetVerifier;
