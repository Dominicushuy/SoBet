import React from 'react';

import { Search } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface BetTypeProps {
  betTypes: any[];
  selectedBetType: string;
  onBetTypeChange: (type: string) => void;
  region: string;
  disabled?: boolean;
}

const BetTypeSelector: React.FC<BetTypeProps> = ({
  betTypes,
  selectedBetType,
  onBetTypeChange,
  region,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filter bet types based on search term
  const filteredBetTypes = betTypes.filter((betType) => {
    return (
      betType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      betType.rule_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      betType.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Group bet types by category
  const groupedBetTypes = React.useMemo(() => {
    const groups: Record<string, any[]> = {};

    filteredBetTypes.forEach((betType) => {
      const category = betType.bet_type || 'Khác';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(betType);
    });

    return groups;
  }, [filteredBetTypes]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm loại cược..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-4">
        {Object.entries(groupedBetTypes).map(([category, types]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">{category}</h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {types.map((betType) => (
                <Button
                  key={betType.rule_code}
                  variant={selectedBetType === betType.rule_code ? 'default' : 'outline'}
                  className="justify-start px-3 py-2 h-auto"
                  onClick={() => onBetTypeChange(betType.rule_code)}
                  disabled={disabled}
                >
                  <div className="text-left">
                    <div className="font-medium">{betType.name}</div>
                    <div className="text-xs text-muted-foreground">{betType.rule_code}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ))}

        {filteredBetTypes.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            Không tìm thấy loại cược phù hợp
          </div>
        )}
      </div>

      {selectedBetType && (
        <div className="rounded-md bg-muted/50 p-3">
          <h3 className="font-medium mb-1">
            {betTypes.find((bt) => bt.rule_code === selectedBetType)?.name || selectedBetType}
          </h3>
          <p className="text-sm text-muted-foreground">
            {betTypes.find((bt) => bt.rule_code === selectedBetType)?.description ||
              'Không có mô tả chi tiết.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default BetTypeSelector;
