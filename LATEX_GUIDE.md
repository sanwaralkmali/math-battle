# LaTeX Math Guide for MathBattle

This guide explains how to use LaTeX math expressions in your MathBattle questions and answers.

## 🎯 Quick Start

Your questions and answers now support LaTeX math expressions! Simply wrap your math in `$` symbols:

```json
{
  "question": "What is $3 + 5$?",
  "choices": ["$7$", "$8$", "$9$", "$10$"],
  "answer": "$8$"
}
```

## 📚 Common LaTeX Math Expressions

### Basic Operations

- Addition: `$3 + 5$` → $3 + 5$
- Subtraction: `$10 - 4$` → $10 - 4$
- Multiplication: `$3 \times 4$` → $3 \times 4$
- Division: `$12 \div 3$` → $12 \div 3$

### Fractions

- Simple fraction: `$\frac{3}{4}$` → $\frac{3}{4}$
- Mixed fraction: `$2\frac{1}{3}$` → $2\frac{1}{3}$
- Complex fraction: `$\frac{x+1}{x-1}$` → $\frac{x+1}{x-1}$

### Exponents and Subscripts

- Exponents: `$x^2$` → $x^2$
- Subscripts: `$x_1$` → $x_1$
- Both: `$x_1^2$` → $x_1^2$

### Square Roots and Radicals

- Square root: `$\sqrt{16}$` → $\sqrt{16}$
- Cube root: `$\sqrt[3]{27}$` → $\sqrt[3]{27}$
- Nth root: `$\sqrt[n]{x}$` → $\sqrt[n]{x}$

### Greek Letters

- Alpha: `$\alpha$` → $\alpha$
- Beta: `$\beta$` → $\beta$
- Pi: `$\pi$` → $\pi$
- Theta: `$\theta$` → $\theta$

### Common Math Symbols

- Infinity: `$\infty$` → $\infty$
- Plus-minus: `$\pm$` → $\pm$
- Approximately: `$\approx$` → $\approx$
- Not equal: `$\neq$` → $\neq$
- Less than or equal: `$\leq$` → $\leq$
- Greater than or equal: `$\geq$` → $\geq$

### Equations and Variables

- Linear equation: `$2x + 3 = 7$` → $2x + 3 = 7$
- Quadratic: `$x^2 + 2x + 1 = 0$` → $x^2 + 2x + 1 = 0$
- Function: `$f(x) = x^2$` → $f(x) = x^2$

### Logarithms

- Natural log: `$\ln(x)$` → $\ln(x)$
- Log base 2: `$\log_2(x)$` → $\log_2(x)$
- Log base 10: `$\log_{10}(x)$` → $\log_{10}(x)$

### Trigonometry

- Sine: `$\sin(x)$` → $\sin(x)$
- Cosine: `$\cos(x)$` → $\cos(x)$
- Tangent: `$\tan(x)$` → $\tan(x)$

### Calculus

- Derivative: `$\frac{d}{dx}f(x)$` → $\frac{d}{dx}f(x)$
- Integral: `$\int_0^1 x^2 dx$` → $\int_0^1 x^2 dx$
- Limit: `$\lim_{x \to 0} \frac{\sin x}{x}$` → $\lim_{x \to 0} \frac{\sin x}{x}$

## 📝 Question Format Examples

### Basic Arithmetic

```json
{
  "question": "What is $15 + 27$?",
  "choices": ["$40$", "$41$", "$42$", "$43$"],
  "answer": "$42$"
}
```

### Fractions

```json
{
  "question": "What is $\frac{3}{4} + \frac{1}{2}$?",
  "choices": [
    "$\frac{5}{4}$",
    "$\frac{4}{6}$",
    "$\frac{1}{4}$",
    "$\frac{7}{4}$"
  ],
  "answer": "$\frac{5}{4}$"
}
```

### Algebra

```json
{
  "question": "Solve for x: $2x + 5 = 13$",
  "choices": ["$x = 4$", "$x = 3$", "$x = 5$", "$x = 6$"],
  "answer": "$x = 4$"
}
```

### Geometry

```json
{
  "question": "What is the area of a circle with radius $r = 3$?",
  "choices": ["$9pi$", "$6pi$", "$3pi$", "$27pi$"],
  "answer": "$9pi$"
}
```

## ⚠️ Important Notes

1. **Always wrap math expressions in `$` symbols**
2. **Escape backslashes in JSON**: Use `\\` instead of `\` for LaTeX commands
3. **Fallback support**: If LaTeX fails to parse, it will display as plain text
4. **Mixed content**: You can mix regular text with LaTeX: `"The answer is $x = 5$"`

## 🔧 Troubleshooting

### Common Issues

1. **JSON escaping**: Remember to escape backslashes

   - ❌ `"$\frac{1}{2}$"`
   - ✅ `"$\\frac{1}{2}$"`

2. **Invalid LaTeX**: The system will fallback to plain text

   - Input: `"$invalid latex$"`
   - Output: `invalid latex`

3. **Missing delimiters**: Math won't render without `$` symbols
   - ❌ `"frac{1}{2}"`
   - ✅ `"$\\frac{1}{2}$"`

## 🎨 Advanced Examples

### Complex Fractions

```json
{
  "question": "Simplify: $\frac{\frac{1}{2} + \frac{1}{3}}{\frac{1}{4}}$",
  "choices": [
    "$\frac{10}{3}$",
    "$\frac{5}{6}$",
    "$\frac{3}{10}$",
    "$\frac{6}{5}$"
  ],
  "answer": "$\frac{10}{3}$"
}
```

### Systems of Equations

```json
{
  "question": "Solve the system: $x + y = 5$ and $2x - y = 1$",
  "choices": [
    "$x = 2, y = 3$",
    "$x = 3, y = 2$",
    "$x = 1, y = 4$",
    "$x = 4, y = 1$"
  ],
  "answer": "$x = 2, y = 3$"
}
```

### Calculus

```json
{
  "question": "Find $\frac{d}{dx}(x^2 + 3x + 1)$",
  "choices": ["$2x + 3$", "$2x + 4$", "$x + 3$", "$2x + 1$"],
  "answer": "$2x + 3$"
}
```

## 🚀 Getting Started

1. **Test with simple expressions first**
2. **Use the latex-examples skill** to see working examples
3. **Check the browser console** for any LaTeX parsing errors
4. **Start with basic operations** and gradually add complexity

## 📖 Additional Resources

- [KaTeX Documentation](https://katex.org/docs/supported.html)
- [LaTeX Math Symbols](https://oeis.org/wiki/List_of_LaTeX_mathematical_symbols)
- [MathJax Basic Tutorial](https://docs.mathjax.org/en/latest/basic/mathematics.html)

---

**Happy math battling! 🧮⚔️**
