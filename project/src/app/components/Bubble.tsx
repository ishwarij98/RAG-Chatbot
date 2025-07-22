const Bubble = ({ message }) => {
    const {content, role } = message;
    return (
        <div className={`${role}bubble`}>{content}</div>
    )
}

export default Bubble



// import React from "react";
// import type { Message } from "ai";

// type BubbleProps = {
//   message: Message;
// };



// export default function Bubble({ message }: BubbleProps) {
//   return (
//     <div className="bubble">
//       <p>{message.content}</p>
//     </div>
//   );
// }
