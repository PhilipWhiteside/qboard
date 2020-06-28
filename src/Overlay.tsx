import React from "react";

import QBoard from "./qboard";

interface OverlayProps {
  qboard: QBoard;
}

const Overlay = (props: OverlayProps) => {
  const qboard = props.qboard;

  return (
    <div className="overlay">
      <div className="pagination">
        <button onClick={qboard.pages.newPage}>add</button>
        <button onClick={() => qboard.pages.loadPage(0)}>zero</button>
        <button onClick={() => qboard.pages.loadPage(1)}>one</button>
      </div>
    </div>
  );
};

export default Overlay;