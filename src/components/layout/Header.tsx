import React, { useState } from 'react';
import { ChevronDown, PlayCircle, LogIn, ShieldCheck } from 'lucide-react';
import type { NavItem } from '../../types/landing';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  channels: NavItem[];
}

export const Header: React.FC<HeaderProps> = ({ channels }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { currentUser, authLoading, setIsAuthModalOpen, setIsAdminDashboardOpen, comments } = useApp();

  const pendingCommentsCount = comments.filter((c) => c.status === 'pending').length;

  return (
    <header className="sticky top-0 z-40 bg-[#031a48]/90 backdrop-blur-md border-b border-white/10 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06aef6] to-[#002976] flex items-center justify-center shadow-md shadow-[#06aef6]/30 group-hover:scale-105 transition-transform">
                <PlayCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-impact text-2xl tracking-wider text-white">YTB<span className="text-[#fabb15]">MAKEMONEY</span></span>
                <span className="text-[10px] text-blue-200 tracking-widest uppercase font-semibold">Học Làm Video Thực Chiến</span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links & Dropdown */}
          <nav className="hidden md:flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onMouseEnter={() => setDropdownOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all border border-white/15 cursor-pointer"
              >
                <span>Xem danh mục</span>
                <ChevronDown className={`w-4 h-4 text-[#fabb15] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  onMouseLeave={() => setDropdownOpen(false)}
                  className="absolute left-0 mt-2 w-56 bg-[#001848] rounded-2xl shadow-2xl border border-white/15 py-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  {channels.map((channel) => (
                    <a
                      key={channel.id}
                      href={channel.href}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#fabb15]" />
                      <span className="font-medium">{channel.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Quick section links */}
            <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
              <a href="#module" className="hover:text-[#06aef6] transition-colors">Nội Dung</a>
              <a href="#loiich" className="hover:text-[#06aef6] transition-colors">Lợi Ích</a>
              <a href="#quyenloi" className="hover:text-[#06aef6] transition-colors">Quyền Lợi</a>
              <a href="#la_ai" className="hover:text-[#06aef6] transition-colors">Tác Giả</a>
              <a href="#faq" className="hover:text-[#06aef6] transition-colors">FAQs</a>
            </div>
          </nav>

          {/* User Controls & Admin Dashboard triggers */}
          <div className="flex items-center gap-3">
            
            {/* Admin Dashboard Button */}
            {!authLoading && currentUser?.role === 'admin' && (
              <button
                onClick={() => setIsAdminDashboardOpen(true)}
                className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold text-[#001848] bg-[#fabb15] hover:bg-amber-400 border border-amber-300 shadow-md transition-all hover:scale-105"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Panel</span>
                {pendingCommentsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-600 text-white rounded-full font-bold">
                    {pendingCommentsCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile / Login trigger */}
            {authLoading ? (
              <span className="text-xs text-blue-200">Đang kiểm tra phiên…</span>
            ) : currentUser ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#fabb15]"
                />
                <span className="text-xs font-bold text-white max-w-[100px] truncate hidden sm:inline">
                  {currentUser.name}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white hover:text-[#fabb15] bg-white/10 hover:bg-white/20 border border-white/15 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
