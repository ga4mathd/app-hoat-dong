import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Music, BookOpen, Play, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BottomNav } from '@/components/layout/BottomNav';

interface StoryMusic {
  id: string;
  title: string;
  type: string;
  description: string | null;
  content_url: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
}

export default function StoriesMusic() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [items, setItems] = useState<StoryMusic[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    supabase
      .from('stories_music')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data);
      });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const stories = items.filter(item => item.type === 'story');
  const music = items.filter(item => item.type === 'music');

  const renderItem = (item: StoryMusic, index: number) => (
    <div
      key={item.id}
      className="bg-card rounded-2xl p-4 card-shadow animate-fade-in flex items-center gap-4"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
        item.type === 'story' ? 'bg-blue-light' : 'bg-pink-light'
      }`}>
        {item.type === 'story' ? (
          <BookOpen className="h-8 w-8 text-blue" />
        ) : (
          <Music className="h-8 w-8 text-pink" />
        )}
      </div>
      
      <div className="flex-1">
        <h3 className="font-bold text-foreground">{item.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
        {item.duration_minutes && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{item.duration_minutes} phút</span>
          </div>
        )}
      </div>
      
      <button className={`p-3 rounded-full ${
        item.type === 'story' ? 'bg-blue text-white' : 'bg-pink text-white'
      }`}>
        <Play className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 p-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg">Truyện & Nhạc</h1>
        </div>

        <div className="p-4">
          <Tabs defaultValue="stories" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="stories" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Truyện ({stories.length})
              </TabsTrigger>
              <TabsTrigger value="music" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Nhạc ({music.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stories" className="space-y-4">
              {stories.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Chưa có truyện nào</p>
                </div>
              ) : (
                stories.map((item, index) => renderItem(item, index))
              )}
            </TabsContent>
            
            <TabsContent value="music" className="space-y-4">
              {music.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Chưa có nhạc nào</p>
                </div>
              ) : (
                music.map((item, index) => renderItem(item, index))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
