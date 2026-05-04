'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// Simple in-memory cache to prevent multiple fetches of the same avatar
let avatarCache: Record<string, string> = {};

interface UserAvatarProps {
  className?: string;
  size?: number;
}

export default function UserAvatar({ className, size = 36 }: UserAvatarProps) {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const [avatar, setAvatar] = useState<string | null>(userId ? avatarCache[userId] : null);

  useEffect(() => {
    if (!userId) return;
    
    // If already in cache, use it
    if (avatarCache[userId]) {
      setAvatar(avatarCache[userId]);
      return;
    }

    // Fetch from API
    const fetchAvatar = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.avatar) {
            avatarCache[userId] = data.avatar;
            setAvatar(data.avatar);
          }
        }
      } catch (err) {
        console.error('Failed to fetch avatar:', err);
      }
    };

    fetchAvatar();
  }, [userId]);

  const initial = (session?.user?.name || 'U')[0].toUpperCase();

  if (avatar) {
    return (
      <div className={`overflow-hidden rounded-full ${className}`} style={{ width: size, height: size }}>
        <Image 
          src={avatar} 
          alt="Profile" 
          width={size} 
          height={size} 
          className="object-cover w-full h-full" 
        />
      </div>
    );
  }

  return (
    <div 
      className={`rounded-full flex items-center justify-center text-white font-extrabold ${className}`}
      style={{ 
        width: size, 
        height: size, 
        fontSize: size * 0.4,
        background: 'var(--primary)', 
        boxShadow: '0 2px 12px var(--primary-glow)' 
      }}
    >
      {initial}
    </div>
  );
}
