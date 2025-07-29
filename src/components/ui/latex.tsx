import React from "react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface LatexProps {
  children: string;
  display?: boolean;
  className?: string;
}

// Helper function to parse mixed LaTeX and regular text
const parseLatexText = (
  text: string
): (string | { type: "latex"; content: string })[] => {
  if (!text) return [];

  const result: (string | { type: "latex"; content: string })[] = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    const dollarIndex = text.indexOf("$", currentIndex);

    if (dollarIndex === -1) {
      // No more LaTeX, add remaining text
      if (currentIndex < text.length) {
        result.push(text.slice(currentIndex));
      }
      break;
    }

    // Add text before LaTeX
    if (dollarIndex > currentIndex) {
      result.push(text.slice(currentIndex, dollarIndex));
    }

    // Find the closing dollar sign
    const closingDollarIndex = text.indexOf("$", dollarIndex + 1);

    if (closingDollarIndex === -1) {
      // No closing dollar, treat as regular text
      result.push(text.slice(currentIndex));
      break;
    }

    // Extract LaTeX content (without the dollar signs)
    const latexContent = text.slice(dollarIndex + 1, closingDollarIndex);
    result.push({ type: "latex", content: latexContent });

    currentIndex = closingDollarIndex + 1;
  }

  return result;
};

export const Latex: React.FC<LatexProps> = ({
  children,
  display = false,
  className = "",
}) => {
  if (!children) return null;

  // Parse the text to separate LaTeX and regular text
  const parsedContent = parseLatexText(children);

  if (parsedContent.length === 0) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span className={className}>
      {parsedContent.map((part, index) => {
        if (typeof part === "string") {
          return <span key={index}>{part}</span>;
        } else {
          try {
            if (display) {
              return <BlockMath key={index} math={part.content} />;
            } else {
              return <InlineMath key={index} math={part.content} />;
            }
          } catch (error) {
            console.warn("LaTeX parsing failed:", error);
            return <span key={index}>{`$${part.content}$`}</span>;
          }
        }
      })}
    </span>
  );
};

export default Latex;
