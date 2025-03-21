'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus, Trash } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';

import PayRateEditor from '@/app/admin/bet-types/components/PayRateEditor';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Textarea } from '@/components/ui/TextArea';
import { createBetType, updateBetType } from '@/lib/actions/bet-types';
import {
  betTypeFormSchema,
  BetTypeFormValues,
  SubTypeFormValues,
} from '@/lib/validators/bet-type-form';

interface BetTypeEditorProps {
  betType: BetTypeFormValues | null;
  onClose: (refresh?: boolean) => void;
}

export default function BetTypeEditor({ betType, onClose }: BetTypeEditorProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPayRateEditor, setShowPayRateEditor] = useState(false);
  const [currentSubtypeIndex, setCurrentSubtypeIndex] = useState<number>(-1);

  const isEditing = !!betType?.id;

  // Setup form with default values
  const form = useForm<BetTypeFormValues>({
    resolver: zodResolver(betTypeFormSchema),
    defaultValues: betType || {
      name: '',
      description: '',
      bet_type: '',
      rule_code: '',
      region: 'BOTH',
      digits: null,
      rate: null,
      stake_formula: '',
      variants: [],
      win_logic: {
        type: 'SIMPLE',
        prizes: {
          M1: [],
          M2: [],
        },
        digitPosition: 'LAST',
      },
      active: true,
    },
  });

  // Setup field array for variants
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  // Handle form submission
  const onSubmit = async (data: BetTypeFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // If editing, update existing bet type
      if (isEditing && betType?.id) {
        const result = await updateBetType(betType.id, data);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess('Cập nhật loại cược thành công!');
          setTimeout(() => onClose(true), 1500);
        }
      }
      // Otherwise create new bet type
      else {
        const result = await createBetType(data);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess('Tạo loại cược mới thành công!');
          setTimeout(() => onClose(true), 1500);
        }
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a new variant
  const handleAddVariant = () => {
    appendVariant({
      code: '',
      name: '',
      description: '',
      stakeMultiplier: {
        M1: undefined,
        M2: undefined,
      },
    });
  };

  // Open pay rate editor for specific variant
  const handleEditPayRate = (index: number) => {
    setCurrentSubtypeIndex(index);
    setShowPayRateEditor(true);
  };

  // Update variant with pay rate information
  const handleSavePayRate = (updatedVariant: SubTypeFormValues) => {
    const currentVariants = form.getValues('variants') || [];
    if (currentSubtypeIndex >= 0 && currentSubtypeIndex < currentVariants.length) {
      // Create new array with the updated variant
      const updatedVariants = [...currentVariants];
      updatedVariants[currentSubtypeIndex] = {
        ...currentVariants[currentSubtypeIndex],
        ...updatedVariant,
      };

      // Update form value
      form.setValue('variants', updatedVariants);
    }

    setShowPayRateEditor(false);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Chỉnh sửa' : 'Thêm'} Loại Cược</DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => onClose()}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Thông tin chung</TabsTrigger>
            <TabsTrigger value="variants">Biến thể</TabsTrigger>
            <TabsTrigger value="logic">Logic thắng/thua</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* General tab */}
              <TabsContent value="general" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên loại cược</FormLabel>
                        <FormControl>
                          <Input placeholder="Đầu Đuôi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rule_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã quy tắc</FormLabel>
                        <FormControl>
                          <Input placeholder="dd" {...field} />
                        </FormControl>
                        <FormDescription>Mã ngắn dạng: dd, xc, b2, b3...</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bet_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phân loại cược</FormLabel>
                        <FormControl>
                          <Input placeholder="ĐẦU ĐUÔI" {...field} />
                        </FormControl>
                        <FormDescription>Phân loại lớn: ĐẦU ĐUÔI, BAO LÔ, XIÊN...</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Miền áp dụng</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value as 'M1' | 'M2' | 'BOTH')}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn miền áp dụng" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="M1">Miền Nam/Trung (M1)</SelectItem>
                            <SelectItem value="M2">Miền Bắc (M2)</SelectItem>
                            <SelectItem value="BOTH">Cả hai miền (BOTH)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="digits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số chữ số</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2"
                            value={field.value === null ? '' : field.value}
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : parseInt(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Số chữ số cần thiết cho loại cược này (2, 3, 4...)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tỷ lệ thưởng cơ bản</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="75"
                            value={field.value === null ? '' : field.value}
                            onChange={(e) => {
                              const value =
                                e.target.value === '' ? null : parseFloat(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>Tỷ lệ thưởng cơ bản (1:75, 1:650...)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="stake_formula"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Công thức tính tiền đóng</FormLabel>
                      <FormControl>
                        <Textarea placeholder="return 1;" className="font-mono" {...field} />
                      </FormControl>
                      <FormDescription>
                        JavaScript code để tính hệ số nhân cho tiền đóng. Ví dụ: return region ===
                        &#39;M1&#39; ? 2 : 5;
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Mô tả chi tiết về loại cược này..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <FormLabel className="text-base">Kích hoạt</FormLabel>
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Variants tab */}
              <TabsContent value="variants" className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Biến thể loại cược</h3>
                  <Button type="button" onClick={handleAddVariant} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Thêm biến thể
                  </Button>
                </div>

                {variantFields.length === 0 ? (
                  <div className="text-center p-6 bg-gray-50 rounded-md">
                    <p className="text-gray-500">
                      Chưa có biến thể nào. Thêm biến thể để cung cấp thêm các lựa chọn cho người
                      dùng.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {variantFields.map((field, index) => (
                      <div key={field.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Biến thể #{index + 1}</h4>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPayRate(index)}
                            >
                              Tỷ lệ thưởng
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeVariant(index)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`variants.${index}.code`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mã biến thể</FormLabel>
                                <FormControl>
                                  <Input placeholder="dd" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tên biến thể</FormLabel>
                                <FormControl>
                                  <Input placeholder="Đầu Đuôi Toàn Phần" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <FormField
                            control={form.control}
                            name={`variants.${index}.stakeMultiplier.M1`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hệ số nhân M1</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="1"
                                    value={field.value === undefined ? '' : field.value}
                                    onChange={(e) => {
                                      const value =
                                        e.target.value === ''
                                          ? undefined
                                          : parseFloat(e.target.value);
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.stakeMultiplier.M2`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hệ số nhân M2</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="1"
                                    value={field.value === undefined ? '' : field.value}
                                    onChange={(e) => {
                                      const value =
                                        e.target.value === ''
                                          ? undefined
                                          : parseFloat(e.target.value);
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`variants.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="mt-3">
                              <FormLabel>Mô tả</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Mô tả biến thể..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Win Logic tab */}
              <TabsContent value="logic" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="win_logic.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại logic</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value as 'SIMPLE' | 'COMPLEX')}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại logic" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SIMPLE">Đơn giản (SIMPLE)</SelectItem>
                            <SelectItem value="COMPLEX">Phức tạp (COMPLEX)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Logic đơn giản: khớp chính xác. Phức tạp: nhiều điều kiện
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="win_logic.digitPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vị trí chữ số</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) =>
                            field.onChange(value as 'LAST' | 'FIRST' | 'ALL')
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn vị trí chữ số" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LAST">Cuối (LAST)</SelectItem>
                            <SelectItem value="FIRST">Đầu (FIRST)</SelectItem>
                            <SelectItem value="ALL">Toàn bộ (ALL)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Vị trí chữ số cần kiểm tra trong kết quả</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="win_logic.digitCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lượng chữ số kiểm tra</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2"
                            value={field.value === undefined ? '' : field.value}
                            onChange={(e) => {
                              const value =
                                e.target.value === '' ? undefined : parseInt(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>Số lượng chữ số cần kiểm tra (2, 3, 4...)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="win_logic.matchType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kiểu khớp</FormLabel>
                        <Select
                          value={field.value || ''}
                          onValueChange={(value) =>
                            field.onChange(value ? (value as 'ANY' | 'ALL') : undefined)
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn kiểu khớp" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ANY">Bất kỳ (ANY)</SelectItem>
                            <SelectItem value="ALL">Tất cả (ALL)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>ANY: khớp bất kỳ, ALL: khớp tất cả</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="win_logic.prizes.M1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giải thưởng M1</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="G8,DB"
                            value={field.value?.join(',') || ''}
                            onChange={(e) => {
                              const value = e.target.value
                                .split(',')
                                .map((v) => v.trim())
                                .filter(Boolean);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Danh sách giải thưởng cần kiểm tra cho M1, ngăn cách bởi dấu phẩy (ALL cho
                          tất cả)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="win_logic.prizes.M2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giải thưởng M2</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="G7,DB"
                            value={field.value?.join(',') || ''}
                            onChange={(e) => {
                              const value = e.target.value
                                .split(',')
                                .map((v) => v.trim())
                                .filter(Boolean);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Danh sách giải thưởng cần kiểm tra cho M2, ngăn cách bởi dấu phẩy (ALL cho
                          tất cả)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="win_logic.specialLogic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logic đặc biệt</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="countMatches"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Logic đặc biệt cho trường hợp phức tạp (countMatches, combinationLogic...)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => onClose()}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>

      {/* Pay Rate Editor Dialog */}
      {showPayRateEditor && currentSubtypeIndex >= 0 && (
        <PayRateEditor
          variant={form.getValues(`variants.${currentSubtypeIndex}`)}
          onSave={handleSavePayRate}
          onCancel={() => setShowPayRateEditor(false)}
        />
      )}
    </Dialog>
  );
}
