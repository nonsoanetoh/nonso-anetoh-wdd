import { KeyTextField } from "@prismicio/client";

export const extractLink = (text: string) => {
  const match = text.match(/^(.*)\[(https?:\/\/[^\]]+)\]$/);
  if (match) {
    return {
      text: match[1].trim(),
      link: match[2].trim(),
    };
  }

  return {
    text: text,
    link: null,
  };
};

export const slugify = (text: string | KeyTextField) => {
  return text
    ?.toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};
