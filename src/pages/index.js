/* eslint-disable react/no-unescaped-entities */
import Head from "next/head";
import styles from "@/styles/Chatbot.module.css";
import { useEffect, useRef, useState } from "react";

const defaultMessages = [
  {
    role: "user",
    text: "Hi, I'm a kenji",
  },
  {
    role: "chat",
    text: "My name is ChatGPT, and I am a member of the ChatGPT team. If you　need any help, please don't hesitate to ask. Best regards.",
  },
  {
    role: "user",
    text: "What can you do?",
  },
  {
    role: "chat",
    text: "I can do many things using natural language processing techniques. Mainly, I can do the following Answer questions: like a search engine, you ask a question and I can provide the most accurate answer possible.",
  },
  {
    role: "user",
    text: "What is your LLM?",
  },
  {
    role: "chat",
    text: "My LLM (Knowledge Limitation) is built on information through September 2021. The information and knowledge I hold is based on academic papers, books, websites, online resources, news articles, and various other sources up to that point. I am based on the GPT-3.5 model developed by OpenAI and uses state-of-the-art technology in the field of natural language processing. However, the knowledge I hold is limited and not complete. Please note that it may not reflect new information.",
  },
];

export default function Chatbot() {
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState(defaultMessages);

  useEffect(() => {
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [query]);

  useEffect(() => {
    // 👇️ scroll to bottom every time answer change
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [answer]);

  const handleAnswer = async () => {
    if (!query) {
      alert("Please enter a query.");
      return;
    }

    const setMsgs = messages.concat([
      {
        role: "user",
        text: query,
      },
    ]);
    setMessages(setMsgs);
    setQuery("");
    setAnswer("");
    setLoading(true);

    const prompt = `Use the following passages to provide an answer to the query: "${query}"`;

    const answerResponse = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!answerResponse.ok) {
      setLoading(false);
      throw new Error(answerResponse.statusText);
    }

    const data = answerResponse.body;

    if (!data) {
      return;
    }

    setLoading(false);

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    let answer = "";
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      answer += chunkValue;
      setAnswer((prev) => prev + chunkValue);

      if (done) {
        setAnswer("");
        setMessages(
          setMsgs.concat([
            {
              role: "chat",
              text: answer,
            },
          ])
        );
      }
    }

    textareaRef.current?.focus();
  };

  return (
    <>
      <Head>
        <title>Chatbot</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.chat}>
        <div className={styles.header}>
          <h2>Chatbot</h2>
        </div>
        <div className={styles.messages}>
          {messages.map((message, index) =>
            message.role === "chat" ? (
              <p key={index} className={styles.messages_chat}>
                {message.text}
              </p>
            ) : (
              <p key={index} className={styles.messages_user}>
                {message.text}
              </p>
            )
          )}
          {answer && <p className={styles.messages_chat}>{answer}</p>}
          {loading && (
            <div className={styles.messages_loading}>
              <div className="font-bold text-2xl">loading</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className={styles.footer}>
          <textarea
            ref={textareaRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={handleAnswer}>
            <i className="bx bxs-right-arrow-circle"></i>
          </button>
        </div>
      </main>
    </>
  );
}
