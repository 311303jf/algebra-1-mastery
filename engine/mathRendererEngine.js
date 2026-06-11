/*
==================================================
 Algebra OS — Math Renderer Engine
 Version: 3000
==================================================

Purpose:
- Render exponents correctly.
- Improve readability of algebra expressions.
- Provide one rendering system for the whole platform.
==================================================
*/

function renderMathExpression(text = "") {

  return String(text)

    // multiplication sign
    .replace(/\*/g, " × ")

    // division sign
    .replace(/\//g, " ÷ ")

    // exponent notation x^2 → x<sup>2</sup>
    .replace(/\^(-?\d+)/g, "<sup>$1</sup>");

}

window.AlgebraMathRenderer = {

  renderMathExpression

};
