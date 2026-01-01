import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { convertToEmbedUrl } from '@/lib/youtube';

interface ExcelRow {
  'Tiêu đề'?: string;
  'Loại'?: string;
  'Mô tả'?: string;
  'Link nội dung'?: string;
  'Hình ảnh'?: string;
  'Thời lượng (phút)'?: number;
}

interface ParsedStoryMusic {
  title: string;
  type: string;
  description: string | null;
  content_url: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
}

interface StoryMusicImportProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: ParsedStoryMusic[], mode: 'add' | 'replace') => void;
  loading: boolean;
}

export function StoryMusicImport({ open, onClose, onImport, loading }: StoryMusicImportProps) {
  const [parsedData, setParsedData] = useState<ParsedStoryMusic[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'add' | 'replace'>('add');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = [
      {
        'Tiêu đề': 'Truyện cổ tích Tấm Cám',
        'Loại': 'truyện',
        'Mô tả': 'Câu chuyện về lòng tốt và sự công bằng',
        'Link nội dung': 'https://youtube.com/watch?v=xxxxx',
        'Hình ảnh': 'https://example.com/image.jpg',
        'Thời lượng (phút)': 15
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Truyện Nhạc');
    
    worksheet['!cols'] = [
      { wch: 30 }, { wch: 15 }, { wch: 40 }, { wch: 40 }, { wch: 40 }, { wch: 15 }
    ];

    XLSX.writeFile(workbook, 'template_truyen_nhac.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

        const parsed: ParsedStoryMusic[] = [];
        const parseErrors: string[] = [];

        jsonData.forEach((row, index) => {
          const rowNum = index + 2;
          
          if (!row['Tiêu đề']?.toString().trim()) {
            parseErrors.push(`Dòng ${rowNum}: Thiếu tiêu đề`);
            return;
          }

          if (!row['Loại']?.toString().trim()) {
            parseErrors.push(`Dòng ${rowNum}: Thiếu loại (truyện/nhạc)`);
            return;
          }

          parsed.push({
            title: row['Tiêu đề'].toString().trim(),
            type: row['Loại'].toString().trim().toLowerCase(),
            description: row['Mô tả']?.toString().trim() || null,
            content_url: convertToEmbedUrl(row['Link nội dung']?.toString()),
            thumbnail_url: row['Hình ảnh']?.toString().trim() || null,
            duration_minutes: row['Thời lượng (phút)'] ? Number(row['Thời lượng (phút)']) : null
          });
        });

        setParsedData(parsed);
        setErrors(parseErrors);
      } catch (error) {
        setErrors(['Không thể đọc file. Vui lòng kiểm tra định dạng file Excel.']);
      }
    };

    reader.readAsBinaryString(file);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Truyện & Nhạc</DialogTitle>
          <DialogDescription>
            Upload file Excel để import danh sách truyện và nhạc
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Tải file mẫu để biết định dạng cần import</span>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                Tải Template
              </Button>
            </AlertDescription>
          </Alert>

          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="story-music-upload"
            />
            <label
              htmlFor="story-music-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Click để chọn file hoặc kéo thả file Excel vào đây
              </span>
            </label>
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {parsedData.length > 0 && (
            <>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Đã đọc được {parsedData.length} mục. Xem trước dữ liệu bên dưới.
                </AlertDescription>
              </Alert>

              <div className="max-h-[300px] overflow-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Thời lượng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 10).map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                        <TableCell>{item.duration_minutes ? `${item.duration_minutes} phút` : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <RadioGroup value={importMode} onValueChange={(v) => setImportMode(v as 'add' | 'replace')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="add" id="story-add" />
                  <Label htmlFor="story-add">Thêm mới (giữ lại dữ liệu cũ)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="replace" id="story-replace" />
                  <Label htmlFor="story-replace">Thay thế (xóa hết dữ liệu cũ)</Label>
                </div>
              </RadioGroup>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Hủy</Button>
          <Button 
            onClick={handleImport} 
            disabled={parsedData.length === 0 || loading}
          >
            {loading ? 'Đang import...' : `Import ${parsedData.length} mục`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
