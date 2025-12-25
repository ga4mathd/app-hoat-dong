export function ExpertSection() {
  return (
    <div 
      className="bg-yellow-light rounded-2xl p-5 animate-fade-in"
      style={{ animationDelay: '0.5s' }}
    >
      <h3 className="font-bold text-xl text-foreground mb-2">Giới thiệu chung</h3>
      
      <p className="text-foreground text-sm leading-relaxed">
        Hoạt động được gợi ý bởi Tiến sĩ giáo dục: <span className="font-semibold">Phan Hồ Điệp</span>
      </p>
      
      <p className="text-muted-foreground text-sm mt-1">
        Chuyên gia trong lĩnh vực nghiên cứu và phát triển các trò chơi cho trẻ em.
      </p>
    </div>
  );
}
