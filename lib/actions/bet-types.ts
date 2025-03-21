'use server';

import { revalidatePath } from 'next/cache';

import createServerClient from '@/lib/supabase/server';
import { BetTypeFormValues } from '@/lib/validators/bet-type-form';

/**
 * Lấy danh sách các loại cược
 */
export async function getBetTypes() {
  try {
    const supabase = await createServerClient();

    // Lấy danh sách từ database
    const { data, error } = await supabase
      .from('rules')
      .select('*')
      .order('bet_type', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return { data };
  } catch (error) {
    console.error('Error fetching bet types:', error);
    return { error: 'Không thể lấy danh sách loại cược. Vui lòng thử lại sau.' };
  }
}

/**
 * Lấy thông tin chi tiết một loại cược
 */
export async function getBetTypeById(id: string) {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase.from('rules').select('*').eq('id', id).single();

    if (error) {
      throw error;
    }

    // Parse JSON fields
    if (data.variants && typeof data.variants === 'string') {
      data.variants = JSON.parse(data.variants);
    }

    if (data.win_logic && typeof data.win_logic === 'string') {
      data.win_logic = JSON.parse(data.win_logic);
    }

    return { data };
  } catch (error) {
    console.error('Error fetching bet type:', error);
    return { error: 'Không thể lấy thông tin loại cược. Vui lòng thử lại sau.' };
  }
}

/**
 * Thêm mới loại cược
 */
export async function createBetType(values: BetTypeFormValues) {
  try {
    const supabase = await createServerClient();

    // Kiểm tra xem rule_code đã tồn tại chưa
    const { data: existingRule } = await supabase
      .from('rules')
      .select('id')
      .eq('rule_code', values.rule_code)
      .maybeSingle();

    if (existingRule) {
      return { error: `Mã quy tắc "${values.rule_code}" đã tồn tại. Vui lòng chọn mã khác.` };
    }

    // Ensure variants and win_logic are JSON
    const dataToInsert = {
      ...values,
      variants: values.variants ? JSON.stringify(values.variants) : null,
      win_logic: values.win_logic ? JSON.stringify(values.win_logic) : null,
    };

    const { data, error } = await supabase.from('rules').insert(dataToInsert).select().single();

    if (error) {
      throw error;
    }

    // Revalidate related paths
    revalidatePath('/admin/bet-types');

    return { data };
  } catch (error) {
    console.error('Error creating bet type:', error);
    return { error: 'Không thể tạo loại cược. Vui lòng thử lại sau.' };
  }
}

/**
 * Cập nhật loại cược
 */
export async function updateBetType(id: string, values: BetTypeFormValues) {
  try {
    const supabase = await createServerClient();

    // Kiểm tra xem rule_code đã tồn tại chưa (trừ id hiện tại)
    const { data: existingRule } = await supabase
      .from('rules')
      .select('id')
      .eq('rule_code', values.rule_code)
      .neq('id', id)
      .maybeSingle();

    if (existingRule) {
      return { error: `Mã quy tắc "${values.rule_code}" đã tồn tại. Vui lòng chọn mã khác.` };
    }

    // Ensure variants and win_logic are JSON
    const dataToUpdate = {
      ...values,
      variants: values.variants ? JSON.stringify(values.variants) : null,
      win_logic: values.win_logic ? JSON.stringify(values.win_logic) : null,
    };

    const { data, error } = await supabase
      .from('rules')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Revalidate related paths
    revalidatePath('/admin/bet-types');

    return { data };
  } catch (error) {
    console.error('Error updating bet type:', error);
    return { error: 'Không thể cập nhật loại cược. Vui lòng thử lại sau.' };
  }
}

/**
 * Xóa loại cược
 */
export async function deleteBetType(id: string) {
  try {
    const supabase = await createServerClient();

    // Kiểm tra xem có cược nào đã sử dụng loại cược này không
    const { count, error: countError } = await supabase
      .from('bets')
      .select('*', { count: 'exact', head: true })
      .eq('rule_id', id);

    if (countError) {
      throw countError;
    }

    if (count && count > 0) {
      return {
        error:
          'Không thể xóa loại cược này vì đã có người đặt cược. Bạn có thể vô hiệu hóa nó thay vì xóa.',
      };
    }

    const { error } = await supabase.from('rules').delete().eq('id', id);

    if (error) {
      throw error;
    }

    // Revalidate related paths
    revalidatePath('/admin/bet-types');

    return { success: true };
  } catch (error) {
    console.error('Error deleting bet type:', error);
    return { error: 'Không thể xóa loại cược. Vui lòng thử lại sau.' };
  }
}

/**
 * Cập nhật trạng thái kích hoạt của loại cược
 */
export async function toggleBetTypeActive(id: string, active: boolean) {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('rules')
      .update({ active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Revalidate related paths
    revalidatePath('/admin/bet-types');

    return { data };
  } catch (error) {
    console.error('Error toggling bet type active status:', error);
    return { error: 'Không thể cập nhật trạng thái loại cược. Vui lòng thử lại sau.' };
  }
}
