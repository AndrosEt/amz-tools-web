const generateRandomColor = () => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, 0.6)`;
};

export const getChartColors = (chartType, keys) => {
  const storageKey = `chart-colors-${chartType}`;
  let colorMap = {};
  
  // Try to get existing colors from localStorage
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      colorMap = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading chart colors from localStorage:', e);
  }

  // Generate and store colors for any new keys
  const updatedColorMap = { ...colorMap };
  keys.forEach(key => {
    if (!updatedColorMap[key]) {
      updatedColorMap[key] = generateRandomColor();
    }
  });

  // Save updated colors to localStorage
  if (Object.keys(updatedColorMap).length > Object.keys(colorMap).length) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedColorMap));
    } catch (e) {
      console.error('Error saving chart colors to localStorage:', e);
    }
  }

  return updatedColorMap;
}; 