import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share, MoreVertical, Plus, ChevronLeft, Check, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
        <div className="max-w-md mx-auto pt-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Quay lại
          </button>

          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Đã cài đặt thành công!
            </h1>
            <p className="text-muted-foreground">
              Ứng dụng đã được thêm vào màn hình chính của bạn.
            </p>
            <Button onClick={() => navigate("/")} className="mt-6">
              Mở ứng dụng
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
      <div className="max-w-md mx-auto pt-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Quay lại
        </button>

        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
            <img
              src="/pwa-192x192.png"
              alt="App Icon"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Cài đặt ứng dụng
          </h1>
          <p className="text-muted-foreground">
            Thêm Hoạt Động Trẻ Em vào màn hình chính để truy cập nhanh hơn
          </p>
        </div>

        {/* Benefits */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Lợi ích khi cài đặt
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Truy cập nhanh từ màn hình chính
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Sử dụng như ứng dụng thật
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Hoạt động offline
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Tải nhanh, mượt mà
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Install Button (for supported browsers) */}
        {deferredPrompt && (
          <Button
            onClick={handleInstall}
            className="w-full mb-6"
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Cài đặt ngay
          </Button>
        )}

        {/* iOS Instructions */}
        {isIOS && !deferredPrompt && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 text-primary">
                Hướng dẫn cho iPhone/iPad
              </h3>
              <ol className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Nhấn nút Chia sẻ</p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      Tìm biểu tượng <Share className="w-4 h-4" /> ở thanh dưới cùng
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Cuộn xuống và chọn</p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      "Thêm vào MH chính" <Plus className="w-4 h-4" />
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Nhấn "Thêm"</p>
                    <p className="text-muted-foreground">Xác nhận để hoàn tất cài đặt</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Android Instructions */}
        {isAndroid && !deferredPrompt && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 text-primary">
                Hướng dẫn cho Android
              </h3>
              <ol className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Nhấn menu trình duyệt</p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      Tìm biểu tượng <MoreVertical className="w-4 h-4" /> góc trên bên phải
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Chọn "Cài đặt ứng dụng"</p>
                    <p className="text-muted-foreground">
                      Hoặc "Thêm vào màn hình chính"
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Nhấn "Cài đặt"</p>
                    <p className="text-muted-foreground">Xác nhận để hoàn tất</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Desktop/Generic Instructions */}
        {!isIOS && !isAndroid && !deferredPrompt && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 text-primary">
                Hướng dẫn cài đặt
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Mở trang này trên điện thoại để cài đặt ứng dụng, hoặc tìm biểu tượng cài đặt trên thanh địa chỉ của trình duyệt.
              </p>
              <p className="text-sm text-muted-foreground">
                URL: <span className="font-mono text-primary">app-hoat-dong.lovable.app</span>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Install;
