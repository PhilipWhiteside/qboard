import React, { useState } from "react";
import Modal from "react-modal";
Modal.setAppElement("#Overlay");

import { Action } from "./action";

import Icon from "./Icon";
import BindingModal from "./BindingModal";

export const nameMap = {
  previousPage: "–Page",
  nextPage: "+Page",
  resetStyles: "Reset Styles",
  eraser: "Cut / Eraser",
  halfFilled: "Half Fill",
  transparent: "Unfilled",
  rectangle: "Rect.",
  selectAll: "Select All",
  duplicate: "Clone",
};

const HeaderKey = (props: {
  letter: string;
  label?: string;
  width: string;
}) => {
  return (
    <div className="key" style={{ width: props.width }}>
      <span className="letter">{props.letter}</span>
      <div className="action">
        <span className="unassigned">{props.label || ""}</span>
      </div>
    </div>
  );
};

const Key = (props: {
  letter: string;
  action?: Action;
  callback: (string) => void;
}) => {
  return (
    <button className="key" onClick={(e) => props.callback(props.letter)}>
      <span className="letter">{props.letter}</span>
      <div className="action">
        {props.action && Icon[props.action]}
        <span className={props.action ? undefined : "unassigned"}>
          {nameMap[props.action] || props.action || "none"}
        </span>
      </div>
    </button>
  );
};

const Bindings = (props: { keyMap: any; modifier: string }) => {
  const [bindingModalKeys, setBindingModalKeys] = useState("");
  const [bindingModalAction, setBindingModalAction] = useState(undefined);

  const rows = [
    {
      header: <HeaderKey letter="tab" label="Hide Toolbar" width="5em" />,
      letters: "qwert",
    },
    {
      header: <HeaderKey letter="esc" label="Deselect" width="6.5em" />,
      letters: "asdfg",
    },
    {
      header: <HeaderKey letter="shift" label="Snap" width="8em" />,
      letters: "zxcvb",
    },
  ];

  const getModified = (letter: string) => {
    return props.modifier === "" ? letter : `${props.modifier} + ${letter}`;
  };

  const keyHandler = (letter: string) => {
    setBindingModalKeys(getModified(letter));
    setBindingModalAction(props.keyMap[getModified(letter)]);
  };

  return (
    <>
      <div className="bindings">
        {rows.map(({ header, letters }, index) => (
          <div className="row" key={index}>
            {header}
            {letters.split("").map((letter) => (
              <Key
                letter={letter}
                action={props.keyMap[getModified(letter)]}
                callback={keyHandler}
              />
            ))}
          </div>
        ))}
      </div>
      <BindingModal
        letter={bindingModalKeys}
        action={bindingModalAction}
        close={() => setBindingModalKeys("")}
        callback={(action) => null} />
    </>
  );
};

export default Bindings;