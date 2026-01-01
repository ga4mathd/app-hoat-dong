import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { convertToEmbedUrl } from '@/lib/youtube';

interface ExcelRow {
  ngay: string;
  hoat_dong: string;
  mo_ta?: string;
  danh_muc?: string;
  huong_dan?: string;
  muc_dich?: string;
  video?: string;
  diem?: number;
  chuyen_gia?: string;
  chuc_danh?: string;
  avatar_gv?: string;
  hinh_anh?: string;
}

interface ParsedActivity {
  scheduled_date: string;
  title: string;
  description: string;
  tags: string[];
  instructions: string;
  goals: string;
  video_url: string;
  points: number;
  expert_name: string;
  expert_title: string;
  image_url: string;
  expert_avatar: string;
}

interface ExcelImportProps {
  open: boolean;
  onClose: () => void;
  onImport: (activities: ParsedActivity[], mode: 'add' | 'replace') => void;
  loading?: boolean;
}

export const ExcelImport = ({ open, onClose, onImport, loading }: ExcelImportProps) => {
  const [parsedData, setParsedData] = useState<ParsedActivity[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'add' | 'replace'>('add');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const templateData = [
      {
        'Ngày (YYYY-MM-DD)': '2025-01-01',
        'Hoạt động': 'Vẽ tranh thiên nhiên',
        'Mô tả': 'Cùng bé vẽ những hình ảnh thiên nhiên xung quanh',
        'Danh mục': 'Sáng tạo, Nghệ thuật',
        'Hướng dẫn': 'Bước 1: Chuẩn bị giấy và bút màu...',
        'Mục đích': 'Phát triển tư duy sáng tạo, kỹ năng vận động tinh',
        'Video': 'https://youtube.com/watch?v=xxxxx',
        'Điểm': 15,
        'Chuyên gia': 'Chuyên gia Jenna',
        'Chức danh': 'Chuyên gia Tâm lý Giáo dục',
        'Avatar GV': 'https://example.com/avatar.jpg',
        'Hình ảnh': 'https://example.com/activity.jpg',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hoạt động');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, { wch: 25 }, { wch: 40 }, { wch: 20 },
      { wch: 50 }, { wch: 40 }, { wch: 40 }, { wch: 8 },
      { wch: 20 }, { wch: 25 }, { wch: 40 }, { wch: 40 },
    ];

    XLSX.writeFile(wb, 'mau_hoat_dong.xlsx');
  };

  const parseExcelDate = (value: unknown): string => {
    if (!value) return '';
    
    // If it's already a string in correct format
    if (typeof value === 'string') {
      // Try to parse DD/MM/YYYY format
      const ddmmyyyy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddmmyyyy) {
        return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
      }
      // Already YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }
    }
    
    // Excel serial date number
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
    }
    
    return '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        const parseErrors: string[] = [];
        const activities: ParsedActivity[] = [];

        jsonData.forEach((row, index) => {
          const rowNum = index + 2; // Excel row number (1-indexed + header)
          
          // Map various column name formats
          const ngay = row['Ngày (YYYY-MM-DD)'] || row['Ngày'] || row['ngay'] || row['Date'];
          const hoatDong = row['Hoạt động'] || row['hoat_dong'] || row['Title'] || row['Activity'];
          
          if (!hoatDong) {
            parseErrors.push(`Dòng ${rowNum}: Thiếu tên hoạt động`);
            return;
          }

          const parsedDate = parseExcelDate(ngay);
          if (!parsedDate) {
            parseErrors.push(`Dòng ${rowNum}: Ngày không hợp lệ (${ngay})`);
            return;
          }

          const danhMuc = String(row['Danh mục'] || row['danh_muc'] || row['Tags'] || row['Category'] || '');
          const tags = danhMuc.split(/[,;]/).map(t => t.trim()).filter(Boolean);

          activities.push({
            scheduled_date: parsedDate,
            title: String(hoatDong),
            description: String(row['Mô tả'] || row['mo_ta'] || row['Description'] || ''),
            tags,
            instructions: String(row['Hướng dẫn'] || row['huong_dan'] || row['Instructions'] || ''),
            goals: String(row['Mục đích'] || row['muc_dich'] || row['Goals'] || ''),
            video_url: convertToEmbedUrl(String(row['Video'] || row['video'] || row['Video URL'] || '')) || '',
            points: Number(row['Điểm'] || row['diem'] || row['Points'] || 10),
            expert_name: String(row['Chuyên gia'] || row['chuyen_gia'] || row['Expert'] || 'Chuyên gia Jenna'),
            expert_title: String(row['Chức danh'] || row['chuc_danh'] || row['Title'] || 'Chuyên gia Tâm lý Giáo dục'),
            image_url: String(row['Hình ảnh'] || row['hinh_anh'] || row['Image'] || ''),
            expert_avatar: String(row['Avatar GV'] || row['avatar_gv'] || row['Avatar'] || ''),
          });
        });

        setErrors(parseErrors);
        setParsedData(activities);
      } catch (error) {
        console.error('Error parsing Excel:', error);
        setErrors(['Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.']);
        setParsedData([]);
      }
    };
    reader.readAsArrayBuffer(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = () => {
    if (parsedData.length > 0) {
      onImport(parsedData, importMode);
    }
  };

  const handleClose = () => {
    setParsedData([]);
    setErrors([]);
    setImportMode('add');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import hoạt động từ Excel
          </DialogTitle>
          <DialogDescription>
            Tải lên file Excel chứa danh sách hoạt động để import vào hệ thống
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template download */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Tải file mẫu để xem định dạng yêu cầu</span>
              <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
                <Download className="h-4 w-4" />
                Tải mẫu Excel
              </Button>
            </AlertDescription>
          </Alert>

          {/* File upload */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-upload"
            />
            <label
              htmlFor="excel-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Click để chọn file hoặc kéo thả file Excel vào đây
              </span>
              <span className="text-xs text-muted-foreground">
                Hỗ trợ: .xlsx, .xls
              </span>
            </label>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Có {errors.length} lỗi khi đọc file:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {errors.slice(0, 5).map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                  {errors.length > 5 && <li>... và {errors.length - 5} lỗi khác</li>}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {parsedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">
                  Đã đọc được {parsedData.length} hoạt động
                </span>
              </div>

              {/* Import mode */}
              <RadioGroup
                value={importMode}
                onValueChange={(v) => setImportMode(v as 'add' | 'replace')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="add" id="add" />
                  <Label htmlFor="add">Thêm vào danh sách hiện tại</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="replace" id="replace" />
                  <Label htmlFor="replace" className="text-destructive">
                    Xóa tất cả và thay thế bằng dữ liệu mới
                  </Label>
                </div>
              </RadioGroup>

              {/* Preview table */}
              <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[100px]">Ngày</TableHead>
                      <TableHead>Hoạt động</TableHead>
                      <TableHead className="w-[150px]">Danh mục</TableHead>
                      <TableHead className="w-[60px]">Điểm</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 10).map((activity, i) => (
                      <TableRow key={i}>
                        <TableCell>{activity.scheduled_date}</TableCell>
                        <TableCell className="font-medium">{activity.title}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {activity.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{activity.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {parsedData.length > 10 && (
                  <div className="p-2 text-center text-sm text-muted-foreground bg-muted/30">
                    ... và {parsedData.length - 10} hoạt động khác
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              onClick={handleImport}
              disabled={loading || parsedData.length === 0}
            >
              {loading ? 'Đang import...' : `Import ${parsedData.length} hoạt động`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
