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
    <div className="fixed bottom-[90px] left-0 right-0 z-40 flex justify-center px-4 pb-2">
      <div 
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/95 backdrop-blur-md border-2 border-primary/20 shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
        onClick={handleClick}
      >
        <HelpCircle className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          📚 Hướng dẫn sử dụng app
        </span>
        <button 
          onClick={handleDismiss}
          className="ml-1 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Đóng"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};
