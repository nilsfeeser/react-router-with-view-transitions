declare global {
  interface Console {
    demo: (feature: string, message: string, ...args: any[]) => void;
  }
}

const colorPerFeatureScheme: Record<string, { feature: string; message: string }> = {
  "Deeplink-History-Stack": {
    feature: "color: #ff00ff",
    message: "color: #ff00ff; font-weight: bold",
  },
};

window.console.demo = function (feature: keyof typeof colorPerFeatureScheme, message: string, ...args: any[]) {
  const colorScheme = colorPerFeatureScheme[feature];
  console.log(`%c[Feature ${feature}] %c${message}`, colorScheme.feature, colorScheme.message, ...args);
};

export default window.console;
