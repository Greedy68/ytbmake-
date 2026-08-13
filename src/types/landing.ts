export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  color?: string;
}

export interface HeroFeature {
  id: string;
  title: string;
}

export interface TargetAudienceItem {
  id: string;
  text: string;
}

export interface BenefitCardItem {
  id: number;
  title: string;
  imageUrl: string;
  badge?: string;
}

export interface CurriculumPoint {
  id: number;
  text: string;
}

export interface LessonItem {
  id: string;
  title: string;
  duration: string; // e.g. "28:01"
  thumbnailUrl: string;
  tag?: string;
}

export interface CourseModule {
  id: string;
  moduleNumber: string; // e.g. "01", "02", "03", "04"
  title: string;
  lessonCount: number;
  totalDuration: string; // e.g. "01:52:08"
  lessons: LessonItem[];
}

export interface PrivilegeItem {
  number: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface AuthorAchievement {
  id: number;
  text: string;
}

export interface LandingData {
  meta: {
    title: string;
    description: string;
  };
  navigation: {
    channels: NavItem[];
  };
  hero: {
    badgeText: string;
    badgeSubtitle: string;
    subHeader: string;
    mainTitle: string;
    boxHeader: string;
    features: HeroFeature[];
    audienceHeader: string;
    audienceList: TargetAudienceItem[];
    highlightBanner: string;
    authorCard: {
      label: string;
      name: string;
      tagline: string;
      achievements: AuthorAchievement[];
      avatarUrl: string;
    };
  };
  registration: {
    title: string;
    subtitle: string;
    summaryText: string;
    valueProps: Array<{ icon: string; title: string; subtitle: string }>;
    launchNote: string;
  };
  marquee: string[];
  courseModules: {
    sectionId: string;
    titleMain: string;
    badgeText: string;
    subtitle: string;
    modules: CourseModule[];
  };
  curriculum: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    pointsHeader: string;
    points: CurriculumPoint[];
    imageUrl: string;
  };
  benefits: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    cards: BenefitCardItem[];
  };
  privileges: {
    badge: string;
    titleImage: string;
    items: PrivilegeItem[];
  };
  author: {
    sectionId: string;
    name: string;
    nickname: string;
    bio: string;
    stats: Array<{ label: string; value: string }>;
    achievements: string[];
  };
  faqs: {
    sectionId: string;
    title: string;
    subtitle: string;
    items: FaqItem[];
  };
}
