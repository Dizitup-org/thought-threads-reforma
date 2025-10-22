import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Add global enhancements
document.addEventListener('DOMContentLoaded', () => {
  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Add loading class to body for initial animations
  document.body.classList.add('loading');
  setTimeout(() => {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
  }, 100);
});

createRoot(document.getElementById("root")!).render(<App />);