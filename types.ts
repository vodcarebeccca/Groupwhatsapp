export interface GroupInfo {
  name: string;
  subtext: string;
  image: string;
  memberCount: number;
  groupLink: string;
}

export interface LoginProvider {
  id: 'facebook' | 'google';
  name: string;
}