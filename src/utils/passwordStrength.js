export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", tips: [] };

  const checks = [
    { passed: password.length >= 8, tip: "at least 8 characters" },
    {
      passed: /[a-z]/.test(password) && /[A-Z]/.test(password),
      tip: "upper and lower case letters",
    },
    { passed: /\d/.test(password), tip: "a number" },
    { passed: /[^A-Za-z0-9]/.test(password), tip: "a symbol (e.g. !@#$)" },
  ];

  const score = checks.filter((c) => c.passed).length;
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

  return {
    score,
    label: labels[score],
    tips: checks.filter((c) => !c.passed).map((c) => c.tip),
  };
};
