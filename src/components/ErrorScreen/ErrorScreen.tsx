import React from "react";

import "./ErrorScreen.scss";

interface Props {
  title: string;
  description: string;
  problems?: string[];
}

const ErrorScreen: React.FC<Props> = ({ title, description, problems }) => (
  <div className="error-screen">
    <div className="error-screen__panel">
      <h1 className="error-screen__title">{title}</h1>
      <p className="error-screen__description">{description}</p>
      {problems && problems.length > 0 && (
        <ul className="error-screen__problems">
          {problems.map((problem) => (
            <li key={problem} className="error-screen__problem">
              {problem}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default ErrorScreen;
