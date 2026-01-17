import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, X } from 'lucide-react';

const STORAGE_KEY = 'hideAppGuide';

export const AppGuideHint = () => {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(true); // Start hidden to avoid flash

  useEffect(() => {
    const isHidden = localStorage.getItem(STORAGE_KEY) === 'true';
    setHidden(isHidden);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem(STORAGE_KEY, 'true');
    setHidden(true);
  };

  const handleClick = () => {
    navigate('/guide');
  };

  if (hidden) return null;

  return (
    <div className="fixed bottom-[70px] left-0 right-0 z-40 flex justify-center px-4 pb-2">
      <div 
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 backdrop-blur-sm border border-border/30 cursor-pointer hover:bg-muted/80 transition-colors"
        onClick={handleClick}
      >
        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="text-xs text-muted-foreground/60">
          Hướng dẫn sử dụng app hiệu quả
        </span>
        <button 
          onClick={handleDismiss}
          className="ml-1 p-0.5 rounded-full hover:bg-background/50 transition-colors"
          aria-label="Đóng"
        >
          <X className="h-3 w-3 text-muted-foreground/50" />
        </button>
      </div>
    </div>
  );
};
