export const lastSeenOn = (startTime: number) => {
  const diffTimestamp: number = Math.floor((Date.now() - startTime) / 1000);

  if (diffTimestamp < 60) {
    return `${diffTimestamp} seconds`;
  } else if (diffTimestamp < 3600 * 2) {
    return `${Math.floor(diffTimestamp / 60)} minutes`;
  } else if (diffTimestamp < 86400 * 2) {
    return `${Math.floor(diffTimestamp / 3600).toFixed(2)} hours`;
  } else {
    return `${Math.floor(diffTimestamp / 86400).toFixed(2)} days`;
  }
};
