export const lastSeenOn = (startTime: number): string => {
  if (!startTime) {
    return 'never';
  }

  const diffTimestamp: number = Math.floor(Date.now() / 1000 - startTime);

  if (diffTimestamp < 60) {
    return `${diffTimestamp} seconds ago`;
  } else if (diffTimestamp < 3600 * 2) {
    return `${Math.floor(diffTimestamp / 60)} minutes ago`;
  } else if (diffTimestamp < 86400 * 2) {
    return `${Math.floor(diffTimestamp / 3600).toFixed(2)} hours ago`;
  } else {
    return `${Math.floor(diffTimestamp / 86400).toFixed(2)} days ago`;
  }
};
