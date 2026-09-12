import React from "react";

const Header = ({ eyebrow, title, description }) => {
  return <div>
    {eyebrow && (<h1 className="font-bold uppercase text-primary">{eyebrow}</h1>)}

    <h1 className="font-bold text-3xl uppercase">{title}</h1>
    <p>{description}</p>
  </div>;
};

export default Header;
