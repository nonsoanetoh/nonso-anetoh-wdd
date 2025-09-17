function makeNumericId() {
  return Date.now() * 1e6 + Math.floor(Math.random() * 1e6);
}

export const parseTrinkets = (data) => {
  return (data || []).map((trinket) => {
    let name = trinket.trinket;
    if (typeof name === "string" && name.includes("**")) {
      name = name.split("**").map((n) => n.trim());
    } else if (typeof name === "string") {
      name = name.trim();
    } else {
      name = name || "";
    }

    const hasCallback =
      typeof trinket.callback === "string" && trinket.callback.trim() !== "";

    return {
      name,
      size: trinket.size || 1,
      style: hasCallback && trinket.type ? "interactive" : "static",
      type: hasCallback ? trinket.type || null : null,
      callback: hasCallback ? trinket.callback.trim() : null,
      id: makeNumericId(),
    };
  });
};
