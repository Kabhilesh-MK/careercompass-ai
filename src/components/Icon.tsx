import {
  LayoutDashboard, User, ClipboardList, FileText, Compass, GitBranch,
  Map, FolderGit2, Award, Target, Bot, BarChart3, Settings, LogOut,
  Menu, ChevronLeft, Search, Bell, Moon, Sun, FileUp, ChevronDown,
  Code2, Globe, Database, BrainCircuit, Cloud, Users, BookOpen, Sparkles,
  ClipboardCheck, MessageSquare, TrendingUp, Clock, CheckCircle2, Circle,
  AlertCircle, XCircle, Info, X, ArrowRight, ArrowUpRight, Star, Zap,
  GraduationCap, Briefcase, Trophy, Flame, Eye, Download, Filter,
  Plus, MoreHorizontal, Send, Paperclip, Mic, Calendar, Phone, Mail,
  MapPin, Github, Linkedin, Globe2, Lock, Shield, BellRing, Palette,
  UserCog, Activity, Server, Cpu, HardDrive, Wifi, CheckCircle, Loader2,
  ChevronRight, AlertTriangle, FileBarChart, FileCheck, RefreshCw, Pencil,
  // Phase 4 additions
  Heart, PieChart, Brain, Hammer, Code, Layers, CheckCheck, Trash2,
  BarChart2, Upload, PlayCircle, ExternalLink, Share2, Printer, GitCompare,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, User, ClipboardList, FileText, Compass, GitBranch,
  Map, FolderGit2, Award, Target, Bot, BarChart3, Settings, LogOut,
  Menu, ChevronLeft, Search, Bell, Moon, Sun, FileUp, ChevronDown,
  Code2, Globe, Database, BrainCircuit, Cloud, Users, BookOpen, Sparkles,
  ClipboardCheck, MessageSquare, TrendingUp, Clock, CheckCircle2, Circle,
  AlertCircle, XCircle, Info, X, ArrowRight, ArrowUpRight, Star, Zap,
  GraduationCap, Briefcase, Trophy, Flame, Eye, Download, Filter,
  Plus, MoreHorizontal, Send, Paperclip, Mic, Calendar, Phone, Mail,
  MapPin, Github, Linkedin, Globe2, Lock, Shield, BellRing, Palette,
  UserCog, Activity, Server, Cpu, HardDrive, Wifi, CheckCircle, Loader2,
  ChevronRight, AlertTriangle, FileBarChart, FileCheck, RefreshCw, Pencil,
  // Phase 4
  Heart, PieChart, Brain, Hammer, Code, Layers, CheckCheck, Trash2,
  BarChart2, Upload, PlayCircle, ExternalLink, Share2, Printer, GitCompare,
};

export function Icon({ name, className, size }: { name: string; className?: string; size?: number }) {
  const Cmp = iconMap[name] ?? Circle;
  return <Cmp className={className} size={size} />;
}
