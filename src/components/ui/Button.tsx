import React, { FC, ReactElement } from 'react';

import './styles/Button.scss';

type IButton = {
  children: any;
  disabled?: boolean;
  loading?: boolean;
  onClick: Function;
};

const Button: FC<IButton> = ({ children, disabled = false, loading = false, onClick }): ReactElement => {
  return (
    <button
      className="button-ui"
      onClick={() => {
        onClick();
      }}
      disabled={disabled || loading}
    >
      {children} {loading && <span>•••</span>}
    </button>
  );
};

export default Button;
