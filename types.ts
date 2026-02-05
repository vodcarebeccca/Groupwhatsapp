export interface GroupInfo {
  name: string;
  subtext: string;
  image: string;
  memberCount: number;
}

export interface LoginProvider {
  id: 'facebook' | 'google';
  name: string;
}
