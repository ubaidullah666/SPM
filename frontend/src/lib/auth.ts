import Cookies from 'js-cookie';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'volunteer' | 'ngo' | 'admin';
  skills?: string[];
  impactScore?: number;
  totalHours?: number;
  organizationName?: string;
  avatar?: string;
}

export function getUser(): User | null {
  try {
    const userStr = Cookies.get('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: User): void {
  Cookies.set('token', token, { expires: 7 });
  Cookies.set('user', JSON.stringify(user), { expires: 7 });
}

export function clearAuth(): void {
  Cookies.remove('token');
  Cookies.remove('user');
}

export function isAuthenticated(): boolean {
  return !!Cookies.get('token');
}
