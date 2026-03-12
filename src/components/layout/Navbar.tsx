@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --navy: #0A2342;
  --coral: #E8431A;
  --orange: #E8431A;
  --sand: #F7F6F2;
  --teal: #00897B;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: #F7F6F2;
  color: #1a1a1a;
  font-family: var(--font-dm-sans), system-ui, sans-serif;
  min-height: 100vh;
}

/* Ensure fonts load */
.font-ethiopic {
  font-family: var(--font-noto-ethiopic), serif;
}
