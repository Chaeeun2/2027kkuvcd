import { Fragment } from "react";

/* 관리자에서 입력한 줄바꿈을 화면에서도 그대로 줄바꿈한다. */
function MultilineText({ text }) {
  return text.split("\n").map((line, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}

export default MultilineText;
