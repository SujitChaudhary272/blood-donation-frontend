import React, { useMemo, useState } from 'react';

const buildAvatarCandidates = (photoUrl, size) => {
  if (!photoUrl || typeof photoUrl !== 'string') {
    return [];
  }

  const normalized = photoUrl.trim();
  if (!normalized) {
    return [];
  }

  const candidates = [normalized];

  if (normalized.includes('googleusercontent.com')) {
    if (/=s\d+-c$/.test(normalized)) {
      candidates.push(normalized.replace(/=s\d+-c$/, `=s${size * 2}-c`));
    } else if (!/[?&]sz=\d+/.test(normalized)) {
      candidates.push(`${normalized}${normalized.includes('?') ? '&' : '?'}sz=${size * 2}`);
    }
  }

  return [...new Set(candidates)];
};

const UserAvatar = ({
  user,
  size = 64,
  className = '',
  imageClassName = '',
  fallbackClassName = ''
}) => {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const photoUrl = user?.profilePhoto || user?.picture || user?.photoURL || '';
  const candidates = useMemo(() => buildAvatarCandidates(photoUrl, size), [photoUrl, size]);
  const activeSrc = candidates[candidateIndex] || '';
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U';

  const handleError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setCandidateIndex(candidates.length);
    }
  };

  if (activeSrc) {
    return (
      <img
        src={activeSrc}
        alt={user?.name || 'User'}
        className={imageClassName || className}
        onError={handleError}
        referrerPolicy="no-referrer"
      />
    );
  }

  return <span className={fallbackClassName || className}>{initial}</span>;
};

export default UserAvatar;
