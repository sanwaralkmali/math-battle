import React from "react";

const Footer = () => (
  <footer className="w-full py-2 sm:py-3 text-center text-xs sm:text-sm text-muted-foreground border-t bg-background/80 backdrop-blur-sm font-cairo">
    <div className="container mx-auto px-2">
      <p>
        Educational Game 2025 | Created for Educational purposes By{" "}
        <a
          href="https://sanwaralkmali.github.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-semibold"
        >
          Salah Alkmali
        </a>
      </p>
    </div>
  </footer>
);

export default Footer;
