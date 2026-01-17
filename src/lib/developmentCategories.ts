// Development categories mapping from activity tags

export interface DevelopmentCategory {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  tags: string[];
}

export const developmentCategories: DevelopmentCategory[] = [
  {
    id: 'cognitive',
    name: 'Tư duy & Nhận thức',
    shortName: 'Tư duy',
    icon: '🧠',
    color: 'hsl(210, 85%, 55%)',
    tags: ['Tư duy', 'Nhận thức', 'Câu đố'],
  },
  {
    id: 'language',
    name: 'Ngôn ngữ & Giao tiếp',
    shortName: 'Ngôn ngữ',
    icon: '💬',
    color: 'hsl(280, 70%, 55%)',
    tags: ['Giao tiếp', 'Ngôn ngữ', 'Câu chuyện'],
  },
  {
    id: 'emotional',
    name: 'Cảm xúc & Xã hội',
    shortName: 'Cảm xúc',
    icon: '❤️',
    color: 'hsl(340, 70%, 65%)',
    tags: ['Cảm xúc', 'Phản tư'],
  },
  {
    id: 'family',
    name: 'Gia đình & Tự lập',
    shortName: 'Gia đình',
    icon: '👨‍👩‍👧',
    color: 'hsl(25, 90%, 55%)',
    tags: ['Gia đình', 'Tự lập'],
  },
  {
    id: 'science',
    name: 'Khoa học & Khám phá',
    shortName: 'Khoa học',
    icon: '🔬',
    color: 'hsl(145, 60%, 45%)',
    tags: ['Khoa học'],
  },
  {
    id: 'learning',
    name: 'Học tập',
    shortName: 'Học tập',
    icon: '📚',
    color: 'hsl(45, 90%, 50%)',
    tags: ['Học tập'],
  },
];

// Map a tag to its category
export function getCategoryForTag(tag: string): DevelopmentCategory | undefined {
  return developmentCategories.find(cat => 
    cat.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

// Calculate development data from completed activities
export interface DevelopmentData {
  category: string;
  categoryId: string;
  shortName: string;
  value: number;
  fullMark: number;
  icon: string;
  color: string;
}

export function calculateDevelopmentData(
  completedTags: string[],
  maxValue?: number
): DevelopmentData[] {
  // Count tags per category
  const categoryCounts: Record<string, number> = {};
  
  developmentCategories.forEach(cat => {
    categoryCounts[cat.id] = 0;
  });

  completedTags.forEach(tag => {
    const category = getCategoryForTag(tag);
    if (category) {
      categoryCounts[category.id]++;
    }
  });

  // Find max value for normalization
  const maxCount = maxValue || Math.max(...Object.values(categoryCounts), 1);

  return developmentCategories.map(cat => ({
    category: cat.name,
    categoryId: cat.id,
    shortName: cat.shortName,
    value: categoryCounts[cat.id],
    fullMark: maxCount,
    icon: cat.icon,
    color: cat.color,
  }));
}

// Get suggestion based on weakest category
export function getDevelopmentSuggestion(data: DevelopmentData[]): {
  weakest: DevelopmentData | null;
  strongest: DevelopmentData | null;
  message: string;
} {
  if (data.every(d => d.value === 0)) {
    return {
      weakest: null,
      strongest: null,
      message: 'Hãy bắt đầu thực hiện các hoạt động để theo dõi sự phát triển của con nhé!',
    };
  }

  const sorted = [...data].sort((a, b) => a.value - b.value);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  if (weakest.value === strongest.value) {
    return {
      weakest,
      strongest,
      message: `Tuyệt vời! Con đang phát triển rất đồng đều ở tất cả các lĩnh vực. Hãy tiếp tục duy trì nhé!`,
    };
  }

  return {
    weakest,
    strongest,
    message: `Con đang phát triển tốt về ${strongest.icon} ${strongest.category}. Hãy tập trung thêm vào ${weakest.icon} ${weakest.category} trong thời gian tới để phát triển đồng đều hơn nhé!`,
  };
}
