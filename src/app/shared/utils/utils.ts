/* eslint-disable @typescript-eslint/naming-convention */
export const URLToBase64 = (url, callback) => {
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result);
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
};


export const generateSchoolYear = (startYear: number = 1950, pair = false) => {
  const currentYear = new Date().getFullYear(); const years = [];
  startYear = startYear || 1980;
  while ( startYear <= currentYear ) {
      startYear++;
      if(pair) {
        const year1 = (startYear) - 1;
        const year2 = startYear;
        years.push(`${year1}-${year2}`);
      } else {
        years.push(startYear);
      }
  }
  return years.reverse();
};
