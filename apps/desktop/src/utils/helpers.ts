import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy') {
  return format(new Date(date), fmt, { locale: es });
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileIcon(extension: string): string {
  const icons: Record<string, string> = {
    pdf: '📄', docx: '📝', doc: '📝', xlsx: '📊', xls: '📊',
    pptx: '📊', ppt: '📊', txt: '📄',
    png: '🖼️', jpg: '🖼️', jpeg: '🖼️', svg: '🖼️', webp: '🖼️',
    stl: '🧊', obj: '🧊', glb: '🧊', gltf: '🧊', step: '⚙️', stp: '⚙️',
    dwg: '📐', dxf: '📐',
    zip: '🗜️', rar: '🗜️', '7z': '🗜️',
    mp4: '🎬', mov: '🎬', avi: '🎬', mp3: '🎵', wav: '🎵',
  };
  return icons[extension.toLowerCase()] || '📁';
}

export function is3DFile(extension: string): boolean {
  return ['stl', 'obj', 'glb', 'gltf'].includes(extension.toLowerCase());
}

export function isImageFile(extension: string): boolean {
  return ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(extension.toLowerCase());
}

export function isPdfFile(extension: string): boolean {
  return extension.toLowerCase() === 'pdf';
}

export function parseTags(tags?: string | null): string[] {
  if (!tags) return [];
  try { return JSON.parse(tags); } catch { return []; }
}

export function dueDateStatus(date?: string | null): 'overdue' | 'today' | 'tomorrow' | 'upcoming' | null {
  if (!date) return null;
  const d = new Date(date);
  if (isPast(d) && !isToday(d)) return 'overdue';
  if (isToday(d)) return 'today';
  if (isTomorrow(d)) return 'tomorrow';
  return 'upcoming';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function getProjectProgress(tasks: Array<{ status: string }>): number {
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => t.status === 'COMPLETED').length;
  return Math.round((done / tasks.length) * 100);
}
