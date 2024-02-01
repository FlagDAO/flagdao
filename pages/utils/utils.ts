export const  getTimeDifference = (time: string) => {
  const now = new Date();
  const past = new Date(time);
  const diffInMilliSeconds = Math.abs(now.getTime() - past.getTime());
  
  const minutes = Math.ceil(diffInMilliSeconds / (1000 * 60));
  const hours = Math.ceil(diffInMilliSeconds / (1000 * 60 * 60));
  const days = Math.ceil(diffInMilliSeconds / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) {
    return `Last updated ${minutes} mins ago`;
  } else if (hours < 12) {
    return `Last updated ${hours} hours ago`;
  } else {
    return `Last updated ${days} days ago`;
  }
}

