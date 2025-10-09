import React from "react";

interface ScrollLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
}

const ScrollLink: React.FC<ScrollLinkProps> = ({ to, children, ...props }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetElement = document.getElementById(to);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <a href={`#${to}`} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

export default ScrollLink;
