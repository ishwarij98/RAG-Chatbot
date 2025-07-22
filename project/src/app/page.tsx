'use client';

import f1GPTLogo from "./assets/logo.jpg"
import Image from "next/image";
import { useChat } from "ai/react";
import type { Message } from "ai";
import Bubble from "./components/Bubble";
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionsRow from "./components/PromptSuggestionsRow";

export default function Home() {
  const { append, isLoading, messages, input, handleInputChange, handleSubmit } = useChat();

  // const noMessages = false;
    const noMessages = !messages || messages.length === 0 ;

  const handlePrompt = ( promptText ) => {
    const msg: Message = {
      id: crypto.randomUUID(),
      content: promptText,
      role: "user"
    }
    append(msg)
  }

  return (
    <>
      <main>
        <Image src={f1GPTLogo} width="150" alt="F1GPT Logo" />
        <section className={noMessages ? "" : "populated"}>
          {noMessages ? (<>
            <p className="starter-text">
              F1ChatGPT is your AI-powered pit crew for everything Formula 1.
              Get quick answers, race insights, driver stats, and more anytime, anywhere.
              Built for fans who live life in the fast lane. 🏎️💨
            </p>
            <br />
            <PromptSuggestionsRow onPromptClick={handlePrompt} />
          </>) : (<>
            {messages.map((message, index) => (
              <Bubble key={`message-${index}`} message={message} />
            ))}

            {isLoading && <LoadingBubble />}
          </>
          )}
        </section>
        <form onSubmit={handleSubmit}>
          <input className="question-box" onChange={handleInputChange} value={input} placeholder="Ask me something ..." />
          <input type="submit" />
        </form>
      </main>
    </>
  );
}