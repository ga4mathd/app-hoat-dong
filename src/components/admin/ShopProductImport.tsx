import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface ExcelRow {
  'Tên sản phẩm'?: string;
  'Mô tả'?: string;
  'Giá'?: number;
  'Hình ảnh'?: string;
  'Danh mục'?: string;
  'Link mua'?: string;
}

interface ParsedProduct {
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  category: string | null;
  link: string | null;
}

interface ShopProductImportProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: ParsedProduct[], mode: 'add' | 'replace') => void;
  loading: boolean;
}

export function ShopProductImport({ open, onClose, onImport, loading }: ShopProductImportProps) {
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'add' | 'replace'>('add');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = [
      {
        'Tên sản phẩm': 'Sách nuôi dạy con',
        'Mô tả': 'Sách hướng dẫn nuôi dạy con thông minh',
        'Giá': 250000,
        'Hình ảnh': 'https://example.com/image.jpg',
        'Danh mục': 'Sách',
        'Link mua': 'https://shopee.vn/xxxxx'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản phẩm');
    
    worksheet['!cols'] = [
      { wch: 30 }, { wch: 40 }, { wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 40 }
    ];

    XLSX.writeFile(workbook, 'template_san_pham.xlsx');
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

        const parsed: ParsedProduct[] = [];
        const parseErrors: string[] = [];

        jsonData.forEach((row, index) => {
          const rowNum = index + 2;
          
          if (!row['Tên sản phẩm']?.toString().trim()) {
            parseErrors.push(`Dòng ${rowNum}: Thiếu tên sản phẩm`);
            return;
          }

          parsed.push({
            name: row['Tên sản phẩm'].toString().trim(),
            description: row['Mô tả']?.toString().trim() || null,
            price: row['Giá'] ? Number(row['Giá']) : null,
            image_url: row['Hình ảnh']?.toString().trim() || null,
            category: row['Danh mục']?.toString().trim() || null,
            link: row['Link mua']?.toString().trim() || null
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

  const formatPrice = (price: number | null) => {
    if (!price) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Sản phẩm Shop</DialogTitle>
          <DialogDescription>
            Upload file Excel để import danh sách sản phẩm
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
              id="shop-product-upload"
            />
            <label
              htmlFor="shop-product-upload"
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
                  Đã đọc được {parsedData.length} sản phẩm. Xem trước dữ liệu bên dưới.
                </AlertDescription>
              </Alert>

              <div className="max-h-[300px] overflow-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Mô tả</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 10).map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category || '-'}</TableCell>
                        <TableCell>{formatPrice(item.price)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <RadioGroup value={importMode} onValueChange={(v) => setImportMode(v as 'add' | 'replace')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="add" id="product-add" />
                  <Label htmlFor="product-add">Thêm mới (giữ lại dữ liệu cũ)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="replace" id="product-replace" />
                  <Label htmlFor="product-replace">Thay thế (xóa hết dữ liệu cũ)</Label>
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
            {loading ? 'Đang import...' : `Import ${parsedData.length} sản phẩm`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
