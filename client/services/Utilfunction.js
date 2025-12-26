
export const formatFollowers = (num) => {
    if (num >= 10000000) {
      return (num / 10000000).toFixed(1).replace(/\.0$/, '') + 'Cr'; // Crore (10M)
    }
    if (num >= 100000) {
      return (num / 100000).toFixed(1).replace(/\.0$/, '') + 'L'; // Lakh (100K)
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'; // Thousand (1K)
    }
    return num; // If less than 1000, return as is
  };

export const convertToLocaleTime=(datetimeString)=> {
    const datetime = new Date(datetimeString);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000); // Date object for yesterday
  
    if (datetime < yesterday) {
        if((Date.now() - datetime) > 24 * 60 * 60 * 1000) return datetime.toLocaleDateString();
        return 'yesterday';
    } else {
        return datetime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true});
    }
}