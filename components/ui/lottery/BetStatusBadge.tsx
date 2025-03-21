// components/lottery/BetStatusBadge.tsx
import * as React from 'react';

import { Badge } from '@/components/ui/Badge';
import { BetStatus } from '@/types/bet';

interface BetStatusBadgeProps {
  status: BetStatus;
}

const BetStatusBadge: React.FC<BetStatusBadgeProps> = ({ status }) => {
  const getVariant = () => {
    switch (status) {
      case 'PENDING':
        return 'pending';
      case 'VERIFIED':
        return 'verified';
      case 'WON':
        return 'win';
      case 'LOST':
        return 'lost';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'default';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'PENDING':
        return 'Chờ kết quả';
      case 'VERIFIED':
        return 'Đã xác minh';
      case 'WON':
        return 'Trúng thưởng';
      case 'LOST':
        return 'Không trúng';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return <Badge variant={getVariant() as any}>{getLabel()}</Badge>;
};

export default BetStatusBadge;
