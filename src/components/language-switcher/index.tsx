import { PrismicNextLink } from "@prismicio/next";

export const LanguageSwitcher = () => {
  return (
    <div className="language-switcher">
      <span className="label">LANGUAGE</span>
      <ul>
        <li>
          <PrismicNextLink href="/" locale="en-us">
            English
          </PrismicNextLink>
        </li>
        <li>
          <PrismicNextLink href="/fr-ca" locale="fr-ca">
            French
          </PrismicNextLink>
        </li>
      </ul>
    </div>
  );
};
