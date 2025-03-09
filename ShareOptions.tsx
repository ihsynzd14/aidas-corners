'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface ShareOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappReport: string;
  pdfReport: string;
}

export default function ShareOptions({ 
  isOpen, 
  onClose, 
  whatsappReport, 
  pdfReport 
}: ShareOptionsProps) {
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [modalWidth, setModalWidth] = useState('sm:max-w-md');

  // PDF sekmesi seçildiğinde modal genişliğini değiştir
  useEffect(() => {
    if (activeTab === 'pdf') {
      setModalWidth('sm:max-w-3xl');
    } else {
      setModalWidth('sm:max-w-md');
    }
  }, [activeTab]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Mətn kopyalandı');
      })
      .catch(() => {
        toast.error('Mətn kopyalanarkən xəta baş verdi');
      });
  };

  const handleShareWhatsApp = () => {
    const encodedText = encodeURIComponent(whatsappReport);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const handleDownloadPDF = () => {
    try {
      // PDF oluştur
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Font ayarları
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      // Metin satırlarını ayır
      const lines = pdfReport.split('\n');
      
      // Her satırı PDF'e ekle
      let y = 10;
      const lineHeight = 5;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Başlık satırları için font ayarlarını değiştir
        if (line.includes('AIDA\'S CORNER') || line.includes('MARKET:') || 
            line.includes('ÜMUMI MƏLUMAT') || line.includes('ƏRZAQLAR')) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
        } else if (line.includes('=====')) {
          // Çizgi satırları için atla
          y += lineHeight / 2;
          continue;
        } else {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
        }
        
        // Azerbaycan karakterlerini düzelt
        const fixedLine = fixAzerbaijaniChars(line);
        
        // Satırı ekle
        pdf.text(fixedLine, 10, y);
        y += lineHeight;
        
        // Sayfa sınırını kontrol et ve gerekirse yeni sayfa ekle
        if (y > 280) {
          pdf.addPage();
          y = 10;
        }
      }
      
      // PDF'i indir
      pdf.save(`Ərzaq_Hesabatı_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF uğurla yükləndi');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      toast.error('PDF yaradılarkən xəta baş verdi');
    }
  };
  
  // Azerbaycan karakterlerini PDF için uygun karakterlere dönüştür
  const fixAzerbaijaniChars = (text: string): string => {
    // Özel karakterleri Unicode karşılıklarıyla değiştir
    return text
      .replace(/ə/g, 'e')
      .replace(/Ə/g, 'E')
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'I')
      .replace(/ö/g, 'o')
      .replace(/Ö/g, 'O')
      .replace(/ü/g, 'u')
      .replace(/Ü/g, 'U')
      .replace(/ş/g, 's')
      .replace(/Ş/g, 'S')
      .replace(/ç/g, 'c')
      .replace(/Ç/g, 'C')
      .replace(/ğ/g, 'g')
      .replace(/Ğ/g, 'G');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${modalWidth} max-h-[90vh] overflow-hidden transition-all duration-300`}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Hesabatı paylaş</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="whatsapp" value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="whatsapp" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 dark:data-[state=active]:bg-green-900/20 dark:data-[state=active]:text-green-300">
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="pdf" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800 dark:data-[state=active]:bg-red-900/20 dark:data-[state=active]:text-red-300">
              PDF
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="whatsapp" className="space-y-4 overflow-hidden">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-md text-sm whitespace-pre-wrap max-h-[250px] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-inner">
              {whatsappReport}
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="w-full border-green-200 hover:bg-green-50 hover:text-green-800 dark:border-green-800 dark:hover:bg-green-900/20 dark:hover:text-green-300 py-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center justify-center"
                onClick={() => handleCopyToClipboard(whatsappReport)}
              >
                <Copy className="mr-2 h-5 w-5" />
                Kopyala
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Hesabatı kopyalayıb WhatsApp və ya digər mesajlaşma proqramlarında paylaşa bilərsiniz.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="pdf" className="space-y-4 overflow-hidden">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-md text-sm whitespace-pre-wrap max-h-[350px] overflow-y-auto border border-gray-200 dark:border-gray-700 font-mono shadow-md">
              <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-md mb-4">
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300 mb-2">PDF Önizleme</h3>
                <p className="text-xs text-amber-700 dark:text-amber-400">Aşağıda PDF dosyasının içeriğini görebilirsiniz. İndirmek için aşağıdaki butonu kullanın.</p>
              </div>
              {pdfReport}
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center py-8 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg text-lg"
                onClick={handleDownloadPDF}
              >
                <Download className="mr-3 h-6 w-6" />
                PDF Yüklə
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Hesabatı PDF formatında yükləyəcəksiniz. Daha sonra istədiyiniz proqramla açıb çap edə bilərsiniz.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 