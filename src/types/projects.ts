export type Project = {
  _id: string;
  _createdAt: Date;
  date_range: string;
  gif_image: string;
  normal_image: Object;
  name: string;
  short_description: string;
  slug: string;
  statistic: Statistic;
  tagline: string;
  url: string;
  color: string;
  pastel_color: string;
};

type Statistic = {
  number: string;
  description: string;
};
