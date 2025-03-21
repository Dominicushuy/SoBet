// types/result.ts

export interface LotteryResultData {
  metadata: {
    version: string;
    nguon: string;
    ngayLayDuLieu: string;
    tongSoMien: number;
    tongSoNgay: number;
    thuDaLay: string;
    ngayDaLay: string;
    quyTacApDung: string;
  };
  duLieu: {
    [day: string]: {
      'mien-bac'?: MienBacResult;
      'mien-trung'?: MienTrungResult;
      'mien-nam'?: MienNamResult;
    };
  };
}

export interface MienBacResult {
  tinh: string;
  ngay: string;
  thu: string;
  loaiVe?: string;
  ketQua: {
    giaiDacBiet: string[];
    giaiNhat: string[];
    giaiNhi: string[];
    giaiBa: string[];
    giaiTu: string[];
    giaiNam: string[];
    giaiSau: string[];
    giaiBay: string[];
  };
}

export interface MienTrungResult {
  ngay: string;
  thu: string;
  cacTinh: TinhResult[];
}

export interface MienNamResult {
  ngay: string;
  thu: string;
  cacTinh: TinhResult[];
}

export interface TinhResult {
  tinh: string;
  maTinh?: string;
  ketQua: {
    giaiDacBiet: string[];
    giaiNhat: string[];
    giaiNhi: string[];
    giaiBa: string[];
    giaiTu: string[];
    giaiNam: string[];
    giaiSau: string[];
    giaiBay: string[];
    giaiTam: string[];
  };
}

// Cấu trúc lịch xổ số theo ngày
export interface LotteryRegionsData {
  metadata: {
    version: string;
    nguon: string;
    ngayLayDuLieu: string;
    tongSoMien: number;
    tongSoNgay: number;
  };
  duLieu: {
    [day: string]: {
      'mien-bac': TinhInfo[];
      'mien-trung': TinhInfo[];
      'mien-nam': TinhInfo[];
    };
  };
}

export interface TinhInfo {
  tinh: string;
  maTinh?: string;
  ngay: string;
  thu: string;
  mien: string;
}

// Cấu trúc kết quả đã lưu trong database
export interface SavedResult {
  id: string;
  draw_date: string;
  province: string;
  region: string;
  winning_numbers: {
    giaiDacBiet: string[];
    giaiNhat: string[];
    giaiNhi: string[];
    giaiBa: string[];
    giaiTu: string[];
    giaiNam: string[];
    giaiSau: string[];
    giaiBay: string[];
    giaiTam?: string[];
  };
  created_at: string;
  updated_at: string;
}

// Hàm helper để chuyển đổi từ dữ liệu gốc sang cấu trúc đã lưu
export function transformResultData(
  resultData: LotteryResultData,
  day: string,
  region: string,
  province: string
): SavedResult | null {
  try {
    const dayData = resultData.duLieu[day];
    if (!dayData) return null;

    if (region === 'M1') {
      // Cho Miền Nam hoặc Miền Trung
      const mien = province.includes('Trung') ? 'mien-trung' : 'mien-nam';
      const mienData = dayData[mien as keyof typeof dayData] as MienTrungResult | MienNamResult;
      if (!mienData) return null;

      const tinhResult = mienData.cacTinh.find((t) => t.tinh === province);
      if (!tinhResult) return null;

      return {
        id: `${day}-${province}`.replace(/-/g, ''),
        draw_date: dayData[mien as keyof typeof dayData]?.ngay || '',
        province,
        region,
        winning_numbers: tinhResult.ketQua,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      // Cho Miền Bắc
      const bacData = dayData['mien-bac'] as MienBacResult;
      if (!bacData) return null;

      return {
        id: `${day}-${province}`.replace(/-/g, ''),
        draw_date: bacData.ngay,
        province,
        region,
        winning_numbers: bacData.ketQua,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('Error transforming result data:', error);
    return null;
  }
}
