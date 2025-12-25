export function ExpertSection() {
  return (
    <div 
      className="bg-yellow-light rounded-2xl p-5 card-shadow animate-fade-in"
      style={{ animationDelay: '0.5s' }}
    >
      <h3 className="font-bold text-lg text-foreground mb-3">Giới thiệu chung</h3>
      
      <p className="text-foreground mb-2">
        Hoạt động được gợi ý bởi Tiến sĩ giáo dục: <span className="font-semibold">Phan Hồ Điệp</span>
      </p>
      
      <p className="text-muted-foreground text-sm">
        Chuyên gia trong lĩnh vực nghiên cứu và phát triển các trò chơi cho trẻ em.
      </p>
    </div>
  );
}
