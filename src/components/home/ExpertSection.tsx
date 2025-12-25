import { Award, BookOpen, Users } from 'lucide-react';

export function ExpertSection() {
  return (
    <div 
      className="bg-card rounded-2xl p-6 card-shadow animate-fade-in"
      style={{ animationDelay: '0.5s' }}
    >
      <h3 className="font-bold text-lg text-foreground mb-4">Giới thiệu chung</h3>
      
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
          J
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Chuyên gia Jenna</h4>
          <p className="text-sm text-muted-foreground">Chuyên gia Tâm lý Giáo dục</p>
          <p className="text-sm text-muted-foreground mt-1">10+ năm kinh nghiệm nuôi dạy trẻ</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="flex flex-col items-center p-3 rounded-xl bg-muted">
          <Award className="h-5 w-5 text-primary mb-1" />
          <span className="text-xs text-muted-foreground">Chứng chỉ</span>
          <span className="font-semibold text-foreground">12+</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl bg-muted">
          <BookOpen className="h-5 w-5 text-secondary mb-1" />
          <span className="text-xs text-muted-foreground">Khóa học</span>
          <span className="font-semibold text-foreground">50+</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl bg-muted">
          <Users className="h-5 w-5 text-accent-foreground mb-1" />
          <span className="text-xs text-muted-foreground">Học viên</span>
          <span className="font-semibold text-foreground">5000+</span>
        </div>
      </div>
    </div>
  );
}
