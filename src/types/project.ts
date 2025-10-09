export interface Project {
  id: number;
  title: string;
  shortDescription: string;
  description: string;
  techStack: string[];
  githubLink?: string;
  chromeExtensionId?: string;
  firefoxExtensionId?: string;
}
